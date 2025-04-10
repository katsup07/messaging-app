import { useEffect, useState } from "react";

// Check if screen is mobile-sized and its orientation
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);

  const checkOrientation = () => 
    setIsPortrait(window.matchMedia("(orientation: portrait)").matches);

  useEffect(() => {
    // Initial checks
    checkIfMobile();
    checkOrientation();
    
    // Event listeners
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return { isMobile, isPortrait, isLandscape: !isPortrait };
}