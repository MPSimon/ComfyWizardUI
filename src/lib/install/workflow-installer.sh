#!/usr/bin/env bash
set -Eeuo pipefail

WORKFLOW=""
VERSION=""
API_BASE="https://www.comfywizard.tech"
COMFY_ROOT="/workspace/ComfyUI"
DRY_RUN=0

usage() {
  cat <<'USAGE'
Usage: workflow-installer --workflow <slug> [--version <semver>] [--api-base <url>] [--comfy-root <path>] [--dry-run]

Environment:
  HF_TOKEN         optional, used for gated Hugging Face repos
  CIVITAI_TOKEN    optional, required for gated Civitai direct downloads
  ARTIFACT_AUTH    optional, used as Authorization header for private URL sources

Exit codes:
  0 = success (or optional failures only)
  2 = required dependency failures
  3 = manifest fetch/validation failure
  4 = workflow file download/install failure
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workflow)
      WORKFLOW="$2"; shift 2 ;;
    --version)
      VERSION="$2"; shift 2 ;;
    --api-base)
      API_BASE="$2"; shift 2 ;;
    --comfy-root)
      COMFY_ROOT="$2"; shift 2 ;;
    --dry-run)
      DRY_RUN=1; shift 1 ;;
    -h|--help)
      usage
      exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 3 ;;
  esac
done

if [[ -z "$WORKFLOW" ]]; then
  echo "--workflow is required" >&2
  usage
  exit 3
fi

need_bin() {
  local b="$1"
  if ! command -v "$b" >/dev/null 2>&1; then
    echo "Missing required command: $b" >&2
    exit 3
  fi
}

need_bin curl
need_bin jq
need_bin git

PYTHON_BIN=""
if command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
else
  echo "Missing required command: python or python3" >&2
  exit 3
fi

sha256_file() {
  local file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
    return 0
  fi
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
    return 0
  fi
  return 1
}

api_no_slash="${API_BASE%/}"
manifest_url="${api_no_slash}/api/install/workflows/${WORKFLOW}"
if [[ -n "$VERSION" ]]; then
  manifest_url="${manifest_url}?version=${VERSION}"
fi

manifest_tmp="$(mktemp)"
if ! curl -fsSL "$manifest_url" -o "$manifest_tmp"; then
  echo "Failed to fetch manifest: $manifest_url" >&2
  exit 3
fi

if ! jq -e '.schemaVersion == "1.0"' "$manifest_tmp" >/dev/null; then
  echo "Invalid manifest schemaVersion" >&2
  exit 3
fi

workflow_file_url="$(jq -r '.workflow.workflowFileUrl // ""' "$manifest_tmp")"
workflow_file_name="$(jq -r '.workflow.workflowFileName // ""' "$manifest_tmp")"
if [[ -z "$workflow_file_url" || -z "$workflow_file_name" ]]; then
  echo "Manifest missing workflow file information" >&2
  exit 3
fi

workflows_dir="${COMFY_ROOT}/user/default/workflows/ComfyWizard"
models_dir="${COMFY_ROOT}/models"
custom_nodes_dir="${COMFY_ROOT}/custom_nodes"

mkdir -p "$workflows_dir" "$models_dir" "$custom_nodes_dir"

required_failures=0
optional_failures=0
required_success=0
optional_success=0
custom_node_failures=0
downloaded_count=0
skipped_count=0

download_to_file() {
  local url="$1"
  local target="$2"
  local use_civitai_token="${3:-0}"
  local tmp="${target}.part"
  mkdir -p "$(dirname "$target")"

  local -a curl_args
  curl_args=(-fSL --retry 2 --retry-delay 1)

  if [[ -n "${ARTIFACT_AUTH:-}" ]]; then
    curl_args+=(-H "Authorization: ${ARTIFACT_AUTH}")
  fi
  if [[ "$use_civitai_token" == "1" && -n "${CIVITAI_TOKEN:-}" ]]; then
    curl_args+=(-H "Authorization: Bearer ${CIVITAI_TOKEN}")
    curl_args+=(-H "User-Agent: ComfyWizardInstaller/1.0")
  fi

  if ! curl "${curl_args[@]}" -o "$tmp" "$url"; then
    rm -f "$tmp"
    return 1
  fi
  mv -f "$tmp" "$target"
  return 0
}

