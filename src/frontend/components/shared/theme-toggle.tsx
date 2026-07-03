"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/frontend/components/ui/button";

export function ThemeToggle({
  loadingLabel,
  lightLabel,
  darkLabel,
}: {
  loadingLabel: string;
  lightLabel: string;
  darkLabel: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="icon" aria-label={loadingLabel} disabled>
        <Moon data-icon="inline-start" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={nextTheme === "light" ? lightLabel : darkLabel}
      onClick={() => setTheme(nextTheme)}
    >
      {resolvedTheme === "dark" ? (
        <Sun data-icon="inline-start" />
      ) : (
        <Moon data-icon="inline-start" />
      )}
    </Button>
  );
}
