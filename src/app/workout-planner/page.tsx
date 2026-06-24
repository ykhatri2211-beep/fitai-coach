"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Exercise } from "@/lib/api";

export default function WorkoutPlannerPage() {
  const { workoutPlan, toggleExerciseSet, activeWorkout, startWorkout } = useStore();
  const [selectedDay, setSelectedDay] = useState("TODAY");
  
  // Rest Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(90);

  // Split selector definitions
  const weeklySplit = [
    { day: "MON", split: "PUSH DAY", active: true },
    { day: "TUE", split: "PULL DAY", active: false },
    { day: "WED", split: "REST DAY", active: false },
    { day: "THU", split: "LEGS DAY", active: false },
    { day: "FRI", split: "SHOULDERS/ARMS", active: false },
    { day: "SAT", split: "REST DAY", active: false },
    { day: "SUN", split: "REST DAY", active: false },
  ];

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const triggerRestTimer = (seconds: number) => {
    setTotalRestTime(seconds);
    setTimeLeft(seconds);
    setTimerRunning(true);
  };

  const handleSetToggle = (exerciseId: string, setIndex: number, currentCompleted: boolean) => {
    toggleExerciseSet(exerciseId, setIndex);
    // If completing the set, trigger the rest countdown
    if (!currentCompleted) {
      const exercise = workoutPlan?.exercises.find((e) => e.id === exerciseId);
      if (exercise) {
        triggerRestTimer(exercise.restSeconds);
      }
    }
  };

  if (!workoutPlan) {
    return <div className="skeleton card" style={{ height: "400px" }} />;
  }

  // Timer progress ring math
  const timerRadius = 40;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerStrokeDashoffset = timerRunning 
    ? timerCircumference - (timeLeft / totalRestTime) * timerCircumference 
    : timerCircumference;

  return (
    <div className="planner-container">
      {/* Rest Timer Banner overlay */}
      {timerRunning && (
        <div className="timer-overlay-banner">
          <div className="timer-content-card">
            <svg width="100" height="100" viewBox="0 0 100 100" className="timer-ring-svg">
              <circle cx="50" cy="50" r={timerRadius} className="timer-ring-bg" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r={timerRadius}
                className="timer-ring-progress"
                strokeWidth="6"
                strokeDasharray={timerCircumference}
                strokeDashoffset={timerStrokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="timer-numeric-label">
              <span className="timer-sec data-mono">{timeLeft}s</span>
              <span className="timer-lbl">RESTING</span>
            </div>

            <div className="timer-buttons">
              <button onClick={() => setTimeLeft((prev) => prev + 30)} className="btn-secondary timer-adjust-btn">
                +30S
              </button>
              <button onClick={() => setTimerRunning(false)} className="btn-primary timer-skip-btn">
                SKIP REST
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main planner state */}
      {!activeWorkout ? (
        <div className="planner-main-view page-transition">
          <header className="page-header">
            <h1 className="page-title">WORKOUT PLANNER</h1>
            <p className="page-subtitle">Track your weekly split and execute weight progression sessions.</p>
          </header>

          <div className="divider" />

          {/* Weekly split navigation */}
          <section className="card split-card">
            <h2 className="section-title">WEEKLY SCHEDULE</h2>
            <div className="split-days-container">
              {weeklySplit.map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDay(item.day)}
                  className={`split-day-btn ${selectedDay === item.day || (selectedDay === "TODAY" && item.active) ? "selected" : ""}`}
                >
                  <span className="split-day-name data-mono">{item.day}</span>
                  <span className="split-focus-text">{item.split}</span>
                  {item.active && <span className="today-badge">TODAY</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Exercises list card */}
          <section className="card exercises-card">
            <div className="card-header-flex">
              <div>
                <h2 className="section-title">TODAY'S TARGETS</h2>
                <h3 className="target-title">{workoutPlan.splitName} — {workoutPlan.dayName}</h3>
              </div>
              <button onClick={startWorkout} className="btn-primary start-session-btn">
                START WORKOUT
              </button>
            </div>

            <div className="exercises-list">
              {workoutPlan.exercises.map((ex) => (
                <div key={ex.id} className="exercise-row">
                  <div className="exercise-info">
                    <h4 className="exercise-name">{ex.name}</h4>
                    <span className="exercise-meta data-mono">
                      {ex.sets.length} SETS • {ex.restSeconds}S REST
                    </span>
                  </div>
                  <div className="exercise-sets-preview data-mono">
                    {ex.sets.map((set, idx) => (
                      <span key={idx} className="set-preview-bubble">
                        {set.reps}x{set.weightKg} kg
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Active workout execution view */
        <div className="planner-active-view page-transition">
          <header className="active-header">
            <div className="active-title-group">
              <span className="active-live-badge">LIVE SESSION</span>
              <h1 className="page-title">{workoutPlan.dayName}</h1>
            </div>
            <div className="active-session-meta data-mono">
              TARGET REST: 60-120S BETWEEN SETS
            </div>
          </header>

          <div className="divider" />

          <div className="active-exercises-grid">
            {workoutPlan.exercises.map((ex) => (
              <div key={ex.id} className="card active-exercise-card">
                <div className="active-ex-header">
                  <h3 className="exercise-name">{ex.name}</h3>
                  <span className="rest-indicator data-mono">{ex.restSeconds}s rest</span>
                </div>

                <div className="sets-header-labels data-mono">
                  <span>SET</span>
                  <span className="text-right">REPS</span>
                  <span className="text-right">WEIGHT</span>
                  <span className="text-center">STATUS</span>
                </div>

                <div className="sets-list">
                  {ex.sets.map((set, idx) => (
                    <div key={idx} className={`set-row ${set.completed ? "set-completed" : ""}`}>
                      <span className="set-index data-mono">{idx + 1}</span>
                      <span className="set-reps data-mono text-right">{set.reps}</span>
                      <span className="set-weight data-mono text-right">{set.weightKg} kg</span>
                      <button
                        onClick={() => handleSetToggle(ex.id, idx, set.completed)}
                        className={`set-checkbox-btn ${set.completed ? "checked" : ""}`}
                        aria-label={`Mark set ${idx+1} for ${ex.name} ${set.completed ? "incomplete" : "complete"}`}
                      >
                        {set.completed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : null}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="active-session-footer">
            <p className="footer-warning">Ensure strict form compliance on all sets.</p>
            <button onClick={() => window.location.href = "/"} className="btn-primary finish-workout-btn">
              FINISH SESSION
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .planner-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .page-title {
          font-size: 2.25rem;
          color: var(--text-primary);
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .split-card {
          background-color: var(--surface);
        }

        .split-days-container {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          margin-top: 12px;
        }

        .split-day-btn {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
          min-height: 110px;
          text-align: center;
          position: relative;
        }

        .split-day-btn:hover {
          border-color: var(--border-hover);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .split-day-btn.selected {
          border-color: var(--primary);
          background-color: rgba(200, 240, 90, 0.04);
        }

        .split-day-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .split-day-btn.selected .split-day-name {
          color: var(--primary);
        }

        .split-focus-text {
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }

        .today-badge {
          position: absolute;
          top: -8px;
          background-color: var(--secondary);
          color: #0E0F11;
          font-family: var(--font-data);
          font-size: 0.55rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        /* Exercises Card */
        .card-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .target-title {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .exercises-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .exercise-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .exercise-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .exercise-name {
          font-size: 1.15rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .exercise-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .exercise-sets-preview {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .set-preview-bubble {
          font-size: 0.75rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 6px;
          color: var(--text-primary);
        }

        /* Active Workout state styling */
        .active-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
        }

        .active-title-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .active-live-badge {
          align-self: flex-start;
          font-family: var(--font-data);
          font-size: 0.7rem;
          font-weight: 700;
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background-color: rgba(239, 68, 68, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .active-session-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .active-exercises-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .active-exercise-card {
          background-color: var(--surface);
        }

        .active-ex-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .rest-indicator {
          font-size: 0.75rem;
          color: var(--secondary);
          text-transform: uppercase;
        }

        .sets-header-labels {
          display: grid;
          grid-template-columns: 60px 1fr 1fr 80px;
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
          margin-bottom: 12px;
        }

        .sets-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .set-row {
          display: grid;
          grid-template-columns: 60px 1fr 1fr 80px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          transition: background-color 150ms ease;
        }

        .set-row.set-completed {
          background-color: rgba(200, 240, 90, 0.01);
        }

        .set-index {
          color: var(--text-muted);
          font-weight: 700;
        }

        .set-reps, .set-weight {
          color: var(--text-primary);
          font-size: 1rem;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .set-checkbox-btn {
          justify-self: center;
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0E0F11;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .set-checkbox-btn:hover {
          border-color: var(--border-hover);
        }

        .set-checkbox-btn.checked {
          background-color: var(--primary);
          border-color: var(--primary);
          color: #0E0F11;
        }

        .active-session-footer {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          text-align: center;
        }

        .footer-warning {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .finish-workout-btn {
          width: 100%;
          max-width: 320px;
        }

        /* Rest Timer Overlay Banner */
        .timer-overlay-banner {
          position: fixed;
          inset: 0;
          background-color: rgba(14, 15, 17, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .timer-content-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          width: 90%;
          max-width: 380px;
          text-align: center;
          position: relative;
        }

        .timer-ring-svg {
          position: relative;
        }

        .timer-ring-bg {
          fill: none;
          stroke: var(--border);
        }

        .timer-ring-progress {
          fill: none;
          stroke: var(--secondary);
          transition: stroke-dashoffset 1s linear;
        }

        .timer-numeric-label {
          position: absolute;
          top: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .timer-sec {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .timer-lbl {
          font-family: var(--font-display);
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-top: -4px;
        }

        .timer-buttons {
          display: flex;
          gap: 16px;
          width: 100%;
          margin-top: 12px;
        }

        .timer-adjust-btn, .timer-skip-btn {
          flex: 1;
        }

        @media (max-width: 768px) {
          .split-days-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .split-day-btn {
            min-height: 90px;
            padding: 12px 6px;
          }
          .card-header-flex {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          .start-session-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