install_dependency() {
  local dep_json="$1"
  local source filename target_rel_dir required expected_sha256 repo_id revision model_version_id url

  source="$(jq -r '.source' <<<"$dep_json")"
  filename="$(jq -r '.filename' <<<"$dep_json")"
  target_rel_dir="$(jq -r '.targetRelDir' <<<"$dep_json")"
  required="$(jq -r '.required' <<<"$dep_json")"
  expected_sha256="$(jq -r '.expectedSha256 // ""' <<<"$dep_json")"
  repo_id="$(jq -r '.repoId // ""' <<<"$dep_json")"
  revision="$(jq -r '.revision // ""' <<<"$dep_json")"
  model_version_id="$(jq -r '.modelVersionId // ""' <<<"$dep_json")"
  url="$(jq -r '.url // ""' <<<"$dep_json")"

  local target="${models_dir}/${target_rel_dir}/$(basename "$filename")"
  local dep_label="${source}:${filename} -> ${target_rel_dir}"

  if [[ -f "$target" ]]; then
    if [[ -n "$expected_sha256" ]]; then
      local actual_sha
      actual_sha="$(sha256_file "$target" || true)"
      if [[ -n "$actual_sha" && "${actual_sha,,}" == "${expected_sha256,,}" ]]; then
        echo "skip (hash ok): ${dep_label}"
        skipped_count=$((skipped_count + 1))
        return 0
      fi
    else
      echo "skip (exists): ${dep_label}"
      skipped_count=$((skipped_count + 1))
      return 0
    fi
  fi

  if (( DRY_RUN == 1 )); then
    echo "dry-run: would install ${dep_label}"
    return 0
  fi

  mkdir -p "$(dirname "$target")"

  local ok=0
  if [[ "$source" == "huggingface" ]]; then
    if ! command -v hf >/dev/null 2>&1; then
      echo "hf CLI missing; cannot download ${dep_label}" >&2
      ok=1
    else
      local tmpdir
      tmpdir="$(mktemp -d)"
      local -a hf_args
      hf_args=(download "$repo_id" "$filename" --local-dir "$tmpdir")
      if [[ -n "$revision" ]]; then
        hf_args+=(--revision "$revision")
      fi
      if ! hf "${hf_args[@]}" >/tmp/workflow-installer-hf.log 2>&1; then
        echo "HF download failed for ${dep_label}" >&2
        ok=1
      else
        local downloaded
        downloaded="$(find "$tmpdir" -type f -name "$(basename "$filename")" | head -n 1)"
        if [[ -z "$downloaded" ]]; then
          echo "HF download output not found for ${dep_label}" >&2
          ok=1
        else
          cp -f "$downloaded" "$target"
        fi
      fi
      rm -rf "$tmpdir"
    fi
  elif [[ "$source" == "civitai" ]]; then
    if [[ -z "$model_version_id" ]]; then
      if [[ -z "$url" ]]; then
        echo "Civitai dependency missing modelVersionId/url: ${dep_label}" >&2
        ok=1
      elif ! download_to_file "$url" "$target" 1; then
        echo "Civitai URL download failed for ${dep_label}" >&2
        ok=1
      fi
    else
      local civitai_url="https://civitai.com/api/download/models/${model_version_id}"
      if ! download_to_file "$civitai_url" "$target" 1; then
        echo "Civitai download failed for ${dep_label}" >&2
        ok=1
      fi
    fi
  elif [[ "$source" == "url" ]]; then
    if [[ -z "$url" ]]; then
      echo "URL dependency missing url field: ${dep_label}" >&2
      ok=1
    elif ! download_to_file "$url" "$target" 0; then
      echo "URL download failed for ${dep_label}" >&2
      ok=1
    fi
  else
    echo "Unsupported dependency source '$source' for ${dep_label}" >&2
    ok=1
  fi

  if [[ "$ok" != "0" ]]; then
    if [[ "$required" == "true" ]]; then
      required_failures=$((required_failures + 1))
    else
      optional_failures=$((optional_failures + 1))
    fi
    return 1
  fi

  if [[ -n "$expected_sha256" ]]; then
    local actual_sha
    actual_sha="$(sha256_file "$target" || true)"
    if [[ -z "$actual_sha" || "${actual_sha,,}" != "${expected_sha256,,}" ]]; then
      echo "Checksum mismatch for ${dep_label}" >&2
      if [[ "$required" == "true" ]]; then
        required_failures=$((required_failures + 1))
      else
        optional_failures=$((optional_failures + 1))
      fi
      return 1
    fi
  fi

  echo "installed: ${dep_label}"
  downloaded_count=$((downloaded_count + 1))
  if [[ "$required" == "true" ]]; then
    required_success=$((required_success + 1))
  else
    optional_success=$((optional_success + 1))
  fi
  return 0
}

