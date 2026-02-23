import { NextResponse } from "next/server";

import { getInstallManifest } from "@/lib/data/install-manifests";

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function GET(request: Request, context: RouteContext) {
  const rawParams = await context.params;
  const slug = rawParams.slug;
  const { searchParams } = new URL(request.url);
  const version = searchParams.get("version") ?? undefined;

  const manifest = getInstallManifest(slug, version);
  if (!manifest) {
    return NextResponse.json({ error: "Install manifest not found" }, { status: 404 });
  }

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
