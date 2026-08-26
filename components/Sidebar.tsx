"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  name: string;
  role: string;
  chapterId: string;
  chapterName: string;
}

const pages = [
  { id: "dashboard", label: "Dashboard", icon: "\u{1F3E0}", href: "/dashboard", roles: ["cho", "admin", "core"] },
  { id: "volunteers", label: "Volunteers", icon: "\u{1F465}", href: "/volunteers", roles: ["cho", "admin", "core"] },
  { id: "attendance", label: "Attendance", icon: "\u2705", href: "/attendance", roles: ["cho", "admin", "core"] },
  { id: "analytics", label: "Analytics", icon: "\u{1F4CA}", href: "/analytics", roles: ["cho", "admin", "core"] },
  { id: "madconnect", label: "MAD Connect", icon: "\u{1F310}", href: "/madconnect", roles: ["cho", "admin", "core"] },
  { id: "recognition", label: "Recognition", icon: "\u{1F3C6}", href: "/recognition", roles: ["cho", "admin", "core"] },
  { id: "stories", label: "Stories", icon: "\u{1F4D6}", href: "/stories", roles: ["cho", "admin", "core"] },
  { id: "gallery", label: "Gallery", icon: "\u{1F4F7}", href: "/gallery", roles: ["cho", "admin", "core"] },
  { id: "alerts", label: "Alerts", icon: "\u{1F514}", href: "/alerts", roles: ["cho", "admin", "core"] },
  { id: "settings", label: "Settings", icon: "\u2699", href: "/settings", roles: ["cho", "admin", "core"] },
];

const adminPages = [
  { id: "admin", label: "Admin", icon: "\u{1F6E1}", href: "/admin", roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const allPages = isAdmin ? [...pages, ...adminPages] : pages;
  const filteredPages = allPages.filter((p) => p.roles.includes(user.role));
  const subtitle = isAdmin ? "Admin Panel" : user.chapterName ? `${user.chapterName} Chapter` : "Chapter Management";

  return (
    <aside className="sidebar">
      <div className="logo-area">
        <img src="/mad.logo.png" alt="MAD Logo" />
        <div>
          <h2>MAD Connect</h2>
          <p className="sidebar-subtitle">{subtitle}</p>
        </div>
      </div>
      <ul>
        {filteredPages.map((page) => {
          const isActive = pathname === page.href;
          return (
            <li
              key={page.id}
              className={isActive ? "active" : ""}
              onClick={() => router.push(page.href)}
            >
              {page.icon} {page.label}
            </li>
          );
        })}
      </ul>
      <div className="sidebar-bottom">
        <li onClick={handleLogout}>{"\u{1F6AA}"} Logout</li>
      </div>
    </aside>
  );
}
