import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import SceneMount from "@/components/three/SceneMount";

export const metadata: Metadata = {
  title: "Portfolio — placeholder",
  description: "Personal portfolio. Placeholder copy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SceneMount />
        <SmoothScroll />
        <Cursor />
        {/* Everything HTML floats above the WebGL backdrop. */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
