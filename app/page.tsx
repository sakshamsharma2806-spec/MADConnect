"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const particles = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      width: 6 + Math.random() * 10,
      height: 6 + Math.random() * 10,
      left: Math.random() * 100,
      background: i % 2 === 0 ? "var(--primary)" : "var(--accent)",
      animationDuration: 15 + Math.random() * 20,
      animationDelay: Math.random() * 10,
    }));
  }, []);

  return (
    <>
      <style>{`
        :root {
          --primary: #e61e4d;
          --primary-dark: #c41842;
          --primary-light: rgba(230, 30, 77, 0.08);
          --accent: #ff4081;
          --bg: #f5f7fa;
          --white: #ffffff;
          --text: #1a1a2e;
          --text-secondary: #6b7280;
          --border: #e5e7eb;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 25px 60px rgba(0, 0, 0, 0.12);
          --radius: 16px;
          --radius-sm: 12px;
          --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --transition-bounce: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body.landing {
          font-family: "Poppins", "Inter", sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* ===== FLOATING PARTICLES ===== */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== HEADER ===== */
        .l-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          transition: var(--transition);
        }
        .l-header.scrolled {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }
        .l-navbar {
          max-width: 1200px; margin: 0 auto; padding: 0 2rem; height: 72px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .l-nav-left { flex: 1; }
        .l-nav-left .l-brand h2 {
          font-size: 1.35rem; font-weight: 800; color: var(--primary);
          letter-spacing: -0.5px;
        }
        .l-nav-left .l-brand p {
          font-size: 0.7rem; color: var(--text-secondary); font-weight: 400;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .l-nav-right { display: flex; align-items: center; gap: 1.25rem; justify-content: flex-end; }
        .l-nav-right img {
          height: 38px; width: auto; border-radius: 10px;
          transition: var(--transition-bounce);
        }
        .l-nav-right img:hover { transform: scale(1.08) rotate(-3deg); }
        .l-login-btn {
          padding: 0.6rem 1.8rem; background: var(--white); color: var(--primary);
          border: 2px solid var(--primary); border-radius: 50px;
          font-size: 0.85rem; font-weight: 600; text-decoration: none;
          transition: var(--transition); cursor: pointer;
          position: relative; overflow: hidden;
        }
        .l-login-btn::before {
          content: ""; position: absolute; top: 50%; left: 50%; width: 0; height: 0;
          background: var(--primary); border-radius: 50%;
          transform: translate(-50%, -50%); transition: width 0.4s ease, height 0.4s ease;
        }
        .l-login-btn:hover::before { width: 300px; height: 300px; }
        .l-login-btn:hover { color: white; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(230, 30, 77, 0.3); }
        .l-login-btn span { position: relative; z-index: 1; }

        /* ===== HERO ===== */
        .l-hero {
          max-width: 1200px; margin: 0 auto; padding: 8rem 2rem 4rem;
          display: flex; align-items: center; gap: 4rem; min-height: 100vh;
          position: relative; z-index: 1;
        }
        .l-hero-left { flex: 1; max-width: 520px; }
        .l-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.4rem 1.1rem; background: var(--primary-light);
          color: var(--primary); border-radius: 50px; font-size: 0.75rem;
          font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
          margin-bottom: 1.5rem;
          animation: fadeInDown 0.6s ease backwards;
        }
        .l-tag::before {
          content: ""; width: 6px; height: 6px; border-radius: 50%;
          background: var(--primary); animation: pulse 2s infinite;
        }
        .l-hero-left h1 {
          font-size: 3.4rem; font-weight: 800; line-height: 1.1;
          letter-spacing: -1.5px; color: var(--text); margin-bottom: 1.25rem;
          animation: fadeInUp 0.6s ease 0.1s backwards;
        }
        .l-hero-left h1 span {
          display: block;
          background: linear-gradient(135deg, var(--primary), var(--accent), #e91e63);
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .l-description {
          font-size: 1.05rem; color: var(--text-secondary); line-height: 1.8;
          margin-bottom: 2rem; max-width: 440px;
          animation: fadeInUp 0.6s ease 0.2s backwards;
        }
        .l-hero-buttons {
          display: flex; gap: 1rem; flex-wrap: wrap;
          animation: fadeInUp 0.6s ease 0.3s backwards;
        }
        .l-primary-btn {
          padding: 0.85rem 2.2rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: var(--white); border: none; border-radius: 50px; font-size: 0.95rem;
          font-weight: 600; text-decoration: none; transition: var(--transition);
          cursor: pointer; box-shadow: 0 4px 20px rgba(230, 30, 77, 0.3);
          position: relative; overflow: hidden;
        }
        .l-primary-btn::before {
          content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .l-primary-btn:hover::before { left: 100%; }
        .l-primary-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(230, 30, 77, 0.4); }
        .l-secondary-btn {
          padding: 0.85rem 2.2rem; background: var(--white); color: var(--text);
          border: 2px solid var(--border); border-radius: 50px; font-size: 0.95rem;
          font-weight: 600; text-decoration: none; transition: var(--transition); cursor: pointer;
        }
        .l-secondary-btn:hover {
          border-color: var(--primary); color: var(--primary); transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        /* ===== PRODUCT PREVIEW (Hero Card) ===== */
        .l-hero-right { flex: 1; display: flex; justify-content: center; perspective: 1000px; }
        .l-product-preview {
          background: var(--white); border-radius: var(--radius); padding: 1.75rem;
          width: 100%; max-width: 400px; box-shadow: var(--shadow-xl);
          border: 1px solid var(--border); transition: var(--transition);
          animation: floatIn 0.8s ease 0.3s backwards;
          position: relative; overflow: hidden;
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(40px) rotateY(5deg); }
          to { opacity: 1; transform: translateY(0) rotateY(0); }
        }
        .l-product-preview::before {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent, rgba(230, 30, 77, 0.03), transparent, rgba(230, 30, 77, 0.03));
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .l-product-preview > * { position: relative; z-index: 1; }
        .l-product-preview:hover {
          transform: translateY(-8px) rotateX(2deg);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }
        .l-preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
        .l-preview-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text); }
        .l-preview-header p { font-size: 0.8rem; color: var(--text-secondary); }
        .l-status {
          background: #dcfce7; color: #16a34a; padding: 0.3rem 0.8rem; border-radius: 50px;
          font-size: 0.72rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;
        }
        .l-status::before {
          content: ""; width: 6px; height: 6px; border-radius: 50%; background: #16a34a;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        .l-attendance-section { margin-bottom: 1.25rem; }
        .l-attendance-section h4 { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 0.5rem; }
        .l-progress-bar { width: 100%; height: 10px; background: #f3f4f6; border-radius: 50px; overflow: hidden; position: relative; }
        .l-progress-fill {
          height: 100%; width: 94%;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 50px; animation: lFillBar 1.5s ease-out 0.8s forwards;
          position: relative; overflow: hidden;
        }
        .l-progress-fill::after {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes lFillBar { from { width: 0%; } to { width: 94%; } }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .l-attendance-percent {
          font-size: 0.8rem; font-weight: 700; color: var(--primary); float: right; margin-top: 0.25rem;
        }
        .l-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
        .l-stat-card {
          background: #f9fafb; padding: 1rem 0.75rem; border-radius: var(--radius-sm);
          text-align: center; transition: var(--transition); border: 1px solid transparent;
        }
        .l-stat-card:hover {
          background: var(--primary-light); transform: translateY(-3px);
          border-color: rgba(230, 30, 77, 0.1);
        }
        .l-stat-card h2 { font-size: 1.5rem; font-weight: 800; color: var(--text); }
        .l-stat-card p { font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; }
        .l-graph {
          background: #f9fafb; border-radius: var(--radius-sm); padding: 1rem;
          margin-bottom: 1.25rem; border: 1px solid transparent; transition: var(--transition);
        }
        .l-graph:hover { border-color: rgba(230, 30, 77, 0.1); }
        .l-graph h4 { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 0.75rem; }
        .l-graph-placeholder { text-align: center; font-size: 2rem; padding: 1rem 0; opacity: 0.5; }
        .l-attendance-btn {
          width: 100%; padding: 0.85rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: var(--white); border: none; border-radius: var(--radius-sm); font-size: 0.9rem;
          font-weight: 600; font-family: "Poppins", sans-serif; cursor: pointer; transition: var(--transition);
          position: relative; overflow: hidden;
        }
        .l-attendance-btn::before {
          content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .l-attendance-btn:hover::before { left: 100%; }
        .l-attendance-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(230, 30, 77, 0.3); }

        /* ===== FEATURES ===== */
        .l-features { max-width: 1200px; margin: 0 auto; padding: 5rem 2rem; position: relative; z-index: 1; }
        .l-section-header { text-align: center; margin-bottom: 3.5rem; }
        .l-section-header .l-tag { margin-bottom: 1rem; }
        .l-section-header h2 {
          font-size: 2.5rem; font-weight: 800; letter-spacing: -1px;
          color: var(--text); margin-bottom: 0.75rem;
        }
        .l-section-header p { font-size: 1.05rem; color: var(--text-secondary); max-width: 520px; margin: 0 auto; }
        .l-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .l-feature-card {
          background: var(--white); border-radius: var(--radius); padding: 2rem;
          border: 1px solid var(--border); transition: var(--transition);
          position: relative; overflow: hidden;
        }
        .l-feature-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          transform: scaleX(0); transition: transform 0.4s ease; transform-origin: left;
        }
        .l-feature-card:hover::before { transform: scaleX(1); }
        .l-feature-card:hover {
          transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: transparent;
        }
        .l-feature-icon {
          width: 52px; height: 52px; background: var(--primary-light); border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
          margin-bottom: 1.25rem; transition: var(--transition-bounce);
        }
        .l-feature-card:hover .l-feature-icon {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          transform: scale(1.1) rotate(-5deg);
        }
        .l-feature-card:hover .l-feature-icon span { filter: brightness(10); }
        .l-feature-card h3 { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
        .l-feature-card p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; }

        /* ===== CTA ===== */
        .l-cta-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem 5rem; position: relative; z-index: 1; }
        .l-cta-banner {
          background: linear-gradient(135deg, var(--primary), #c41842, var(--accent));
          background-size: 200% 200%;
          animation: gradientShift 6s ease infinite;
          border-radius: var(--radius); padding: 4rem 3.5rem; text-align: center;
          color: var(--white); position: relative; overflow: hidden;
        }
        .l-cta-banner::before {
          content: ""; position: absolute; top: -50%; right: -20%; width: 400px; height: 400px;
          background: rgba(255,255,255,0.05); border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        .l-cta-banner::after {
          content: ""; position: absolute; bottom: -30%; left: -10%; width: 300px; height: 300px;
          background: rgba(255,255,255,0.03); border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .l-cta-banner h2 {
          font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem;
          position: relative; z-index: 1; letter-spacing: -0.5px;
        }
        .l-cta-banner p {
          font-size: 1.05rem; opacity: 0.9; margin-bottom: 2rem;
          position: relative; z-index: 1;
        }
        .l-cta-banner .l-primary-btn {
          background: var(--white); color: var(--primary);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15); position: relative; z-index: 1;
        }
        .l-cta-banner .l-primary-btn:hover {
          transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        }

        /* ===== FOOTER ===== */
        .l-footer { background: var(--text); color: rgba(255,255,255,0.7); padding: 3.5rem 2rem 1.5rem; }
        .l-footer-inner {
          max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between;
          align-items: flex-start; gap: 2rem; flex-wrap: wrap;
        }
        .l-footer-brand h3 { font-size: 1.25rem; font-weight: 800; color: var(--white); margin-bottom: 0.35rem; }
        .l-footer-brand p { font-size: 0.85rem; opacity: 0.6; max-width: 280px; }
        .l-footer-links { display: flex; gap: 3rem; }
        .l-footer-col h4 {
          font-size: 0.8rem; font-weight: 600; color: var(--white); text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 0.75rem;
        }
        .l-footer-col a {
          display: block; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.85rem;
          padding: 0.2rem 0; transition: var(--transition);
        }
        .l-footer-col a:hover { color: var(--white); transform: translateX(3px); }
        .l-footer-bottom {
          max-width: 1200px; margin: 2rem auto 0; padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1); display: flex;
          justify-content: space-between; align-items: center; font-size: 0.78rem; opacity: 0.5;
        }

        /* ===== REVEAL ANIMATIONS ===== */
        .reveal {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .l-hero { flex-direction: column; text-align: center; padding-top: 7rem; gap: 3rem; }
          .l-hero-left { max-width: 600px; }
          .l-hero-left h1 { font-size: 2.8rem; }
          .l-description { max-width: 100%; margin-left: auto; margin-right: auto; }
          .l-hero-buttons { justify-content: center; }
          .l-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .l-hero-left h1 { font-size: 2rem; }
          .l-features-grid { grid-template-columns: 1fr; }
          .l-section-header h2 { font-size: 1.8rem; }
          .l-cta-banner { padding: 2.5rem 1.5rem; }
          .l-cta-banner h2 { font-size: 1.6rem; }
          .l-footer-inner { flex-direction: column; }
          .l-footer-links { flex-direction: column; gap: 1.5rem; }
          .l-footer-bottom { flex-direction: column; gap: 0.5rem; text-align: center; }
        }
      `}</style>

      <div className="landing">
        {/* Floating Particles */}
        {mounted && (
          <div className="particles">
            {particles.map((p, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  width: `${p.width}px`,
                  height: `${p.height}px`,
                  left: `${p.left}%`,
                  background: p.background,
                  animationDuration: `${p.animationDuration}s`,
                  animationDelay: `${p.animationDelay}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="l-header" id="header">
          <nav className="l-navbar">
            <div className="l-nav-left">
              <div className="l-brand">
                <h2>MAD Connect</h2>
                <p>Chapter Management System</p>
              </div>
            </div>
            <div className="l-nav-right">
              <Link href="/login" className="l-login-btn"><span>Login</span></Link>
              <img src="/mad.logo.png" alt="MAD Logo" />
            </div>
          </nav>
        </div>

        <section className="l-hero" ref={heroRef}>
          <div className="l-hero-left">
            <span className="l-tag" style={{ cursor: "pointer", textDecoration: "none" }} onClick={() => window.open("https://www.makeadiff.in/", "_blank")}>MAKE A DIFFERENCE</span>
            <h1>
              Managing Chapters
              <span>Has Never Been Easier.</span>
            </h1>
            <p className="l-description">
              A centralized attendance and volunteer management platform designed
              exclusively for Chapter Organisers across MAKE A DIFFERENCE.
            </p>
            <div className="l-hero-buttons">
              <Link href="/login" className="l-primary-btn">Get Started</Link>
              <Link href="/dashboard" className="l-secondary-btn">View Dashboard</Link>
            </div>
          </div>

          <div className="l-hero-right">
            <div className="l-product-preview">
              <div className="l-preview-header">
                <div>
                  <h3>Good Morning</h3>
                  <p>Delhi Arya Chapter</p>
                </div>
                <div className="l-status">Live</div>
              </div>
              <div className="l-attendance-section">
                <h4>Today&apos;s Attendance</h4>
                <div className="l-progress-bar">
                  <div className="l-progress-fill"></div>
                </div>
                <span className="l-attendance-percent">94%</span>
              </div>
              <div className="l-stats">
                <div className="l-stat-card"><h2>152</h2><p>Volunteers</p></div>
                <div className="l-stat-card"><h2>18</h2><p>Classes</p></div>
                <div className="l-stat-card"><h2>89%</h2><p>Attendance</p></div>
              </div>
              <div className="l-graph">
                <h4>Weekly Activity</h4>
                <div className="l-graph-placeholder">&#128200;</div>
              </div>
              <Link href="/login" className="l-attendance-btn">Take Attendance</Link>
            </div>
          </div>
        </section>

        <section className="l-features" id="features">
          <div className="l-section-header reveal">
            <p className="l-tag">FEATURES</p>
            <h2>Everything You Need to Manage Your Chapter</h2>
            <p>Powerful tools built for Chapter Organisers to run their chapters efficiently and make a real difference.</p>
          </div>
          <div className="l-features-grid">
            {[
              { icon: "\u{1F4CA}", title: "Chapter Dashboard", desc: "Real-time stats and insights for your chapter's performance at a glance." },
              { icon: "\u{1F465}", title: "Volunteer Management", desc: "Full CRUD operations with certificate eligibility tracking for every volunteer." },
              { icon: "\u2705", title: "Attendance Tracking", desc: "Mark attendance in seconds and access complete attendance history anytime." },
              { icon: "\u{1F4C8}", title: "Analytics", desc: "Interactive charts and deep insights to understand your chapter's impact." },
              { icon: "\u{1F310}", title: "MAD Connect", desc: "Join a global chapter network and connect with organisers across the country." },
              { icon: "\u{1F4CB}", title: "Chapter Comparison", desc: "Compare chapters side-by-side on key metrics and identify best practices." },
              { icon: "\u{1F4DD}", title: "Chapter Stories", desc: "Share blog posts and knowledge across the community to inspire others." },
              { icon: "\u{1F4F7}", title: "Chapter Gallery", desc: "Upload and showcase photos from your events and chapter activities." },
              { icon: "\u{1F3C6}", title: "Recognition System", desc: "Spotlight top performers and earn badges for outstanding contributions." },
              { icon: "\u{1F6E1}", title: "Admin Dashboard", desc: "Network-wide overview for administrators with complete organizational control." },
            ].map((f, i) => (
              <div key={f.title} className={`l-feature-card reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="l-feature-icon"><span>{f.icon}</span></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="l-cta-section reveal">
          <div className="l-cta-banner">
            <h2>Ready to Transform Your Chapter?</h2>
            <p>Join hundreds of chapters already using MAD Connect to make a difference.</p>
            <Link href="/login" className="l-primary-btn">Get Started Now</Link>
          </div>
        </section>

        <footer className="l-footer">
          <div className="l-footer-inner">
            <div className="l-footer-brand">
              <h3>MAD Connect</h3>
              <p>Empowering chapters across MAKE A DIFFERENCE to manage, track, and grow their impact.</p>
            </div>
            <div className="l-footer-links">
              <div className="l-footer-col">
                <h4>Product</h4>
                <Link href="/dashboard">Dashboard</Link>
                <a href="#features">Features</a>
                <Link href="/login">Login</Link>
              </div>
              <div className="l-footer-col">
                <h4>MAD</h4>
                <a href="https://www.makeadiff.in/" target="_blank" rel="noopener noreferrer">makeadiff.in</a>
                <a href="https://www.makeadiff.in/about" target="_blank" rel="noopener noreferrer">About MAD</a>
                <a href="https://www.makeadiff.in/volunteer" target="_blank" rel="noopener noreferrer">Volunteer</a>
              </div>
              <div className="l-footer-col">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">Feedback</a>
              </div>
            </div>
          </div>
          <div className="l-footer-bottom">
            <span>&copy; 2026 MAD Connect. Built with &#10084; by the MAD community.</span>
            <span>Making a difference, one chapter at a time.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
