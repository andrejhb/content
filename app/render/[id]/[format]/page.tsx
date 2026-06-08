import { notFound } from "next/navigation";
import { getCreative } from "@/lib/creatives";
import { FORMAT_MAP } from "@/lib/formats";
import { CreativeRender } from "@/components/templates/registry";

// Chrome-free render surface. Playwright sets the viewport to the format's exact
// pixels, navigates here, and screenshots the [data-canvas] element.
export const dynamic = "force-dynamic";

export default async function RenderPage({
  params,
}: {
  params: Promise<{ id: string; format: string }>;
}) {
  const { id, format } = await params;
  const brief = await getCreative(id);
  const fmt = FORMAT_MAP[format];
  if (!brief || !fmt) notFound();
  return <CreativeRender brief={brief} w={fmt.w} h={fmt.h} />;
}
