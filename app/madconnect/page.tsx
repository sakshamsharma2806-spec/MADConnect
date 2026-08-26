"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Chapter { _id: string; chapterId: string; chapterName: string; name: string; city: string; choName: string; choEmail: string; volunteerCount: number; activeVolunteers: number; sessionCount: number; attendanceRate: number; health: string; status: string; }

export default function MadConnectPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [compareList, setCompareList] = useState<Chapter[]>([]);

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
    (ch.chapterName || ch.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (ch.city || "").toLowerCase().includes(search.toLowerCase()) ||
    (ch.choName || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalChapters = chapters.length;
  const activeChapters = chapters.filter((ch) => ch.status === "active").length;
  const healthy = chapters.filter((ch) => ch.health === "healthy").length;
  const warning = chapters.filter((ch) => ch.health === "needs_attention").length;
  const critical = chapters.filter((ch) => ch.health === "critical").length;

  const healthBadge = (h: string) => {
    if (h === "healthy") return { label: "\u{1F7E2} Healthy", cls: "active-status" };
    if (h === "needs_attention") return { label: "\u{1F7E1} Needs Attention", cls: "inactive-status" };
    return { label: "\u{1F534} Critical", cls: "inactive-status" };
  };

  const toggleCompare = (ch: Chapter) => {
    if (compareList.find((c) => c._id === ch._id)) {
      setCompareList(compareList.filter((c) => c._id !== ch._id));
    } else if (compareList.length < 2) {
      setCompareList([...compareList, ch]);
    } else {
      setCompareList([compareList[1], ch]);
    }
  };

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

        {compareList.length === 2 && (
          <div className="panel" style={{ marginBottom: "20px" }}>
            <h2>&#128200; Chapter Comparison</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {compareList.map((ch) => {
                const hb = healthBadge(ch.health);
                return (
                  <div key={ch._id} style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "12px" }}>
                    <h3 style={{ marginBottom: "8px" }}>{ch.chapterName || ch.name}</h3>
                    <p><strong>City:</strong> {ch.city}</p>
                    <p><strong>CHO:</strong> {ch.choName || "N/A"}</p>
                    <p><strong>Volunteers:</strong> {ch.volunteerCount || 0}</p>
                    <p><strong>Sessions:</strong> {ch.sessionCount || 0}</p>
                    <p><strong>Attendance:</strong> {ch.attendanceRate || 0}%</p>
                    <p><strong>Health:</strong> <span className={`status ${hb.cls}`}>{hb.label}</span></p>
                  </div>
                );
              })}
            </div>
            <button className="secondary-btn" style={{ marginTop: "12px" }} onClick={() => setCompareList([])}>Clear Comparison</button>
          </div>
        )}

        <div className="mc-grid">
          {filtered.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No chapters found.</p>
          ) : filtered.map((ch) => {
            const hb = healthBadge(ch.health);
            return (
              <div key={ch._id} className="mc-card" onClick={() => setSelectedChapter(ch)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3>{ch.chapterName || ch.name}</h3>
                  <span className={`status ${hb.cls}`} style={{ fontSize: "11px" }}>{hb.label}</span>
                </div>
                <p className="mc-city">{ch.city}</p>
                <p><strong>CHO:</strong> {ch.choName || "N/A"}</p>
                <p><strong>Volunteers:</strong> {ch.volunteerCount || 0}</p>
                <p><strong>Sessions:</strong> {ch.sessionCount || 0}</p>
                <p><strong>Attendance:</strong> {ch.attendanceRate || 0}%</p>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  {ch.choEmail && (
                    <a href={`mailto:${ch.choEmail}`} className="action-link" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={(e) => e.stopPropagation()}>
                      &#9993; Contact CHO
                    </a>
                  )}
                  <button className="secondary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={(e) => { e.stopPropagation(); toggleCompare(ch); }}>
                    {compareList.find((c) => c._id === ch._id) ? "Remove" : "Compare"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className={`mc-modal ${selectedChapter ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setSelectedChapter(null); }}>
        <div className="mc-modal-content">
          <button className="mc-modal-close" onClick={() => setSelectedChapter(null)}>&times;</button>
          {selectedChapter && (
            <div>
              <h2>{selectedChapter.chapterName || selectedChapter.name}</h2>
              <p><strong>City:</strong> {selectedChapter.city}</p>
              <p><strong>CHO:</strong> {selectedChapter.choName || "N/A"}</p>
              <p><strong>Email:</strong> {selectedChapter.choEmail || "N/A"}</p>
              <p><strong>Volunteers:</strong> {selectedChapter.volunteerCount || 0}</p>
              <p><strong>Sessions:</strong> {selectedChapter.sessionCount || 0}</p>
              <p><strong>Attendance Rate:</strong> {selectedChapter.attendanceRate || 0}%</p>
              <p><strong>Health:</strong> <span className={`status ${healthBadge(selectedChapter.health).cls}`}>{healthBadge(selectedChapter.health).label}</span></p>
              {selectedChapter.choEmail && (
                <a href={`mailto:${selectedChapter.choEmail}`} className="primary-btn" style={{ display: "inline-block", marginTop: "16px", textDecoration: "none" }}>
                  &#9993; Contact CHO
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {toastMsg && <div className="toast active" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
