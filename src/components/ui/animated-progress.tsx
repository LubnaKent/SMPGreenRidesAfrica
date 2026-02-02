"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  duration?: number;
  delay?: number;
  className?: string;
  barClassName?: string;
}

export function AnimatedProgress({
  value,
  max = 100,
  duration = 1000,
  delay = 0,
  className,
  barClassName,
}: AnimatedProgressProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const targetWidth = Math.min((value / max) * 100, 100);

    const timeoutId = setTimeout(() => {
      setWidth(targetWidth);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, max, delay]);

  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all ease-out",
          barClassName
        )}
        style={{
          width: `${width}%`,
          transitionDuration: `${duration}ms`,
        }}
      />
    </div>
  );
}
