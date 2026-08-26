"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Alert { id: string; type: string; title: string; message: string; time: string; read: boolean; }

const defaultAlerts: Alert[] = [
  { id: "1", type: "warning", title: "Low Attendance", message: "Volunteer attendance dropped below 50% this week.", time: "2 hours ago", read: false },
  { id: "2", type: "success", title: "New Volunteer", message: "A new volunteer has joined the chapter.", time: "5 hours ago", read: false },
  { id: "3", type: "info", title: "Session Scheduled", message: "Next session is scheduled for tomorrow.", time: "1 day ago", read: true },
  { id: "4", type: "danger", title: "Missing Attendance", message: "Attendance for last week was not submitted.", time: "2 days ago", read: false },
];

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
  }, [router]);

  const filtered = alerts.filter((a) => filter === "all" || a.type === filter);
  const unread = alerts.filter((a) => !a.read).length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const successCount = alerts.filter((a) => a.type === "success").length;

  const typeIcons: Record<string, string> = { warning: "\u26A0\uFE0F", success: "\u2705", info: "\u2139\uFE0F", danger: "\u274C" };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#128276; Alerts & Notifications</h1>
            <p>Stay informed about chapter activity across the network</p>
          </div>
        </div>

        <div className="alt-toolbar">
          <div className="alt-filters">
            {["all", "warning", "success", "info", "danger"].map((f) => (
              <button key={f} className={`alt-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "warning" ? "\u26A0 Warnings" : f === "success" ? "\u2705 Success" : f === "info" ? "\u2139 Info" : "\u274C Danger"}
              </button>
            ))}
          </div>
          <button className="alt-clear-btn" onClick={() => setAlerts([])}>&#128465; Clear All</button>
        </div>

        <div className="alt-summary">
          <div className="alt-summary-card"><h3>{unread}</h3><p>Unread</p></div>
          <div className="alt-summary-card"><h3>{warningCount}</h3><p>Warnings</p></div>
          <div className="alt-summary-card"><h3>{successCount}</h3><p>Success</p></div>
        </div>

        <div className="alt-list">
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No alerts.</p>
          ) : filtered.map((a) => (
            <div key={a.id} className={`alt-item alt-${a.type} ${a.read ? "read" : ""}`}>
              <span className="alt-icon">{typeIcons[a.type]}</span>
              <div className="alt-content">
                <h3>{a.title}</h3>
                <p>{a.message}</p>
                <span className="alt-time">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
