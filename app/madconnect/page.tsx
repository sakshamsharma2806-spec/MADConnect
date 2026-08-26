"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Chapter { _id: string; name: string; city: string; cho: string; volunteerCount: number; activeVolunteers: number; sessionCount: number; attendanceRate: number; }

export default function MadConnectPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    loadChapters();
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadChapters() {
    try {
      const res = await fetch("/api/chapters", { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : []);
    } catch { setToastMsg("Failed to load chapters."); }
  }

  const filtered = chapters.filter((ch) =>
    ch.name?.toLowerCase().includes(search.toLowerCase()) ||
    ch.city?.toLowerCase().includes(search.toLowerCase()) ||
    ch.cho?.toLowerCase().includes(search.toLowerCase())
  );

  const totalChapters = chapters.length;
  const healthy = chapters.filter((ch) => (ch.attendanceRate || 0) >= 70).length;
  const warning = chapters.filter((ch) => (ch.attendanceRate || 0) >= 40 && (ch.attendanceRate || 0) < 70).length;
  const critical = chapters.filter((ch) => (ch.attendanceRate || 0) < 40).length;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#127758; MAD Connect</h1>
            <p>Connect with all MAD chapters across India</p>
          </div>
        </div>

        <div className="mc-search-bar">
          <input type="text" placeholder="Search chapters by name, city, or CHO..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="mc-quick-links">
          <a href="https://sessionops.makeadiff.in" target="_blank" className="mc-quick-link">&#128197; Session Ops</a>
          <a href="https://volunteering.makeadiff.in/cm-admin/auth/login" target="_blank" className="mc-quick-link">&#128218; Better Together</a>
        </div>

        <div className="mc-network-stats">
          <div className="mc-net-stat"><h3>{totalChapters}</h3><p>Total Chapters</p></div>
          <div className="mc-net-stat mc-net-healthy"><h3>{healthy}</h3><p>Healthy</p></div>
          <div className="mc-net-stat mc-net-warning"><h3>{warning}</h3><p>Needs Attention</p></div>
          <div className="mc-net-stat mc-net-critical"><h3>{critical}</h3><p>Critical</p></div>
        </div>

        <div className="mc-grid">
          {filtered.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No chapters found.</p>
          ) : filtered.map((ch) => (
            <div key={ch._id} className="mc-card" onClick={() => setSelectedChapter(ch)}>
              <h3>{ch.name}</h3>
              <p className="mc-city">{ch.city}</p>
              <p><strong>CHO:</strong> {ch.cho || "N/A"}</p>
              <p><strong>Volunteers:</strong> {ch.volunteerCount || 0}</p>
              <p><strong>Attendance:</strong> {ch.attendanceRate || 0}%</p>
            </div>
          ))}
        </div>
      </main>

      <div className={`mc-modal ${selectedChapter ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setSelectedChapter(null); }}>
        <div className="mc-modal-content">
          <button className="mc-modal-close" onClick={() => setSelectedChapter(null)}>&times;</button>
          {selectedChapter && (
            <div>
              <h2>{selectedChapter.name}</h2>
              <p><strong>City:</strong> {selectedChapter.city}</p>
              <p><strong>CHO:</strong> {selectedChapter.cho || "N/A"}</p>
              <p><strong>Volunteers:</strong> {selectedChapter.volunteerCount || 0}</p>
              <p><strong>Sessions:</strong> {selectedChapter.sessionCount || 0}</p>
              <p><strong>Attendance Rate:</strong> {selectedChapter.attendanceRate || 0}%</p>
            </div>
          )}
        </div>
      </div>

      {toastMsg && <div className="toast active" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
