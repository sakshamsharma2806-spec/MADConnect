"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Volunteer { _id: string; name: string; phone: string; shelter: string; chapterId: string; status: string; }
interface AttendanceSession { _id: string; date: string; shelter: string; chapterId: string; present: string[]; }

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ chapterId: string; chapterName: string } | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [detailsSession, setDetailsSession] = useState<AttendanceSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadData(u.chapterId);
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadData(chapterId: string) {
    try {
      const [vRes, aRes] = await Promise.all([
        fetch(`/api/volunteers?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`/api/attendance?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      setVolunteers(Array.isArray(await vRes.json()) ? (await vRes.json()) : []);
      const atts = await aRes.json();
      setSessions(Array.isArray(atts) ? atts : []);
    } catch { setToastMsg("Failed to load data."); }
  }

  const handleSave = async () => {
    if (!selectedDate) { setToastMsg("Please select a date."); return; }
    if (!user) return;
    if (sessions.find((s) => s.date === selectedDate)) { setToastMsg("Attendance for this date already recorded."); return; }
    const present = Object.entries(checked).filter(([, v]) => v).map(([name]) => name);
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ date: selectedDate, shelter: user.chapterName, chapterId: user.chapterId, present }),
      });
      setToastMsg("Attendance saved!"); setChecked({}); setSelectedDate(""); loadData(user.chapterId);
    } catch { setToastMsg("Failed to save attendance."); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const presentCount = Object.values(checked).filter(Boolean).length;
  const absentCount = volunteers.length - presentCount;

  if (!user) return null;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#128197; Attendance</h1>
            <p>Mark attendance for <strong>{user.chapterName}</strong></p>
          </div>
        </div>

        <div className="attendance-controls">
          <div className="control">
            <label>Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        <div className="attendance-card">
          <h2>Volunteer Attendance</h2>
          {volunteers.map((v) => (
            <div key={v._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
              <span style={{ fontSize: "14px" }}>{v.name}</span>
              <input type="checkbox" checked={!!checked[v.name]} onChange={(e) => setChecked({ ...checked, [v.name]: e.target.checked })} />
            </div>
          ))}
        </div>

        <div className="summary">
          <div className="summary-card">
            <h3>{presentCount}</h3>
            <p>Present</p>
          </div>
          <div className="summary-card">
            <h3>{absentCount}</h3>
            <p>Absent</p>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>Save Attendance</button>

        <div className="history-section">
          <h2>Attendance History</h2>
          {sessions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "16px 0" }}>No attendance sessions yet.</p>
          ) : (
            [...sessions].reverse().map((s) => (
              <div key={s._id} style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => { setDetailsSession(s); setDetailsModal(true); }}>
                <div>
                  <h3 style={{ fontSize: "15px", marginBottom: "4px" }}>{formatDate(s.date)}</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{s.shelter} &middot; Present: {s.present.length}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className={`modal ${detailsModal ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setDetailsModal(false); }}>
        <div className="modal-content">
          <h2>Attendance Details</h2>
          {detailsSession && (
            <div>
              <p><strong>Date:</strong> {formatDate(detailsSession.date)}</p>
              <p><strong>Shelter:</strong> {detailsSession.shelter}</p>
              <p><strong>Present:</strong> {detailsSession.present.length} volunteers</p>
              <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                {detailsSession.present.map((name) => <li key={name}>{name}</li>)}
              </ul>
            </div>
          )}
          <button className="save-btn" onClick={() => setDetailsModal(false)}>Close</button>
        </div>
      </div>

      {toastMsg && <div className="toast active" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
