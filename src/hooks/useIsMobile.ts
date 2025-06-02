import { useEffect, useState } from "react";

/**
 * Detects if the current screen width is below a custom breakpoint.
 * Default: 1024px (tablet và mobile).
 */
export function useIsMobile(breakpoint = 1100): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [breakpoint]);

  return isMobile;  
}
  