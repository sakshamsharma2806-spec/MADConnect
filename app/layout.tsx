import type { Metadata } from "next";
import "../css/shared.css";
import "../css/login.css";
import "../css/dashboard.css";
import "../css/volunteers.css";
import "../css/attendance.css";
import "../css/analytics.css";
import "../css/madconnect.css";
import "../css/recognition.css";
import "../css/stories.css";
import "../css/gallery.css";
import "../css/alerts.css";
import "../css/admin.css";
import "../css/settings.css";

export const metadata: Metadata = {
  title: "MAD Connect",
  description: "Chapter Management System for MAKE A DIFFERENCE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
