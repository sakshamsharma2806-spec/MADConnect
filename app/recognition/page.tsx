"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Volunteer { _id: string; name: string; chapterId: string; }
interface AttendanceSession { _id: string; date: string; present: string[]; chapterId: string; }

export default function RecognitionPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [period, setPeriod] = useState("month");
  const [spotlightModal, setSpotlightModal] = useState(false);
  const [spotlightVol, setSpotlightVol] = useState("");
  const [spotlightAchievement, setSpotlightAchievement] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const [customSpotlight, setCustomSpotlight] = useState<{ name: string; achievement: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    loadData(u.chapterId);
    const saved = localStorage.getItem(`spotlight_${u.chapterId}`);
    if (saved) setCustomSpotlight(JSON.parse(saved));
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadData(chapterId: string) {
    try {
      const [vRes, aRes] = await Promise.all([
        fetch(`/api/volunteers?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`/api/attendance?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const vData = await vRes.json();
      setVolunteers(Array.isArray(vData) ? vData : []);
      const aData = await aRes.json();
      setSessions(Array.isArray(aData) ? aData : []);
    } catch {}
  }

  const getAttendanceRate = (volName: string) => {
    let total = 0, present = 0;
    sessions.forEach((s) => { total++; if (s.present.includes(volName)) present++; });
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const sorted = [...volunteers].sort((a, b) => getAttendanceRate(b.name) - getAttendanceRate(a.name));

  const spotlightName = customSpotlight?.name || sorted[0]?.name || "";
  const spotlightRate = getAttendanceRate(spotlightName);
  const spotlightBadge = spotlightRate >= 90 ? "\u{1F3C6} Gold" : spotlightRate >= 70 ? "\u{1F948} Silver" : spotlightRate >= 50 ? "\u{1F949} Bronze" : "\u2B50 Starter";

  const getBadge = (rate: number) => {
    if (rate >= 90) return "\u{1F3C6} Gold";
    if (rate >= 70) return "\u{1F948} Silver";
    if (rate >= 50) return "\u{1F949} Bronze";
    return "\u2B50 Starter";
  };

  const handleFeature = () => {
    if (!spotlightVol) { setToastMsg("Please select a volunteer."); return; }
    const data = { name: spotlightVol, achievement: spotlightAchievement || "Outstanding contribution" };
    setCustomSpotlight(data);
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      localStorage.setItem(`spotlight_${u.chapterId}`, JSON.stringify(data));
    }
    setSpotlightModal(false);
    setSpotlightVol("");
    setSpotlightAchievement("");
    setToastMsg("Volunteer spotlight updated!");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleClearSpotlight = () => {
    setCustomSpotlight(null);
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      localStorage.removeItem(`spotlight_${u.chapterId}`);
    }
    setToastMsg("Spotlight reset to default.");
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#127942; Recognition</h1>
            <p>Celebrate our amazing volunteers and chapters</p>
          </div>
          <div className="period-selector">
            <button className={`period-btn ${period === "month" ? "active" : ""}`} onClick={() => setPeriod("month")}>This Month</button>
            <button className={`period-btn ${period === "quarter" ? "active" : ""}`} onClick={() => setPeriod("quarter")}>This Quarter</button>
            <button className={`period-btn ${period === "all" ? "active" : ""}`} onClick={() => setPeriod("all")}>All Time</button>
          </div>
        </div>

        <div className="rec-grid">
          <div className="rec-section spotlight-section">
            <h2>&#11088; Volunteer Spotlight</h2>
            {spotlightName ? (
              <div className="spotlight-card">
                <h3>{spotlightName}</h3>
                <p>{spotlightRate}% attendance &middot; {spotlightBadge}</p>
                {customSpotlight?.achievement && (
                  <p style={{ fontSize: "13px", marginTop: "6px", fontStyle: "italic", color: "var(--text-secondary)" }}>
                    &ldquo;{customSpotlight.achievement}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", padding: "16px" }}>No volunteers yet.</p>
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button className="primary-btn" onClick={() => setSpotlightModal(true)}>Change Spotlight</button>
              {customSpotlight && (
                <button className="secondary-btn" onClick={handleClearSpotlight}>Reset</button>
              )}
            </div>
          </div>

          <div className="rec-section leaderboard-section">
            <h2>&#127941; Best Chapter Leaderboard</h2>
            {sorted.slice(0, 5).map((v, i) => (
              <div key={v._id} className="leaderboard-row">
                <span className="rank">{i + 1}</span>
                <span className="name">{v.name}</span>
                <span className="rate">{getAttendanceRate(v.name)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rec-section badges-section">
          <h2>&#127991; Milestone Badges</h2>
          <div className="badges-grid">
            {[{ label: "100% Attendance", icon: "\u{1F31F}" }, { label: "10+ Sessions", icon: "\u{1F4DA}" }, { label: "Volunteer Champion", icon: "\u{1F3C5}" }, { label: "MAD Star", icon: "\u2B50" }].map((b) => (
              <div key={b.label} className="badge-card">
                <span className="badge-icon">{b.icon}</span>
                <p>{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rec-section top-performers-section">
          <h2>&#128200; Top Performers</h2>
          <div className="performers-table-wrapper">
            <table className="performers-table">
              <thead>
                <tr><th>Rank</th><th>Volunteer</th><th>Attendance</th><th>Badge</th></tr>
              </thead>
              <tbody>
                {sorted.map((v, i) => (
                  <tr key={v._id}>
                    <td>{i + 1}</td>
                    <td>{v.name}</td>
                    <td>{getAttendanceRate(v.name)}%</td>
                    <td>{getBadge(getAttendanceRate(v.name))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <div className={`modal ${spotlightModal ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setSpotlightModal(false); }}>
        <div className="modal-content">
          <button className="modal-close" onClick={() => setSpotlightModal(false)}>&times;</button>
          <h2>Feature a Volunteer</h2>
          <p className="modal-desc">Select a volunteer to feature in the Spotlight section.</p>
          <div className="form-group">
            <label>Select Volunteer</label>
            <select value={spotlightVol} onChange={(e) => setSpotlightVol(e.target.value)}>
              <option value="">-- Select --</option>
              {volunteers.map((v) => <option key={v._id} value={v.name}>{v.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Achievement</label>
            <input type="text" placeholder="e.g. 100% attendance this month" value={spotlightAchievement} onChange={(e) => setSpotlightAchievement(e.target.value)} />
          </div>
          <div className="modal-buttons">
            <button className="secondary-btn" onClick={() => setSpotlightModal(false)}>Cancel</button>
            <button className="primary-btn" onClick={handleFeature}>Feature Volunteer</button>
          </div>
        </div>
      </div>

      {toastMsg && <div className="toast show" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
