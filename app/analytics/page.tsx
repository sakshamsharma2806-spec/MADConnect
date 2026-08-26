"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; chapterId: string; chapterName: string } | null>(null);
  const [volCount, setVolCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [attendancePct, setAttendancePct] = useState("0%");

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
      const vols = await vRes.json();
      const atts = await aRes.json();
      const volArr = Array.isArray(vols) ? vols : [];
      const attArr = Array.isArray(atts) ? atts : [];
      setVolCount(volArr.length);
      setSessionCount(attArr.length);
      let totalPossible = 0, totalPresent = 0;
      attArr.forEach((s: { present: string[] }) => { totalPossible += volArr.length; totalPresent += s.present.length; });
      setAttendancePct(totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) + "%" : "0%");
    } catch {}
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <header>
          <div className="welcome">
            <h1>&#128202; Analytics</h1>
            <p>Insights from your chapter</p>
            <p className="chapter-name">{user.chapterName} Chapter</p>
          </div>
          <div className="chapter-card">
            <h2>Your Chapter</h2>
            <div className="chapter-details">
              <p><strong>CHO:</strong> {user.name}</p>
              <p><strong>Chapter:</strong> {user.chapterName}</p>
              <p><strong>Status:</strong> <span className="active-status">&#128994; Active</span></p>
            </div>
          </div>
        </header>

        <section className="main-content">
          <div className="analytics-cards">
            <div className="analytics-card">
              <h3>&#128101; Total Volunteers</h3>
              <h2>{volCount}</h2>
              <p>Total registered volunteers</p>
            </div>
            <div className="analytics-card">
              <h3>&#128197; Attendance Sessions</h3>
              <h2>{sessionCount}</h2>
              <p>Total attendance records</p>
            </div>
            <div className="analytics-card">
              <h3>&#128200; Overall Attendance</h3>
              <h2>{attendancePct}</h2>
              <p>Average attendance across sessions</p>
            </div>
          </div>

          <div className="analytics-section">
            <h2>Volunteer Status</h2>
            <div className="chart-container">
              <canvas id="volunteerChart"></canvas>
            </div>
          </div>

          <div className="analytics-section">
            <h2>Attendance History</h2>
            <canvas id="attendanceChart"></canvas>
          </div>
        </section>
      </main>
    </div>
  );
}
