"use client";

import { useCountUp } from "@/hooks/use-count-up";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  delay = 0,
  className,
  suffix = "",
  prefix = "",
}: AnimatedNumberProps) {
  const animatedValue = useCountUp(value, { duration, delay });

  return (
    <span className={className}>
      {prefix}
      {animatedValue.toLocaleString()}
      {suffix}
    </span>
  );
}
