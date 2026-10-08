import { ImageResponse } from 'next/og';
import { DraftingCard, loadOgFonts } from '@/lib/og';

export const alt = 'Mesh — React, Vue and Svelte islands for Livewire 4';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <DraftingCard
      kicker="Title sheet · General arrangement"
      title="Mesh"
      description="React, Vue and Svelte islands for Livewire 4. Livewire owns the state; Mesh carries it across the boundary."
      drawingNo="MESH-000"
      sheet="01"
    />,
    { ...size, fonts: await loadOgFonts() },
  );
}
