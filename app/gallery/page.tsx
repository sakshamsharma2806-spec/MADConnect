"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface GalleryItem { _id: string; title: string; description: string; category: string; color: string; chapterId: string; createdAt: string; }

export default function GalleryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ chapterId: string; chapterName: string } | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [category, setCategory] = useState("all");
  const [uploadModal, setUploadModal] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "class", color: "#e61e4d" });
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadGallery(u.chapterId);
  }, [router]);

  function getToken() { const m = document.cookie.match(/token=([^;]+)/); return m ? m[1] : ""; }

  async function loadGallery(chapterId: string) {
    try {
      const res = await fetch(`/api/gallery?chapterId=${chapterId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {}
  }

  const filtered = items.filter((i) => category === "all" || i.category === category);

  const handleSave = async () => {
    if (!form.title.trim()) { setToastMsg("Please enter a title."); return; }
    if (!user) return;
    const data = { ...form, chapterId: user.chapterId };
    try {
      if (editingId) {
        await fetch(`/api/gallery/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
        setToastMsg("Updated!");
      } else {
        await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
        setToastMsg("Uploaded!");
      }
      setUploadModal(false); setForm({ title: "", description: "", category: "class", color: "#e61e4d" }); setEditingId(null);
      if (user) loadGallery(user.chapterId);
    } catch { setToastMsg("Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`/api/gallery/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      setToastMsg("Deleted!"); setLightbox(null);
      if (user) loadGallery(user.chapterId);
    } catch { setToastMsg("Failed to delete."); }
  };

  const colors = ["#e61e4d", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
  const catIcons: Record<string, string> = { class: "\u{1F4DA}", event: "\u{1F389}", milestone: "\u{1F3C6}", community: "\u{1F91D}" };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="content">
        <div className="page-header">
          <div>
            <h1>&#127912; Chapter Gallery</h1>
            <p>Moments captured from MAD chapter activities</p>
          </div>
          <button className="primary-btn" onClick={() => { setEditingId(null); setForm({ title: "", description: "", category: "class", color: "#e61e4d" }); setUploadModal(true); }}>&#128228; Upload Photo</button>
        </div>

        <div className="gallery-toolbar">
          <div className="category-chips">
            {[{ key: "all", label: "All" }, { key: "class", label: "\u{1F4DA} Class" }, { key: "event", label: "\u{1F389} Event" }, { key: "milestone", label: "\u{1F3C6} Milestone" }, { key: "community", label: "\u{1F91D} Community" }].map((c) => (
              <button key={c.key} className={`chip ${category === c.key ? "active" : ""}`} onClick={() => setCategory(c.key)}>{c.label}</button>
            ))}
          </div>
          <div className="gallery-stats">{filtered.length} photos</div>
        </div>

        <div className="gallery-grid">
          {filtered.length === 0 ? (
            <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No photos yet.</p>
          ) : filtered.map((item) => (
            <div key={item._id} className="gallery-card" onClick={() => setLightbox(item)}>
              <div className="gallery-placeholder" style={{ background: item.color || "#e61e4d" }}>
                <span className="placeholder-icon">{catIcons[item.category] || "\u{1F4F7}"}</span>
              </div>
              <div className="gallery-info">
                <h3>{item.title}</h3>
                <p>{item.description?.substring(0, 80)}</p>
                <span className="gallery-category">{catIcons[item.category]} {item.category}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className={`modal ${uploadModal ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setUploadModal(false); }}>
        <div className="modal-content">
          <button className="modal-close" onClick={() => setUploadModal(false)}>&times;</button>
          <h2>{editingId ? "Edit Gallery Item" : "Upload to Gallery"}</h2>
          <div className="form-group"><label>Title</label><input type="text" placeholder="Enter a title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-group"><label>Description</label><textarea rows={4} placeholder="Describe this moment..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="class">Class</option><option value="event">Event</option><option value="milestone">Milestone</option><option value="community">Community</option>
            </select>
          </div>
          <div className="form-group">
            <label>Image Preview</label>
            <div className="color-picker">
              {colors.map((c) => (
                <div key={c} className={`color-swatch ${form.color === c ? "active" : ""}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })}></div>
              ))}
            </div>
            <p className="color-hint">Select a placeholder color for the image</p>
          </div>
          <div className="modal-buttons">
            <button className="secondary-btn" onClick={() => setUploadModal(false)}>Cancel</button>
            <button className="primary-btn" onClick={handleSave}>{editingId ? "Update" : "Upload"}</button>
          </div>
        </div>
      </div>

      <div className={`modal ${lightbox ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }}>
        <div className="lightbox-content">
          <button className="modal-close lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
          {lightbox && (
            <>
              <div className="lightbox-image" style={{ background: lightbox.color || "#e61e4d", minHeight: "300px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "64px" }}>{catIcons[lightbox.category] || "\u{1F4F7}"}</span>
              </div>
              <div className="lightbox-info">
                <h3>{lightbox.title}</h3>
                <p>{lightbox.description}</p>
                <span className="gallery-category">{catIcons[lightbox.category]} {lightbox.category}</span>
              </div>
              <div className="lightbox-admin">
                <button className="edit-btn" onClick={() => { setEditingId(lightbox._id); setForm({ title: lightbox.title, description: lightbox.description, category: lightbox.category, color: lightbox.color }); setLightbox(null); setUploadModal(true); }}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(lightbox._id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      {toastMsg && <div className="toast active" onClick={() => setToastMsg("")}>{toastMsg}</div>}
    </div>
  );
}
