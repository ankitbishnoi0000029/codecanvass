"use client";

import dynamic from "next/dynamic";

const BackgroundRemover = dynamic(
  () => import("@/components/sections/background-remover").then((m) => ({ default: m.BackgroundRemover })),
  { ssr: false }
);

export function BackgroundRemoverClient() {
  return <BackgroundRemover />;
}
