"use client";

import React, { useEffect } from "react";
import { useStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import LoginPage from "@/app/login/page";
import OnboardingPage from "@/app/onboarding/page";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const { token, user, loading, isMockMode } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  // Route protection client-side
  useEffect(() => {
    if (!loading) {
      if (!token) {
        if (pathname !== "/login") {
          router.push("/login");
        }
      } else if (user && !user.onboarded) {
        if (pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      } else if (user?.onboarded) {
        if (pathname === "/login" || pathname === "/onboarding") {
          router.push("/");
        }
      }
    }
  }, [token, user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="loading-screen" style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0E0F11",
        color: "#F2F3F5"
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", letterSpacing: "0.1em" }} className="data-mono">
          FITAI COACH
        </div>
      </div>
    );
  }

  // Render Login state inline or block children to prevent flashing protected data
  if (!token) {
    return <LoginPage />;
  }

  if (user && !user.onboarded) {
    return <OnboardingPage />;
  }

  // Fully authenticated & onboarded app layout
  return (
    <div className="app-layout">
      {isMockMode && (
        <div className="simulation-banner">
          <span>Local Simulation Mode Active</span>
        </div>
      )}
      
      {/* Sidebar on desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container page-transition">
          {children}
        </div>
      </main>

      {/* Bottom Nav on mobile */}
      <BottomNav />

      <style jsx global>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--background);
        }

        .simulation-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--secondary);
          color: #0e0f11;
          font-family: var(--font-data);
          font-size: 0.75rem;
          font-weight: 700;
          text-align: center;
          padding: 4px 0;
          z-index: 9999;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .main-content {
          flex: 1;
          margin-left: 260px; /* Sidebar width */
          padding: 48px;
          padding-bottom: 80px; /* Space for mobile nav when resized */
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0;
            padding: 32px 24px;
            padding-bottom: 120px; /* Bottom Nav buffer */
            padding-top: 48px; /* Buffer if banner is active */
          }
        }
      `}</style>
    </div>
  );
}
