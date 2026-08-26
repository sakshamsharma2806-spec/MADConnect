import { getUserRole, getUserName, getUserChapterName } from "./utils/authUtils.js";

const role = getUserRole();
const isAdmin = role === "admin";
const isCHO = role === "cho";
const userName = getUserName();
const chapterName = getUserChapterName();

const pages = [
  { id: "dashboard", label: "Dashboard", icon: "&#127968;", href: "dashboard.html", roles: ["cho", "admin", "core"] },
  { id: "volunteers", label: "Volunteers", icon: "&#128101;", href: "volunteers.html", roles: ["cho", "admin", "core"] },
  { id: "attendance", label: "Attendance", icon: "&#9989;", href: "attendance.html", roles: ["cho", "admin", "core"] },
  { id: "analytics", label: "Analytics", icon: "&#128202;", href: "analytics.html", roles: ["cho", "admin", "core"] },
  { id: "madconnect", label: "MAD Connect", icon: "&#127758;", href: "madconnect.html", roles: ["cho", "admin", "core"] },
  { id: "comparison", label: "Compare", icon: "&#128200;", href: "comparison.html", roles: ["admin", "core"] },
  { id: "recognition", label: "Recognition", icon: "&#127942;", href: "recognition.html", roles: ["cho", "admin", "core"] },
  { id: "stories", label: "Stories", icon: "&#128214;", href: "stories.html", roles: ["cho", "admin", "core"] },
  { id: "gallery", label: "Gallery", icon: "&#128247;", href: "gallery.html", roles: ["cho", "admin", "core"] },
  { id: "settings", label: "Settings", icon: "&#9881;", href: "settings.html", roles: ["cho", "admin", "core"] },
];

export function initNav(activePageId) {
  const sidebars = document.querySelectorAll(".sidebar");
  sidebars.forEach((sidebar) => {
    const filtered = pages.filter((p) => p.roles.includes(role));
    const ul = sidebar.querySelector("ul");
    if (!ul) return;

    ul.innerHTML = filtered
      .map((page) => {
        const isActive = page.id === activePageId ? " active" : "";
        return `<li class="${isActive}" onclick="window.location.href='${page.href}'">${page.icon} ${page.label}</li>`;
      })
      .join("");

    const logoArea = sidebar.querySelector(".logo-area");
    if (logoArea) {
      const subtitle = isAdmin ? "Admin Panel" : (chapterName ? chapterName + " Chapter" : "Chapter Management");
      logoArea.innerHTML = `
        <img src="${window.location.pathname.includes("pages/") ? "../image/mad.logo.png" : "image/mad.logo.png"}" alt="MAD Logo" />
        <div>
          <h2>MAD Connect</h2>
          <p class="sidebar-subtitle">${subtitle}</p>
        </div>
      `;
    }
  });
}

export function getUserBadge() {
  if (isAdmin) return { label: "Admin", class: "badge-admin" };
  if (chapterName) return { label: chapterName, class: "badge-chapter" };
  return { label: "User", class: "badge-user" };
}