install_custom_node() {
  local node_json="$1"
  local name repo_url ref req_file required
  name="$(jq -r '.name' <<<"$node_json")"
  repo_url="$(jq -r '.repoUrl' <<<"$node_json")"
  ref="$(jq -r '.ref // ""' <<<"$node_json")"
  req_file="$(jq -r '.requirementsFile // ""' <<<"$node_json")"
  required="$(jq -r '.required' <<<"$node_json")"

  local node_dir="${custom_nodes_dir}/${name}"

  if (( DRY_RUN == 1 )); then
    echo "dry-run: would install custom node ${name}"
    return 0
  fi

  if [[ ! -d "$node_dir/.git" ]]; then
    if ! git clone "$repo_url" "$node_dir" >/tmp/workflow-installer-git.log 2>&1; then
      echo "custom node clone failed: ${name}" >&2
      if [[ "$required" == "true" ]]; then
        required_failures=$((required_failures + 1))
      else
        custom_node_failures=$((custom_node_failures + 1))
      fi
      return 1
    fi
  fi

  if [[ -n "$ref" ]]; then
    if ! git -C "$node_dir" fetch --all --tags >/tmp/workflow-installer-git.log 2>&1 || \
       ! git -C "$node_dir" checkout "$ref" >/tmp/workflow-installer-git.log 2>&1; then
      echo "custom node checkout failed: ${name}@${ref}" >&2
      if [[ "$required" == "true" ]]; then
        required_failures=$((required_failures + 1))
      else
        custom_node_failures=$((custom_node_failures + 1))
      fi
      return 1
    fi
  fi

  if [[ -n "$req_file" && -f "${node_dir}/${req_file}" ]]; then
    if ! "$PYTHON_BIN" -m pip install -r "${node_dir}/${req_file}" >/tmp/workflow-installer-pip.log 2>&1; then
      echo "custom node requirements install failed: ${name}" >&2
      if [[ "$required" == "true" ]]; then
        required_failures=$((required_failures + 1))
      else
        custom_node_failures=$((custom_node_failures + 1))
      fi
      return 1
    fi
  fi

  echo "custom node ready: ${name}"
  return 0
}

echo "Installing workflow '${WORKFLOW}' from ${api_no_slash}"

if (( DRY_RUN == 0 )); then
  workflow_target="${workflows_dir}/${workflow_file_name}"
  if ! download_to_file "$workflow_file_url" "$workflow_target" 0; then
    echo "Failed to download workflow file: ${workflow_file_url}" >&2
    exit 4
  fi
else
  echo "dry-run: would install workflow file ${workflow_file_name}"
fi

while IFS= read -r dep; do
  [[ -z "$dep" ]] && continue
  install_dependency "$dep" || true
done < <(jq -c '.dependencies[]?' "$manifest_tmp")

while IFS= read -r node; do
  [[ -z "$node" ]] && continue
  install_custom_node "$node" || true
done < <(jq -c '.customNodes[]?' "$manifest_tmp")

echo "----------------------------------------"
echo "Install summary"
echo "Downloaded files: $downloaded_count"
echo "Skipped files: $skipped_count"
echo "Required success: $required_success"
echo "Optional success: $optional_success"
echo "Required failures: $required_failures"
echo "Optional/custom-node warnings: $optional_failures + $custom_node_failures"
echo "----------------------------------------"

if (( required_failures > 0 )); then
  echo "Install finished with required failures." >&2
  exit 2
fi

echo "Install finished successfully."
exit 0
