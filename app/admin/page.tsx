"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Chapter { _id: string; chapterId: string; chapterName: string; name: string; city: string; choName: string; volunteerCount: number; sessionCount: number; attendanceRate: number; health: string; status: string; }
interface Activity { _id: string; text: string; type: string; createdByName: string; createdAt: string; chapterId: string; }

export default function AdminPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterHealth, setFilterHealth] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin" && u.role !== "core") { router.push("/dashboard"); return; }
    loadData();
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadData() {
    try {
      const [chRes, actRes] = await Promise.all([
        fetch("/api/chapters", { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch("/api/activities?limit=20", { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const chData = await chRes.json();
      const actData = await actRes.json();
      setChapters(Array.isArray(chData) ? chData : []);
      setActivities(Array.isArray(actData) ? actData : []);
    } catch {}
  }

  const totalVolunteers = chapters.reduce((sum, ch) => sum + (ch.volunteerCount || 0), 0);
  const totalSessions = chapters.reduce((sum, ch) => sum + (ch.sessionCount || 0), 0);
  const avgAttendance = chapters.length > 0 ? Math.round(chapters.reduce((sum, ch) => sum + (ch.attendanceRate || 0), 0) / chapters.length) : 0;
  const healthy = chapters.filter((ch) => ch.health === "healthy").length;
  const warning = chapters.filter((ch) => ch.health === "needs_attention").length;
  const critical = chapters.filter((ch) => ch.health === "critical").length;

  const filteredChapters = filterHealth === "all" ? chapters : chapters.filter((ch) => ch.health === filterHealth);

  const healthBadge = (h: string) => {
    if (h === "healthy") return { label: "\u{1F7E2} Healthy", cls: "active-status" };
    if (h === "needs_attention") return { label: "\u{1F7E1} Needs Attention", cls: "inactive-status" };
    return { label: "\u{1F534} Critical", cls: "inactive-status" };
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#128737; Admin Dashboard</h1>
            <p>Network-wide overview and management</p>
          </div>
          <div className="adm-admin-badge">&#128081; Admin</div>
        </div>

        <div className="adm-global-stats">
          <div className="adm-stat-card"><h3>{chapters.length}</h3><p>Total Chapters</p></div>
          <div className="adm-stat-card"><h3>{totalVolunteers}</h3><p>Total Volunteers</p></div>
          <div className="adm-stat-card"><h3>{totalSessions}</h3><p>Total Sessions</p></div>
          <div className="adm-stat-card"><h3>{avgAttendance}%</h3><p>Avg Attendance</p></div>
        </div>

        <div className="adm-two-col">
          <div className="adm-panel">
            <h2>&#129658; Network Health</h2>
            <div className="adm-health-overview">
              <div className="health-item healthy"><span>{healthy}</span><p>Healthy</p></div>
              <div className="health-item warning"><span>{warning}</span><p>Warning</p></div>
              <div className="health-item critical"><span>{critical}</span><p>Critical</p></div>
            </div>
          </div>
          <div className="adm-panel">
            <h2>&#128640; Quick Actions</h2>
            <div className="adm-actions">
              <a href="https://sessionops.makeadiff.in" target="_blank" className="adm-action-btn">&#128197; Session Ops</a>
              <a href="https://volunteering.makeadiff.in/cm-admin/auth/login" target="_blank" className="adm-action-btn">&#128218; Better Together</a>
              <a href="/alerts" className="adm-action-btn">&#128276; View Alerts</a>
            </div>
          </div>
        </div>

        <div className="adm-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>&#128203; Chapter Performance</h2>
            <div className="filter-chips">
              {["all", "healthy", "needs_attention", "critical"].map((f) => (
                <button key={f} className={`chip ${filterHealth === f ? "active" : ""}`} onClick={() => setFilterHealth(f)}>
                  {f === "all" ? "All" : f === "healthy" ? "\u{1F7E2} Healthy" : f === "needs_attention" ? "\u{1F7E1} Warning" : "\u{1F534} Critical"}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-perf-table">
              <thead>
                <tr><th>Chapter</th><th>City</th><th>CHO</th><th>Volunteers</th><th>Sessions</th><th>Attendance</th><th>Health</th></tr>
              </thead>
              <tbody>
                {filteredChapters.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No chapters found.</td></tr>
                ) : filteredChapters.map((ch) => {
                  const hb = healthBadge(ch.health);
                  return (
                    <tr key={ch._id}>
                      <td>{ch.chapterName || ch.name}</td>
                      <td>{ch.city}</td>
                      <td>{ch.choName || "Vacant"}</td>
                      <td>{ch.volunteerCount || 0}</td>
                      <td>{ch.sessionCount || 0}</td>
                      <td>{ch.attendanceRate || 0}%</td>
                      <td><span className={`status ${hb.cls}`}>{hb.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-panel">
          <h2>&#128196; Recent Activity</h2>
          {activities.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "8px 0" }}>No recent activity across the network.</p>
          ) : (
            <ul className="adm-activity">
              {activities.map((a) => (
                <li key={a._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <span style={{ flex: 1, fontSize: "14px" }}>{a.text}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{a.createdByName}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
