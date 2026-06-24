"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useStore();

  const navItems = [
    {
      label: "DASHBOARD",
      href: "/",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      label: "FOOD LOG",
      href: "/food-log",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "WORKOUT PLANNER",
      href: "/workout-planner",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
          <path d="M10 8h4M10 16h4M2 12h4M18 12h4" />
        </svg>
      ),
    },
    {
      label: "BODY SCAN",
      href: "/body-scan",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M2 12h20M12 2v20" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      label: "WEEKLY CHECK-IN",
      href: "/weekly-checkin",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "PROFILE",
      href: "/profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <span className="logo-accent">FIT</span>AI COACH
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="profile-panel">
        <div className="profile-info">
          <span className="profile-email">{user?.email}</span>
          <span className="profile-goal-badge">{user?.goal || "Build Muscle"}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          LOGOUT
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background-color: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          z-index: 100;
        }

        .logo-container {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: 0.1em;
          color: var(--text-primary);
          margin-bottom: 48px;
          padding-left: 12px;
        }

        .logo-accent {
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        :global(.nav-link) {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-radius: 8px;
          color: var(--text-muted);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          transition: color 150ms ease, background-color 150ms ease;
        }

        :global(.nav-link:hover) {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.03);
        }

        :global(.nav-link.active) {
          color: var(--primary);
          background-color: rgba(200, 240, 90, 0.08);
          border-left: 3px solid var(--primary);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-panel {
          border-top: 1px solid var(--border);
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 12px;
        }

        .profile-email {
          font-size: 0.85rem;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-goal-badge {
          font-family: var(--font-data);
          font-size: 0.7rem;
          color: var(--secondary);
          text-transform: uppercase;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 9999px;
          padding: 10px;
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease, transform 100ms ease;
        }

        .logout-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .logout-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 1024px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
