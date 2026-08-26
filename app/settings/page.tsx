"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string; chapterName: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <header>
          <div className="welcome">
            <h1>&#9881; Settings</h1>
            <p>Manage your account and preferences</p>
          </div>
        </header>

        <section className="main-content">
          <div className="settings-grid">
            <div className="settings-card">
              <h2>Account</h2>
              <div className="settings-item">
                <label>Name</label>
                <p id="settingsName">{user.name || "Not logged in"}</p>
              </div>
              <div className="settings-item">
                <label>Email</label>
                <p id="settingsEmail">{user.email || "Not logged in"}</p>
              </div>
              <div className="settings-item">
                <label>Role</label>
                <p id="settingsRole">{user.role === "admin" ? "Core Member / Admin" : "Chapter Organizer"}</p>
              </div>
            </div>

            <div className="settings-card">
              <h2>Chapter</h2>
              <div className="settings-item">
                <label>Chapter Name</label>
                <p id="settingsChapterName">{user.chapterName || "-"}</p>
              </div>
            </div>

            <div className="settings-card">
              <h2>Actions</h2>
              <button className="settings-btn logout-btn" onClick={handleLogout}>&#128682; Logout</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
