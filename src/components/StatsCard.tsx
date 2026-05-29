"use client";

import { useEffect, useState } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  delay?: number;
}

export default function StatsCard({ title, value, change, changeType = "neutral", icon, delay = 0 }: StatsCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`rounded-sm p-5 transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{
        background: "#FEFEFE",
        boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-sm bg-primary/30 flex items-center justify-center text-primary-500">
          {icon}
        </div>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              changeType === "up"
                ? "bg-success text-success-text"
                : changeType === "down"
                ? "bg-error text-error-text"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {changeType === "up" ? "↑" : changeType === "down" ? "↓" : "•"} {change}
          </span>
        )}
      </div>
      <p className="text-caption text-neutral-400 mb-1">{title}</p>
      <p className="text-h2 font-semibold tracking-tight">{value}</p>
    </div>
  );
}
