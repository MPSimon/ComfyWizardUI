import { readFileSync } from "node:fs";
import path from "node:path";

export function GET() {
  const scriptPath = path.join(process.cwd(), "src/lib/install/workflow-installer.sh");
  const script = readFileSync(scriptPath, "utf8");

  return new Response(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
