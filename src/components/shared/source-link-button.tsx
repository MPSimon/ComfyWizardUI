import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DependencyItem } from "@/lib/types/workflow";

type SourceKind = "huggingface" | "civitai" | "private";

function getSourceKind(dependency: DependencyItem): SourceKind {
  const url = dependency.sourceUrl?.toLowerCase() ?? "";

  if (url.includes("huggingface.co") || dependency.source === "huggingface") {
    return "huggingface";
  }
  if (url.includes("civitai.com") || dependency.source === "civitai") {
    return "civitai";
  }
  return "private";
}

function sourceMeta(kind: SourceKind) {
  if (kind === "huggingface") {
    return {
      label: "Hugging Face",
      logoUrl: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
    };
  }
  if (kind === "civitai") {
    return {
      label: "Civitai",
      logoUrl: "/brands/civitai.png",
    };
  }
  return {
    label: "External",
    logoUrl: null,
  };
}

export function SourceLinkButton({ dependency }: { dependency: DependencyItem }) {
  if (!dependency.sourceUrl) {
    return null;
  }

  const kind = getSourceKind(dependency);
  const meta = sourceMeta(kind);

  return (
    <Button asChild variant="outline" size="sm" className="h-8 gap-2">
      <a href={dependency.sourceUrl} target="_blank" rel="noreferrer">
        {meta.logoUrl ? (
          <Image
            src={meta.logoUrl}
            alt={`${meta.label} logo`}
            width={14}
            height={14}
            className="h-3.5 w-3.5 rounded-sm object-contain"
          />
        ) : null}
        <span>{meta.label} link</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}

export function sourcePriority(dependency: DependencyItem) {
  const kind = getSourceKind(dependency);
  if (kind === "huggingface") return 0;
  if (kind === "civitai") return 1;
  return 2;
}
