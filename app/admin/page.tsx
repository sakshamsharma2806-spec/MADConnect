"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Chapter { _id: string; name: string; city: string; cho: string; volunteerCount: number; activeVolunteers: number; sessionCount: number; attendanceRate: number; }

export default function AdminPage() {
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
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
    } catch {}
  }

  const totalVolunteers = chapters.reduce((sum, ch) => sum + (ch.volunteerCount || 0), 0);
  const totalSessions = chapters.reduce((sum, ch) => sum + (ch.sessionCount || 0), 0);
  const avgAttendance = chapters.length > 0 ? Math.round(chapters.reduce((sum, ch) => sum + (ch.attendanceRate || 0), 0) / chapters.length) : 0;
  const healthy = chapters.filter((ch) => (ch.attendanceRate || 0) >= 70).length;
  const warning = chapters.filter((ch) => (ch.attendanceRate || 0) >= 40 && (ch.attendanceRate || 0) < 70).length;
  const critical = chapters.filter((ch) => (ch.attendanceRate || 0) < 40).length;

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
            <canvas id="healthChart" height="160"></canvas>
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
          <h2>&#128203; Chapter Performance Summary</h2>
          <div className="adm-table-wrap">
            <table className="adm-perf-table">
              <thead>
                <tr><th>Chapter</th><th>City</th><th>Volunteers</th><th>Sessions</th><th>Attendance</th></tr>
              </thead>
              <tbody>
                {chapters.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No chapters found.</td></tr>
                ) : chapters.map((ch) => (
                  <tr key={ch._id}>
                    <td>{ch.name}</td>
                    <td>{ch.city}</td>
                    <td>{ch.volunteerCount || 0}</td>
                    <td>{ch.sessionCount || 0}</td>
                    <td>{ch.attendanceRate || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-two-col">
          <div className="adm-panel">
            <h2>&#128196; Recent Activity</h2>
            <ul className="adm-activity">
              <li style={{ color: "var(--text-muted)", padding: "8px 0" }}>No recent activity.</li>
            </ul>
          </div>
          <div className="adm-panel">
            <h2>&#128221; Audit Log</h2>
            <ul className="adm-activity">
              <li style={{ color: "var(--text-muted)", padding: "8px 0" }}>No audit entries.</li>
            </ul>
          </div>
        </div>

        <div className="adm-panel">
          <h2>&#128101; User Management</h2>
          <div className="adm-placeholder">
            <p>User management features coming soon. Manage roles, invite new users, and control access from here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
