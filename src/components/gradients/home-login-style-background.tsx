'use client';

import { useEffect, useState, CSSProperties } from 'react';

export function HomeLoginStyleBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define style classes that were previously in login.css
  const backgroundBaseStyle: CSSProperties = {
    width: '100%',
    position: 'absolute' as const,
    zIndex: -1,
  };

  const gridBgStyle: CSSProperties = {
    ...backgroundBaseStyle,
    background: "url('/assets/background/grid-bg.svg') no-repeat",
  };

  const grainBgStyle: CSSProperties = {
    ...backgroundBaseStyle,
    mixBlendMode: 'overlay' as const,
    background: "url('/assets/background/grain-bg.svg') repeat",
  };

  const loginGradientBgStyle: CSSProperties = {
    ...backgroundBaseStyle,
    background: "url('/assets/background/login-gradient.svg') no-repeat top",
  };

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden">
      {/* Base gradient background with the login gradient SVG */}
      <div style={{ ...loginGradientBgStyle, minHeight: '100vh' }}></div>

      {/* Grain texture overlay */}
      <div style={{ ...grainBgStyle, minHeight: '100vh' }}></div>

      {/* Grid pattern */}
      <div style={{ ...gridBgStyle, minHeight: '100vh' }}></div>

      {/* Additional animated elements only on client-side */}
      {isMounted && (
        <>
          {/* Cyan/teal glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full z-[-5]"
            style={
              {
                background: 'radial-gradient(circle, rgba(168, 240, 248, 0.2) 0%, rgba(168, 240, 248, 0) 70%)',
                filter: 'blur(60px)',
                opacity: 0.6,
                animation: 'pulse 8s ease-in-out infinite',
              } as CSSProperties
            }
          />

          {/* Yellow highlight */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full z-[-5]"
            style={
              {
                background: 'radial-gradient(circle, rgba(255, 248, 0, 0.15) 0%, rgba(255, 248, 0, 0) 70%)',
                filter: 'blur(80px)',
                opacity: 0.4,
                animation: 'pulse 10s ease-in-out infinite alternate',
              } as CSSProperties
            }
          />

          {/* Additional floating elements */}
          <div
            className="absolute top-[15%] left-[20%] w-[300px] h-[300px] rounded-full z-[-5]"
            style={
              {
                background: 'radial-gradient(circle, rgba(21, 227, 227, 0.1) 0%, rgba(21, 227, 227, 0) 70%)',
                filter: 'blur(70px)',
                opacity: 0.3,
                animation: 'floatUp 15s ease-in-out infinite',
              } as CSSProperties
            }
          />

          <div
            className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full z-[-5]"
            style={
              {
                background: 'radial-gradient(circle, rgba(255, 248, 0, 0.1) 0%, rgba(255, 248, 0, 0) 70%)',
                filter: 'blur(50px)',
                opacity: 0.3,
                animation: 'floatDown 12s ease-in-out infinite',
              } as CSSProperties
            }
          />

          {/* Login-style yellow highlight line at top */}
          <div
            className="absolute top-[120px] left-1/2 -translate-x-1/2 h-[1px] w-[300px] z-[-5]"
            style={
              {
                background:
                  'linear-gradient(90deg, rgba(255, 255, 255, 0) 15%, rgba(255, 248, 0, 0.6) 50%, rgba(255, 255, 255, 0) 85%)',
                opacity: 0.6,
                filter: 'blur(1px)',
              } as CSSProperties
            }
          />
        </>
      )}
    </div>
  );
}
