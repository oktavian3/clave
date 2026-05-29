"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

interface Profile {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

const defaultProfile: Profile = {
  name: "",
  role: "",
  bio: "",
  avatar: "",
};

export default function ProfileSettings({ role }: { role: "client" | "worker" }) {
  const { address } = useAccount();
  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`clave_profile_${address}`);
      return saved ? JSON.parse(saved) : defaultProfile;
    }
    return defaultProfile;
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(`clave_profile_${address}`, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-h2 font-semibold">Profile Settings</h2>
        <p className="text-caption text-neutral-400 mt-1">
          {role === "client" ? "Manage your client profile" : "Manage your worker profile"}
        </p>
      </div>

      <div className="rounded-sm p-6 space-y-5" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center text-3xl overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{profile.name ? profile.name.charAt(0).toUpperCase() : role === "client" ? "👤" : "👷"}</span>
            )}
          </div>
          <div>
            <p className="font-semibold">{profile.name || "Unnamed"}</p>
            <p className="text-xs text-neutral-400 font-mono">{address?.slice(0, 10)}...{address?.slice(-6)}</p>
            <p className="text-xs text-primary-500 mt-0.5">{role === "client" ? "Client" : "Worker"}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">Display Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder={role === "client" ? "My Company" : "John Doe"}
              className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">
              {role === "client" ? "Company / Project Name" : "Specialization"}
            </label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder={role === "client" ? "DeFi Protocol" : "Smart Contract Developer"}
              className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder={role === "client" ? "Building the future of DeFi..." : "Solidity developer with 5 years experience..."}
              rows={3}
              className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 mb-1.5 block">Profile Picture URL</label>
            <input
              type="url"
              value={profile.avatar}
              onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 rounded-sm text-sm neu-input focus:outline-none"
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-sm bg-primary text-primary-500 text-sm font-medium shadow-[2px_2px_5px_#D4A8D6,-2px_-2px_5px_#F5EAF5] hover:shadow-[inset_2px_2px_4px_#D4A8D6,inset_-2px_-2px_4px_#F5EAF5] transition-all duration-200"
          >
            {saved ? "✓ Saved!" : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="rounded-sm p-6" style={{ background: "#FEFEFE", boxShadow: "3px 3px 8px #E5E4DE, -3px -3px 8px #FFFFFF" }}>
        <h3 className="text-h3 font-semibold mb-3">Wallet</h3>
        <div className="space-y-2">
          <div className="flex justify-between p-3 rounded-sm bg-surface-muted">
            <span className="text-sm text-neutral-400">Address</span>
            <span className="text-sm font-mono">{address}</span>
          </div>
          <div className="flex justify-between p-3 rounded-sm bg-surface-muted">
            <span className="text-sm text-neutral-400">Network</span>
            <span className="text-sm">Arc Testnet (5042002)</span>
          </div>
          <div className="flex justify-between p-3 rounded-sm bg-surface-muted">
            <span className="text-sm text-neutral-400">Role</span>
            <span className="text-sm">{role === "client" ? "Client" : "Worker"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
