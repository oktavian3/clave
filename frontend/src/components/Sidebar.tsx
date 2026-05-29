"use client";

import { useState } from "react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  walletAddress?: string;
  isConnected?: boolean;
  role?: "client" | "worker" | null;
  onOpenProfile?: () => void;
  onDisconnect?: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: GridIcon },
  { id: "projects", label: "Projects", icon: FolderIcon },
  { id: "reputation", label: "Reputation", icon: StarIcon },
  { id: "payroll", label: "Payroll", icon: WalletIcon },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({
  activePage,
  onNavigate,
  walletAddress,
  isConnected,
  role,
  onOpenProfile,
  onDisconnect,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-out ${
        collapsed ? "w-[72px]" : "w-[240px]"
      }`}
      style={{
        background: "#FEFEFE",
        boxShadow: "4px 0 14px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-base font-bold text-primary-500">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Clave</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-sm flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-400">
            {collapsed ? (
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-500 shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5]"
                  : "text-neutral-500 hover:bg-surface-muted hover:text-neutral-700"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} active={active} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-neutral-400 hover:bg-surface-muted hover:text-neutral-600 transition-all w-full"
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* Wallet Info */}
        {isConnected && !collapsed && (
          <div className="mt-2 space-y-1">
            {/* Role badge */}
            {role && (
              <div className="px-3 py-1.5 rounded-sm bg-surface-muted text-xs text-neutral-500 text-center">
                {role === "client" ? "👤 Client" : "👷 Worker"}
              </div>
            )}

            {/* Address */}
            <div className="px-3 py-2 rounded-sm neu-input text-xs font-mono text-neutral-500 truncate">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={onOpenProfile}
                className="flex-1 py-1.5 rounded-sm text-xs text-neutral-400 hover:bg-surface-muted hover:text-neutral-600 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={onDisconnect}
                className="flex-1 py-1.5 rounded-sm text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Icons ───

function GridIcon({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
    </svg>
  );
}

function FolderIcon({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M3 5.5C3 4.67 3.67 4 4.5 4H7.09a1.5 1.5 0 011.06.44L9.5 5.79a1.5 1.5 0 001.06.44H13.5c.83 0 1.5.67 1.5 1.5v5.77c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 013 13.5v-8z" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
    </svg>
  );
}

function StarIcon({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 2l2.24 4.54 5.01.73-3.62 3.53.85 4.99L9 13.27l-4.48 2.52.85-4.99L1.75 7.27l5.01-.73L9 2z" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="4" width="13" height="10.5" rx="2" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
      <path d="M12 8.5a1 1 0 100 2 1 1 0 000-2z" fill={active ? "#A87BA9" : "currentColor"} />
      <path d="M5 4V3.5A1.5 1.5 0 016.5 2h5A1.5 1.5 0 0113 3.5V4" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" />
    </svg>
  );
}

function ActivityIcon({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <polyline points="2,12 5,8 8,10 11,5 16,7" stroke={active ? "#A87BA9" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.4 3.4l1.41 1.41M13.19 13.19l1.41 1.41M3.4 14.6l1.41-1.41M13.19 4.81l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
