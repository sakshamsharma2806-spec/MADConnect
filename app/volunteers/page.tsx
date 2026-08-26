"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Volunteer { _id: string; name: string; phone: string; shelter: string; chapterId: string; status: string; attendedSessions: number; totalSessions: number; attendancePercentage: number; certificateEligible: boolean; }

export default function VolunteersPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ chapterId: string; chapterName: string } | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", status: "Active" });
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadVolunteers(u.chapterId);
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadVolunteers(chapterId: string) {
    try {
      const res = await fetch(`/api/volunteers?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch { setToastMsg("Failed to load volunteers."); }
  }

  const filtered = volunteers.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.phone.includes(search));

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setToastMsg("Please fill all fields."); return; }
    if (form.phone.length !== 10 || isNaN(Number(form.phone))) { setToastMsg("Phone must be 10 digits."); return; }
    if (!user) return;
    const data = { ...form, shelter: user.chapterName, chapterId: user.chapterId };
    try {
      if (editingId) {
        await fetch(`/api/volunteers/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
        setToastMsg("Volunteer updated!");
      } else {
        await fetch("/api/volunteers", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
        setToastMsg("Volunteer added!");
      }
      setModalOpen(false); setForm({ name: "", phone: "", status: "Active" }); setEditingId(null);
      loadVolunteers(user.chapterId);
    } catch { setToastMsg("Failed to save volunteer."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this volunteer?")) return;
    try {
      await fetch(`/api/volunteers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      setToastMsg("Volunteer deleted!");
      if (user) loadVolunteers(user.chapterId);
    } catch { setToastMsg("Failed to delete."); }
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#128101; Volunteers</h1>
            <p>Manage volunteers of <strong>{user.chapterName}</strong></p>
          </div>
          <button id="addVolunteerBtn" onClick={() => { setEditingId(null); setForm({ name: "", phone: "", status: "Active" }); setModalOpen(true); }}>+ Add Volunteer</button>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search volunteers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Phone</th>
                <th>Shelter</th>
                <th>Attendance</th>
                <th>Certificate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#888" }}>No Volunteers Found</td></tr>
              ) : filtered.map((v) => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.shelter}</td>
                  <td>{v.attendancePercentage || 0}%</td>
                  <td>
                    <span className={`status ${(v.certificateEligible) ? "active-status" : "inactive-status"}`}>
                      {v.certificateEligible ? "Eligible" : "Not Eligible"}
                    </span>
                  </td>
                  <td><span className={`status ${v.status === "Active" ? "active-status" : "inactive-status"}`}>{v.status}</span></td>
                  <td>
                    <button className="edit-btn" onClick={() => { setEditingId(v._id); setForm({ name: v.name, phone: v.phone, status: v.status }); setModalOpen(true); }}>{"\u270F"}</button>
                    <button className="delete-btn" onClick={() => handleDelete(v._id)}>{"\u{1F5D1}"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <div className={`modal ${modalOpen ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="modal-content">
          <h2>{editingId ? "Edit Volunteer" : "Add New Volunteer"}</h2>
          <div className="form-group">
            <label>Volunteer Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={10} />
          </div>
          <div className="form-group">
            <label>Shelter Home</label>
            <p style={{ fontWeight: 600, marginTop: 4 }}>{user.chapterName}</p>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="modal-buttons">
            <button id="cancelBtn" onClick={() => setModalOpen(false)}>Cancel</button>
            <button id="saveVolunteerBtn" className="primary-btn" onClick={handleSave}>{editingId ? "Update" : "Save Volunteer"}</button>
          </div>
        </div>
      </div>

      {toastMsg && <div className="toast show" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
