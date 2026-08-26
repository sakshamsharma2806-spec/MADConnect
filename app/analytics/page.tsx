"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Volunteer {
  _id: string; name: string; phone: string; shelter: string; chapterId: string;
  status: string; attendedSessions: number; totalSessions: number;
  attendancePercentage: number; certificateEligible: boolean;
}
interface AttendanceSession { _id: string; date: string; shelter: string; chapterId: string; present: string[]; }

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; chapterId: string; chapterName: string } | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);

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
      setVolunteers(Array.isArray(vols) ? vols : []);
      setSessions(Array.isArray(atts) ? atts : []);
    } catch {}
  }

  const volCount = volunteers.length;
  const sessionCount = sessions.length;
  let totalPossible = 0, totalPresent = 0;
  sessions.forEach((s) => { totalPossible += volCount; totalPresent += s.present.length; });
  const attendancePct = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
  const eligibleCount = volunteers.filter((v) => v.certificateEligible).length;
  const activeCount = volunteers.filter((v) => v.status === "Active").length;
  const inactiveCount = volCount - activeCount;

  const statusPieData = {
    labels: ["Active", "Inactive"],
    datasets: [{
      data: [activeCount, inactiveCount],
      backgroundColor: ["#22c55e", "#ef4444"],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const certPieData = {
    labels: ["Eligible", "Not Eligible"],
    datasets: [{
      data: [eligibleCount, volCount - eligibleCount],
      backgroundColor: ["#3b82f6", "#f59e0b"],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sessionLabels = sortedSessions.map((s, i) => {
    const d = new Date(s.date);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  });
  const sessionPresentCounts = sortedSessions.map((s) => s.present.length);
  const sessionAbsentCounts = sortedSessions.map((s) => volCount - s.present.length);

  const attendanceLineData = {
    labels: sessionLabels,
    datasets: [
      {
        label: "Present",
        data: sessionPresentCounts,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#22c55e",
      },
      {
        label: "Absent",
        data: sessionAbsentCounts,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.10)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#ef4444",
      },
    ],
  };

  const volBarData = {
    labels: volunteers.map((v) => v.name.split(" ")[0]),
    datasets: [{
      label: "Attendance %",
      data: volunteers.map((v) => v.attendancePercentage || 0),
      backgroundColor: volunteers.map((v) =>
        v.attendancePercentage >= 60 ? "#22c55e" : v.attendancePercentage >= 40 ? "#f59e0b" : "#ef4444"
      ),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { callback: (v: string | number) => Number(v) + "%" } },
      x: { grid: { display: false } },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { padding: 16, usePointStyle: true } },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" as const, labels: { padding: 16, usePointStyle: true } } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

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

        <section className="content-body">
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
              <h2>{attendancePct}%</h2>
              <p>Average attendance across sessions</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="analytics-section">
              <h2>Volunteer Attendance</h2>
              <div className="chart-container">
                <Bar data={volBarData} options={barOptions} />
              </div>
            </div>
            <div className="analytics-section">
              <h2>Attendance Over Time</h2>
              <div className="chart-container">
                <Line data={attendanceLineData} options={lineOptions} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="analytics-section">
              <h2>Volunteer Status</h2>
              <div className="chart-container" style={{ height: "280px", display: "flex", justifyContent: "center" }}>
                <Pie data={statusPieData} options={pieOptions} />
              </div>
            </div>
            <div className="analytics-section">
              <h2>Certificate Eligibility</h2>
              <div className="chart-container" style={{ height: "280px", display: "flex", justifyContent: "center" }}>
                <Pie data={certPieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
