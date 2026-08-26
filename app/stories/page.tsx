"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Story { _id: string; title: string; content: string; tags: string[]; status: string; author: string; chapterId: string; createdAt: string; }

export default function StoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ chapterId: string; chapterName: string; name: string } | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [viewStory, setViewStory] = useState<Story | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", tags: "", status: "published" });
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadStories(u.chapterId);
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadStories(chapterId: string) {
    try {
      const res = await fetch(`/api/stories?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch {}
  }

  const filtered = stories.filter((s) => {
    const matchSearch = s.title?.toLowerCase().includes(search.toLowerCase()) || s.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { setToastMsg("Please fill title and content."); return; }
    if (!user) return;
    const data = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), author: user.name, chapterId: user.chapterId };
    try {
      if (editingId) {
        await fetch(`/api/stories/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
        setToastMsg("Story updated!");
      } else {
        await fetch("/api/stories", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
        setToastMsg("Story created!");
      }
      setModalOpen(false); setForm({ title: "", content: "", tags: "", status: "published" }); setEditingId(null);
      if (user) loadStories(user.chapterId);
    } catch { setToastMsg("Failed to save story."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story?")) return;
    try {
      await fetch(`/api/stories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      setToastMsg("Story deleted!");
      if (user) loadStories(user.chapterId);
    } catch { setToastMsg("Failed to delete."); }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#128221; Chapter Stories</h1>
            <p>Share and read stories from across MAD chapters</p>
          </div>
          <button className="primary-btn" onClick={() => { setEditingId(null); setForm({ title: "", content: "", tags: "", status: "published" }); setModalOpen(true); }}>&#9998; Write Story</button>
        </div>

        <div className="stories-filters">
          <div className="search-box">
            <input type="text" placeholder="Search by title or tags..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="status-toggles">
            {["all", "published", "draft", "pending_review"].map((s) => (
              <button key={s} className={`toggle-btn ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
                {s === "all" ? "All" : s === "published" ? "Published" : s === "draft" ? "Drafts" : "Pending Review"}
              </button>
            ))}
          </div>
        </div>

        <div className="stories-grid">
          {filtered.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No stories found.</p>
          ) : filtered.map((s) => (
            <div key={s._id} className="story-card" onClick={() => { setViewStory(s); setViewModal(true); }}>
              <div className="story-header">
                <h3>{s.title}</h3>
                <span className={`story-status ${s.status}`}>{s.status === "published" ? "Published" : s.status === "draft" ? "Draft" : "Pending"}</span>
              </div>
              <p className="story-excerpt">{s.content?.substring(0, 120)}...</p>
              <div className="story-meta">
                <span>{s.author}</span>
                <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</span>
              </div>
              <div className="story-tags">
                {s.tags?.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
              <div className="story-actions" onClick={(e) => e.stopPropagation()}>
                <button className="edit-btn" onClick={() => { setEditingId(s._id); setForm({ title: s.title, content: s.content, tags: s.tags?.join(", ") || "", status: s.status }); setModalOpen(true); }}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(s._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className={`modal ${modalOpen ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="modal-content">
          <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
          <h2>{editingId ? "Edit Story" : "Write a New Story"}</h2>
          <div className="form-group"><label>Title</label><input type="text" placeholder="Enter story title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label>Content</label><textarea rows={10} placeholder="Write your story here..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="form-group"><label>Tags (comma-separated)</label><input type="text" placeholder="e.g. best practices, volunteer experience" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
            </select>
          </div>
          <div className="modal-buttons">
            <button className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="primary-btn" onClick={handleSave}>Save Story</button>
          </div>
        </div>
      </div>

      <div className={`modal ${viewModal ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setViewModal(false); }}>
        <div className="modal-content modal-lg">
          <button className="modal-close" onClick={() => setViewModal(false)}>&times;</button>
          {viewStory && (
            <div>
              <h2>{viewStory.title}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>By {viewStory.author} &middot; {viewStory.createdAt ? new Date(viewStory.createdAt).toLocaleDateString() : ""}</p>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>{viewStory.content}</div>
              <div className="story-tags" style={{ marginTop: "16px" }}>{viewStory.tags?.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          )}
        </div>
      </div>

      {toastMsg && <div className="toast show" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
