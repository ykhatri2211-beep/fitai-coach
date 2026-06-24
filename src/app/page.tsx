"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function DashboardPage() {
  const { dashboardData, hydrationMl, logWater, user, resetDay } = useStore();
  const [animate, setAnimate] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!dashboardData) {
    return (
      <div className="dashboard-skeleton-grid">
        <div className="skeleton card skeleton-header" />
        <div className="skeleton card skeleton-ring" />
        <div className="skeleton card skeleton-stats" />
        <style jsx>{`
          .dashboard-skeleton-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            padding-top: 24px;
          }
          .skeleton-header { height: 120px; }
          .skeleton-ring { height: 350px; }
          .skeleton-stats { height: 280px; }
        `}</style>
      </div>
    );
  }

  const { calories, macros, workout, aiTip } = dashboardData;

  // Calorie calculations
  const remainingCalories = calories.goal - calories.consumed;
  const caloriePercentage = Math.min(100, Math.round((calories.consumed / calories.goal) * 100));
  
  // SVG Ring Calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animate 
    ? circumference - (caloriePercentage / 100) * circumference 
    : circumference;

  // Copywriting sentence based on calorie goal status
  const calorieMessage = remainingCalories > 0
    ? `You're ${remainingCalories} kcal away from your goal`
    : `You've exceeded your daily surplus goal by ${Math.abs(remainingCalories)} kcal`;

  return (
    <div className="dashboard-container">
      {/* Top Welcome Header */}
      <header className="dashboard-header-flex">
        <div className="dashboard-header">
          <h1 className="welcome-title">DASHBOARD</h1>
          <p className="welcome-subtitle">Welcome back. Maintain your training split today.</p>
        </div>
        <button onClick={resetDay} className="btn-secondary">
          COMPLETE YOUR DAY
        </button>
      </header>

      <div className="divider" />

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Calorie Ring & Macro Bars */}
        <section className="card calorie-nutrition-card">
          <div className="nutrition-flex">
            {/* SVG Calorie Circle */}
            <div className="circle-wrapper">
              <svg width="220" height="220" viewBox="0 0 220 220" className="calorie-svg">
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  className="circle-bg"
                  strokeWidth="10"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  className="circle-progress"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                />
              </svg>
              <div className="circle-text">
                <span className="calories-number data-mono">{calories.consumed}</span>
                <span className="calories-label">KCAL LOGGED</span>
              </div>
            </div>

            {/* Macro Bars */}
            <div className="macros-list">
              <h2 className="section-title">DAILY MACROS</h2>
              
              {/* Protein Bar */}
              <div className="macro-item">
                <div className="macro-info">
                  <span className="macro-name">PROTEIN</span>
                  <span className="macro-nums data-mono">
                    {macros.protein.current}g <span className="muted-slash">/</span> {macros.protein.goal}g
                  </span>
                </div>
                <div className="macro-bar-track">
                  <div
                    className="macro-bar-fill protein-fill"
                    style={{
                      width: animate 
                        ? `${Math.min(100, (macros.protein.current / macros.protein.goal) * 100)}%` 
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Carbs Bar */}
              <div className="macro-item">
                <div className="macro-info">
                  <span className="macro-name">CARBS</span>
                  <span className="macro-nums data-mono">
                    {macros.carbs.current}g <span className="muted-slash">/</span> {macros.carbs.goal}g
                  </span>
                </div>
                <div className="macro-bar-track">
                  <div
                    className="macro-bar-fill carbs-fill"
                    style={{
                      width: animate 
                        ? `${Math.min(100, (macros.carbs.current / macros.carbs.goal) * 100)}%` 
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Fats Bar */}
              <div className="macro-item">
                <div className="macro-info">
                  <span className="macro-name">FATS</span>
                  <span className="macro-nums data-mono">
                    {macros.fats.current}g <span className="muted-slash">/</span> {macros.fats.goal}g
                  </span>
                </div>
                <div className="macro-bar-track">
                  <div
                    className="macro-bar-fill fats-fill"
                    style={{
                      width: animate 
                        ? `${Math.min(100, (macros.fats.current / macros.fats.goal) * 100)}%` 
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="calorie-status-banner">
            <span className="calorie-status-text">{calorieMessage}</span>
          </div>
        </section>

        {/* AI Tip Card */}
        <section className="card ai-tip-card">
          <div className="tip-header">
            <span className="tip-badge">TODAY'S AI COACH TIP</span>
          </div>
          <p className="tip-content">{aiTip}</p>
        </section>

        {/* Workout Summary Card */}
        <section className="card dashboard-workout-card">
          <div className="card-header-flex">
            <h2 className="section-title">TODAY'S WORKOUT</h2>
            <span className="status-indicator-badge" style={{ 
              color: workout?.completed ? "var(--primary)" : "var(--secondary)" 
            }}>
              {workout?.completed ? "COMPLETED" : "PENDING"}
            </span>
          </div>
          
          {workout ? (
            <div className="workout-summary-body">
              <h3 className="workout-name">{workout.name}</h3>
              <p className="workout-desc">{workout.description}</p>
              
              <div className="workout-progress-details">
                <span className="progress-fraction data-mono">
                  {workout.setsCompleted} OF {workout.totalSets} SETS COMPLETED
                </span>
                <div className="workout-progress-track">
                  <div 
                    className="workout-progress-bar"
                    style={{ width: `${(workout.setsCompleted / workout.totalSets) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="no-workout-text">No workout planned for today.</p>
          )}

          <Link href="/workout-planner" className="btn-primary workout-cta-btn">
            {workout?.completed ? "REVIEW SESSION" : "START WORKOUT"}
          </Link>
        </section>

        {/* Hydration Tracker Card */}
        <section className="card hydration-card">
          <div className="card-header-flex">
            <h2 className="section-title">HYDRATION</h2>
            <span className="hydration-total data-mono">{hydrationMl} ml</span>
          </div>

          <p className="hydration-subtitle">Tap to log water consumption (+250ml per cup)</p>

          <div className="water-grid">
            {[...Array(12)].map((_, i) => {
              const cupValue = (i + 1) * 250;
              const isActive = hydrationMl >= cupValue;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isActive) {
                      // Remove water if clicking already filled cup
                      logWater(-250);
                    } else {
                      logWater(250);
                    }
                  }}
                  className={`water-cup ${isActive ? "active" : ""}`}
                  aria-label={`Log 250ml cup ${i+1}`}
                >
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2H6L4 22c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4L18 2z" />
                    {isActive && <path d="M5 16h14M4 22c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4H4" fill="var(--secondary)" opacity="0.3"/>}
                  </svg>
                </button>
              );
            })}
          </div>
        </section>

      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }

        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .welcome-title {
          font-size: 2.25rem;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }

        .welcome-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .calorie-nutrition-card {
          grid-column: span 2;
        }

        .nutrition-flex {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 48px;
          flex-wrap: wrap;
        }

        .circle-wrapper {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .circle-bg {
          fill: none;
          stroke: var(--border);
        }

        .circle-progress {
          fill: none;
          stroke: var(--primary);
          transition: stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .circle-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .calories-number {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .calories-label {
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-top: -4px;
        }

        .macros-list {
          flex: 1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .macro-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .macro-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .macro-name {
          font-family: var(--font-display);
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .macro-nums {
          color: var(--text-primary);
        }

        .muted-slash {
          color: var(--border);
        }

        .macro-bar-track {
          height: 8px;
          background-color: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .macro-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .protein-fill {
          background-color: var(--primary);
        }

        .carbs-fill {
          background-color: var(--secondary);
        }

        .fats-fill {
          background-color: #f0a35a; /* Warm accent for fats */
        }

        .calorie-status-banner {
          margin-top: 32px;
          border-top: 1px solid var(--border);
          padding-top: 24px;
          text-align: center;
        }

        .calorie-status-text {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        /* AI Tip Card */
        .ai-tip-card {
          grid-column: span 2;
          background-color: rgba(200, 240, 90, 0.03);
          border: 1px solid rgba(200, 240, 90, 0.15);
        }

        .tip-header {
          margin-bottom: 12px;
        }

        .tip-badge {
          font-family: var(--font-data);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--primary);
          border: 1px solid rgba(200, 240, 90, 0.3);
          padding: 4px 8px;
          border-radius: 4px;
          background-color: rgba(200, 240, 90, 0.05);
        }

        .tip-content {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
        }

        /* Workout Summary Card */
        .card-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 1rem;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .status-indicator-badge {
          font-family: var(--font-data);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .workout-summary-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .workout-name {
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .workout-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .workout-progress-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }

        .progress-fraction {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .workout-progress-track {
          height: 6px;
          background-color: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }

        .workout-progress-bar {
          height: 100%;
          background-color: var(--secondary);
          border-radius: 3px;
          transition: width 300ms ease;
        }

        .workout-cta-btn {
          width: 100%;
        }

        /* Hydration */
        .hydration-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .water-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
        }

        .water-cup {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease, transform 100ms ease;
        }

        .water-cup:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        .water-cup.active {
          border-color: var(--secondary);
          color: var(--secondary);
        }

        .water-cup:active {
          transform: scale(0.92);
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .calorie-nutrition-card {
            grid-column: span 1;
          }
          .ai-tip-card {
            grid-column: span 1;
          }
          .water-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
