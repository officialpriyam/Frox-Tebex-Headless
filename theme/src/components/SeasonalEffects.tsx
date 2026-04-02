import { useEffect, useState } from "react";
import { useActiveSeasonalTheme, useSiteSettings } from "@/hooks/useSettings";

interface Snowflake {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
}

export function SeasonalEffects() {
  const { data: settings } = useSiteSettings();
  const activeTheme = useActiveSeasonalTheme();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (!activeTheme) return;

    const themeId = activeTheme.id;
    const themeSettings = activeTheme.settings || {};

    if ((themeId === "christmas" || themeId === "winter") && themeSettings.snowEnabled !== false) {
      const intensity = themeSettings.snowIntensity || 50;
      const flakes: Snowflake[] = [];
      for (let i = 0; i < intensity; i++) {
        flakes.push({
          id: i,
          x: Math.random() * 100,
          size: Math.random() * 4 + 2,
          delay: Math.random() * 10,
          duration: Math.random() * 10 + 10,
        });
      }
      setSnowflakes(flakes);
    } else {
      setSnowflakes([]);
    }
  }, [activeTheme]);

  if (!activeTheme) return null;

  const themeId = activeTheme.id;

  return (
    <>
      {(themeId === "christmas" || themeId === "winter") && snowflakes.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute rounded-full bg-white opacity-80"
              style={{
                left: `${flake.x}%`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes snowfall {
              0% {
                transform: translateY(-10px) rotate(0deg);
                opacity: 0.8;
              }
              100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0.2;
              }
            }
          `}</style>
        </div>
      )}

      {themeId === "christmas" && (
        <div className="fixed bottom-4 right-4 pointer-events-none z-40 opacity-50">
          <div className="text-6xl">
            <svg viewBox="0 0 100 100" className="w-24 h-24 fill-current text-white">
              <circle cx="50" cy="20" r="12" />
              <circle cx="50" cy="45" r="18" />
              <circle cx="50" cy="78" r="22" />
              <rect x="47" y="5" width="6" height="8" className="fill-orange-500" />
            </svg>
          </div>
        </div>
      )}

      {themeId === "halloween" && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-900/10" />
        </div>
      )}

      {themeId === "autumn" && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-900/5" />
        </div>
      )}

      {themeId === "summer" && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />
        </div>
      )}

      {themeId === "diwali" && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-purple-500/5" />
        </div>
      )}
    </>
  );
}
