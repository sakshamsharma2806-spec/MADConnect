"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style>{`
        :root {
          --primary: #e61e4d;
          --primary-dark: #c41842;
          --primary-light: rgba(230, 30, 77, 0.08);
          --bg: #f5f7fa;
          --white: #ffffff;
          --text: #1a1a2e;
          --text-secondary: #6b7280;
          --border: #e5e7eb;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.1);
          --radius: 14px;
          --radius-sm: 10px;
          --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
        .l-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .l-navbar {
          max-width: 1200px; margin: 0 auto; padding: 0 2rem; height: 72px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .l-nav-left .l-brand h2 { font-size: 1.35rem; font-weight: 800; color: var(--primary); letter-spacing: -0.5px; }
        .l-nav-left .l-brand p { font-size: 0.7rem; color: var(--text-secondary); font-weight: 400; letter-spacing: 0.5px; text-transform: uppercase; }
        .l-nav-right { display: flex; align-items: center; gap: 1.25rem; }
        .l-nav-right img { height: 38px; width: auto; border-radius: 8px; }
        .l-login-btn {
          padding: 0.55rem 1.6rem; background: var(--white); color: var(--primary);
          border: 2px solid var(--primary); border-radius: 50px;
          font-size: 0.85rem; font-weight: 600; text-decoration: none;
          transition: var(--transition); cursor: pointer;
        }
        .l-login-btn:hover { background: var(--primary); color: var(--white); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(230, 30, 77, 0.3); }
        .l-hero {
          max-width: 1200px; margin: 0 auto; padding: 8rem 2rem 4rem;
          display: flex; align-items: center; gap: 4rem; min-height: 100vh;
        }
        .l-hero-left { flex: 1; max-width: 520px; }
        .l-tag {
          display: inline-block; padding: 0.35rem 1rem; background: var(--primary-light);
          color: var(--primary); border-radius: 50px; font-size: 0.75rem;
          font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 1.5rem;
        }
        .l-hero-left h1 { font-size: 3.2rem; font-weight: 800; line-height: 1.15; letter-spacing: -1.5px; color: var(--text); margin-bottom: 1.25rem; }
        .l-hero-left h1 span { display: block; background: linear-gradient(135deg, var(--primary), #ff4081); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .l-description { font-size: 1.05rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem; max-width: 440px; }
        .l-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }
        .l-primary-btn {
          padding: 0.8rem 2rem; background: var(--primary); color: var(--white); border: none;
          border-radius: 50px; font-size: 0.95rem; font-weight: 600; text-decoration: none;
          transition: var(--transition); cursor: pointer; box-shadow: 0 4px 16px rgba(230, 30, 77, 0.3);
        }
        .l-primary-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(230, 30, 77, 0.4); }
        .l-secondary-btn {
          padding: 0.8rem 2rem; background: var(--white); color: var(--text);
          border: 2px solid var(--border); border-radius: 50px; font-size: 0.95rem;
          font-weight: 600; text-decoration: none; transition: var(--transition); cursor: pointer;
        }
        .l-secondary-btn:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .l-hero-right { flex: 1; display: flex; justify-content: center; }
        .l-product-preview {
          background: var(--white); border-radius: var(--radius); padding: 1.75rem;
          width: 100%; max-width: 400px; box-shadow: var(--shadow-lg);
          border: 1px solid var(--border); transition: var(--transition);
        }
        .l-product-preview:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12); }
        .l-preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
        .l-preview-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text); }
        .l-preview-header p { font-size: 0.8rem; color: var(--text-secondary); }
        .l-status { background: #dcfce7; color: #16a34a; padding: 0.25rem 0.7rem; border-radius: 50px; font-size: 0.72rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
        .l-attendance-section { margin-bottom: 1.25rem; }
        .l-attendance-section h4 { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 0.5rem; }
        .l-progress-bar { width: 100%; height: 8px; background: var(--bg); border-radius: 50px; overflow: hidden; }
        .l-progress-fill { height: 100%; width: 94%; background: linear-gradient(90deg, var(--primary), #ff4081); border-radius: 50px; animation: lFillBar 1.5s ease-out forwards; }
        @keyframes lFillBar { from { width: 0%; } to { width: 94%; } }
        .l-attendance-percent { font-size: 0.8rem; font-weight: 600; color: var(--primary); float: right; margin-top: 0.25rem; }
        .l-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem; }
        .l-stat-card { background: var(--bg); padding: 1rem 0.75rem; border-radius: var(--radius-sm); text-align: center; transition: var(--transition); }
        .l-stat-card:hover { background: var(--primary-light); transform: translateY(-2px); }
        .l-stat-card h2 { font-size: 1.5rem; font-weight: 800; color: var(--text); }
        .l-stat-card p { font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; }
        .l-graph { background: var(--bg); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem; }
        .l-graph h4 { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; margin-bottom: 0.75rem; }
        .l-graph-placeholder { text-align: center; font-size: 2rem; padding: 1rem 0; opacity: 0.5; }
        .l-attendance-btn {
          width: 100%; padding: 0.85rem; background: var(--primary); color: var(--white);
          border: none; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600;
          font-family: "Poppins", sans-serif; cursor: pointer; transition: var(--transition);
        }
        .l-attendance-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(230, 30, 77, 0.3); }
        .l-features { max-width: 1200px; margin: 0 auto; padding: 5rem 2rem; }
        .l-section-header { text-align: center; margin-bottom: 3.5rem; }
        .l-section-header .l-tag { margin-bottom: 1rem; }
        .l-section-header h2 { font-size: 2.4rem; font-weight: 800; letter-spacing: -1px; color: var(--text); margin-bottom: 0.75rem; }
        .l-section-header p { font-size: 1.05rem; color: var(--text-secondary); max-width: 520px; margin: 0 auto; }
        .l-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .l-feature-card {
          background: var(--white); border-radius: var(--radius); padding: 2rem;
          border: 1px solid var(--border); transition: var(--transition);
          position: relative; overflow: hidden;
        }
        .l-feature-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--primary), #ff4081);
          transform: scaleX(0); transition: transform 0.4s ease; transform-origin: left;
        }
        .l-feature-card:hover::before { transform: scaleX(1); }
        .l-feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: transparent; }
        .l-feature-icon {
          width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
          margin-bottom: 1.25rem; transition: var(--transition);
        }
        .l-feature-card:hover .l-feature-icon { background: var(--primary); transform: scale(1.05); }
        .l-feature-card:hover .l-feature-icon span { filter: brightness(10); }
        .l-feature-card h3 { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
        .l-feature-card p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; }
        .l-cta-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem 5rem; }
        .l-cta-banner {
          background: linear-gradient(135deg, var(--primary), #c41842); border-radius: var(--radius);
          padding: 3.5rem; text-align: center; color: var(--white); position: relative; overflow: hidden;
        }
        .l-cta-banner::before { content: ""; position: absolute; top: -50%; right: -20%; width: 400px; height: 400px; background: rgba(255,255,255,0.05); border-radius: 50%; }
        .l-cta-banner::after { content: ""; position: absolute; bottom: -30%; left: -10%; width: 300px; height: 300px; background: rgba(255,255,255,0.03); border-radius: 50%; }
        .l-cta-banner h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; position: relative; z-index: 1; }
        .l-cta-banner p { font-size: 1.05rem; opacity: 0.9; margin-bottom: 2rem; position: relative; z-index: 1; }
        .l-cta-banner .l-primary-btn { background: var(--white); color: var(--primary); box-shadow: 0 4px 16px rgba(0,0,0,0.15); position: relative; z-index: 1; }
        .l-cta-banner .l-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.2); }
        .l-footer { background: var(--text); color: rgba(255,255,255,0.7); padding: 3rem 2rem 1.5rem; }
        .l-footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; flex-wrap: wrap; }
        .l-footer-brand h3 { font-size: 1.25rem; font-weight: 800; color: var(--white); margin-bottom: 0.35rem; }
        .l-footer-brand p { font-size: 0.85rem; opacity: 0.6; max-width: 280px; }
        .l-footer-links { display: flex; gap: 3rem; }
        .l-footer-col h4 { font-size: 0.8rem; font-weight: 600; color: var(--white); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.75rem; }
        .l-footer-col a { display: block; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.85rem; padding: 0.2rem 0; transition: var(--transition); }
        .l-footer-col a:hover { color: var(--white); transform: translateX(3px); }
        .l-footer-bottom {
          max-width: 1200px; margin: 2rem auto 0; padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1); display: flex;
          justify-content: space-between; align-items: center; font-size: 0.78rem; opacity: 0.5;
        }
        @media (max-width: 1024px) {
          .l-hero { flex-direction: column; text-align: center; padding-top: 7rem; gap: 3rem; }
          .l-hero-left { max-width: 600px; }
          .l-hero-left h1 { font-size: 2.6rem; }
          .l-description { max-width: 100%; margin-left: auto; margin-right: auto; }
          .l-hero-buttons { justify-content: center; }
          .l-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .l-hero-left h1 { font-size: 2rem; }
          .l-features-grid { grid-template-columns: 1fr; }
          .l-section-header h2 { font-size: 1.8rem; }
          .l-footer-inner { flex-direction: column; }
          .l-footer-links { flex-direction: column; gap: 1.5rem; }
          .l-footer-bottom { flex-direction: column; gap: 0.5rem; text-align: center; }
        }
      `}</style>

      <div className="landing">
        <header className="l-header">
          <nav className="l-navbar">
            <div className="l-nav-left">
              <div className="l-brand">
                <h2>MAD Connect</h2>
                <p>Chapter Management System</p>
              </div>
            </div>
            <div className="l-nav-right">
              <Link href="/login" className="l-login-btn">Login</Link>
              <img src="/mad.logo.png" alt="MAD Logo" />
            </div>
          </nav>
        </header>

        <section className="l-hero">
          <div className="l-hero-left">
            <p className="l-tag">MAKE A DIFFERENCE</p>
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
                <div className="l-status">&#9679; Live</div>
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
          <div className="l-section-header">
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
            ].map((f) => (
              <div key={f.title} className="l-feature-card">
                <div className="l-feature-icon"><span>{f.icon}</span></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="l-cta-section">
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
                <a href="https://makeadifference.in" target="_blank" rel="noopener noreferrer">makeadifference.in</a>
                <a href="https://makeadifference.in/about" target="_blank" rel="noopener noreferrer">About MAD</a>
                <a href="https://makeadifference.in/volunteer" target="_blank" rel="noopener noreferrer">Volunteer</a>
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
