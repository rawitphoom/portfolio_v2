"use client";

/**
 * SceneMount — client-only shim for <Scene/>.
 *
 * Next 15 forbids `dynamic(..., { ssr: false })` from server components
 * (which layouts are by default). We put the dynamic import in this
 * client component and the server layout just renders <SceneMount/>.
 */

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneMount() {
  const pathname = usePathname();
  // The landing page ("/") uses the ShaderGradient backdrop instead of the
  // butterfly scene. Show the butterflies everywhere else.
  if (pathname === "/") return null;
  return <Scene />;
}
