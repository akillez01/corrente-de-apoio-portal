"use client";

import { initMotion, refreshMotion } from "@/lib/motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initMotion();
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => refreshMotion());
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
