"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { user, updateGoal, updateTrainingDays, updateDietStrictness, logout } = useStore();
  const [goalInput, setGoalInput] = useState(user?.goal || "Build Muscle");
  const [trainingDaysInput, setTrainingDaysInput] = useState(user?.trainingDays || 5);
  const [dietStrictnessInput, setDietStrictnessInput] = useState(user?.dietStrictness || "Normal Cut");
  const [successMsg, setSuccessMsg] = useState("");

  // Simulated toggles
  const [notifications, setNotifications] = useState({
    coaching: true,
    reminders: false,
    wearables: true,
  });

  const [connectedApps, setConnectedApps] = useState({
    appleHealth: true,
    garmin: false,
    strava: true,
  });

  const handleGoalChange = (newGoal: string) => {
    setGoalInput(newGoal);
    updateGoal(newGoal);
    setSuccessMsg("Goal updated. Baselines adjusted.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleTrainingDaysChange = (days: number) => {
    setTrainingDaysInput(days);
    updateTrainingDays(days);
    setSuccessMsg(`Split updated to ${days} days.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDietStrictnessChange = (strictness: string) => {
    setDietStrictnessInput(strictness);
    updateDietStrictness(strictness);
    setSuccessMsg(`Diet pace shifted to ${strictness.toLowerCase()}.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAppConnection = (key: keyof typeof connectedApps) => {
    setConnectedApps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="profile-container">
      <header className="page-header">
        <h1 className="page-title">PROFILE</h1>
        <p className="page-subtitle">Configure your fitness objectives, device integrations, and preferences.</p>
      </header>

      <div className="divider" />

      {successMsg && (
        <div className="toast-success data-mono">
          {successMsg.toUpperCase()}
        </div>
      )}

      <div className="profile-grid">
        {/* Left Column: Account Profile & Goals */}
        <div className="left-column">
          
          {/* Goal Editor Card */}
          <section className="card goal-card">
            <h2 className="section-title">TRAINING OBJECTIVE</h2>
            <p className="card-instructions">Updating your objective immediately shifts nutritional guidelines and weekly splits.</p>
            
            <div className="goals-vertical-list">
              {[
                { name: "Build Muscle", desc: "Hypertrophy focus, moderate caloric surplus" },
                { name: "Lose Fat", desc: "Active deficit, high-protein retention" },
                { name: "Lean Bulk", desc: "Clean mass aggregation, slight surplus" },
                { name: "Endurance", desc: "Aerobic optimization, balanced ratios" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleGoalChange(item.name)}
                  className={`goal-select-btn ${goalInput === item.name ? "selected" : ""}`}
                >
                  <div className="goal-btn-text">
                    <span className="goal-name">{item.name.toUpperCase()}</span>
                    <span className="goal-desc">{item.desc}</span>
                  </div>
                  <span className="goal-radio-circle" />
                </button>
              ))}
            </div>
          </section>

          {/* New Coaching Protocols Card */}
          <section className="card protocol-card">
            <h2 className="section-title">COACHING PROTOCOLS</h2>
            <p className="card-instructions">Adjust your weekly active frequency and calorie restriction pacing.</p>
            
            <h3 className="protocol-subtitle">WEEKLY FREQUENCY</h3>
            <div className="days-row" style={{ marginBottom: "24px" }}>
              {[3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  onClick={() => handleTrainingDaysChange(days)}
                  className={`day-selector-btn data-mono ${trainingDaysInput === days ? "selected" : ""}`}
                >
                  {days} DAYS
                </button>
              ))}
            </div>

            <h3 className="protocol-subtitle">DIET PACE & STRICTNESS</h3>
            <div className="goals-vertical-list">
              {[
                { name: "Strict Diet", desc: "Aggressive deficit/clean surplus bounds" },
                { name: "Normal Cut", desc: "Standard progressive fat reduction/mass surplus" },
                { name: "Low Level Cut/Gain", desc: "Mild recomposition rate, near maintenance" },
              ].map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleDietStrictnessChange(opt.name)}
                  className={`goal-select-btn ${dietStrictnessInput === opt.name ? "selected" : ""}`}
                >
                  <div className="goal-btn-text">
                    <span className="goal-name">{opt.name.toUpperCase()}</span>
                    <span className="goal-desc">{opt.desc}</span>
                  </div>
                  <span className="goal-radio-circle" />
                </button>
              ))}
            </div>
          </section>

          {/* User Account Info card */}
          <section className="card account-card">
            <h2 className="section-title">ACCOUNT INFO</h2>
            <div className="account-details-list">
              <div className="detail-row">
                <span className="det-lbl">EMAIL</span>
                <span className="det-val data-mono">{user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="det-lbl">AGE</span>
                <span className="det-val data-mono">{user?.age || 28} years</span>
              </div>
              <div className="detail-row">
                <span className="det-lbl">BASELINE WEIGHT</span>
                <span className="det-val data-mono">{user?.weight || 78.5} kg</span>
              </div>
              <div className="detail-row">
                <span className="det-lbl">HEIGHT</span>
                <span className="det-val data-mono">{user?.height || 182} cm</span>
              </div>
            </div>

            <button onClick={logout} className="btn-secondary logout-profile-btn">
              LOGOUT
            </button>
          </section>

        </div>

        {/* Right Column: Devices & Notification settings */}
        <div className="right-column">
          
          {/* Wearables integration Card */}
          <section className="card wearables-card">
            <h2 className="section-title">CONNECTED WEARABLES</h2>
            <p className="card-instructions">Sync metrics automatically from your telemetry devices.</p>
            
            <div className="wearables-list">
              {/* Apple Health */}
              <div className={`wearable-item-row ${connectedApps.appleHealth ? "connected" : ""}`}>
                <div className="wearable-info">
                  <span className="w-icon">🍎</span>
                  <div className="w-text-block">
                    <span className="w-name">APPLE HEALTH</span>
                    <span className="w-status data-mono">{connectedApps.appleHealth ? "SYNCING ACTIVE" : "OFFLINE"}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAppConnection("appleHealth")} 
                  className={`btn-secondary w-action-btn ${connectedApps.appleHealth ? "connected-style" : ""}`}
                >
                  {connectedApps.appleHealth ? "DISCONNECT" : "CONNECT"}
                </button>
              </div>

              {/* Garmin Connect */}
              <div className={`wearable-item-row ${connectedApps.garmin ? "connected" : ""}`}>
                <div className="wearable-info">
                  <span className="w-icon">⌚</span>
                  <div className="w-text-block">
                    <span className="w-name">GARMIN CONNECT</span>
                    <span className="w-status data-mono">{connectedApps.garmin ? "SYNCING ACTIVE" : "OFFLINE"}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAppConnection("garmin")} 
                  className={`btn-secondary w-action-btn ${connectedApps.garmin ? "connected-style" : ""}`}
                >
                  {connectedApps.garmin ? "DISCONNECT" : "CONNECT"}
                </button>
              </div>

              {/* Strava */}
              <div className={`wearable-item-row ${connectedApps.strava ? "connected" : ""}`}>
                <div className="wearable-info">
                  <span className="w-icon">🚲</span>
                  <div className="w-text-block">
                    <span className="w-name">STRAVA RUN/BIKE</span>
                    <span className="w-status data-mono">{connectedApps.strava ? "SYNCING ACTIVE" : "OFFLINE"}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAppConnection("strava")} 
                  className={`btn-secondary w-action-btn ${connectedApps.strava ? "connected-style" : ""}`}
                >
                  {connectedApps.strava ? "DISCONNECT" : "CONNECT"}
                </button>
              </div>
            </div>
          </section>

          {/* Notifications Toggles Card */}
          <section className="card notifications-card">
            <h2 className="section-title">NOTIFICATIONS</h2>
            <p className="card-instructions">Receive updates from your coach model and metrics alerts.</p>
            
            <div className="toggles-list">
              {/* Toggle item 1 */}
              <div className="toggle-item-row">
                <div className="toggle-info">
                  <span className="toggle-title">COACH WEEKLY SUMMARY</span>
                  <span className="toggle-subtitle">Receive an update when your check-in analysis completes.</span>
                </div>
                <button
                  onClick={() => toggleNotification("coaching")}
                  className={`switch-track ${notifications.coaching ? "active" : ""}`}
                  aria-label="Toggle Coach Weekly Summary Notification"
                >
                  <span className="switch-thumb" />
                </button>
              </div>

              {/* Toggle item 2 */}
              <div className="toggle-item-row">
                <div className="toggle-info">
                  <span className="toggle-title">MEAL LOG REMINDERS</span>
                  <span className="toggle-subtitle">Alert if daily calorie targets are not logged by 20:00.</span>
                </div>
                <button
                  onClick={() => toggleNotification("reminders")}
                  className={`switch-track ${notifications.reminders ? "active" : ""}`}
                  aria-label="Toggle Meal Log Reminders Notification"
                >
                  <span className="switch-thumb" />
                </button>
              </div>

              {/* Toggle item 3 */}
              <div className="toggle-item-row">
                <div className="toggle-info">
                  <span className="toggle-title">WEARABLES SYNC FAILURES</span>
                  <span className="toggle-subtitle">Alert if background steps/heart rate fails to sync.</span>
                </div>
                <button
                  onClick={() => toggleNotification("wearables")}
                  className={`switch-track ${notifications.wearables ? "active" : ""}`}
                  aria-label="Toggle Wearables Sync Failures Notification"
                >
                  <span className="switch-thumb" />
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      <style jsx>{`
        .profile-container {
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

        .toast-success {
          background-color: var(--primary);
          color: #0E0F11;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 24px;
          animation: toastIn 300ms ease-out forwards;
        }

        @keyframes toastIn {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .left-column, .right-column {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .section-title {
          font-size: 1rem;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .card-instructions {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        /* Goal Buttons List */
        .goals-vertical-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .goal-select-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
          text-align: left;
        }

        .goal-select-btn:hover {
          border-color: var(--border-hover);
          background-color: rgba(255, 255, 255, 0.03);
        }

        .goal-select-btn.selected {
          border-color: var(--primary);
          background-color: rgba(200, 240, 90, 0.04);
        }

        .goal-btn-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .goal-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .goal-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .goal-radio-circle {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border);
          border-radius: 50%;
          position: relative;
        }

        .goal-select-btn.selected .goal-radio-circle {
          border-color: var(--primary);
        }

        .goal-select-btn.selected .goal-radio-circle::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* Protocols Card Custom CSS styling */
        .protocol-subtitle {
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-top: 16px;
          margin-bottom: 12px;
        }

        .days-row {
          display: flex;
          gap: 10px;
          justify-content: space-between;
        }

        .day-selector-btn {
          flex: 1;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 6px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease, transform 100ms ease;
        }

        .day-selector-btn:hover {
          border-color: var(--border-hover);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .day-selector-btn.selected {
          border-color: var(--primary);
          background-color: rgba(200, 240, 90, 0.08);
          color: var(--primary);
        }

        .day-selector-btn:active {
          transform: scale(0.96);
        }

        /* Account details card */
        .account-details-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed var(--border);
          padding-bottom: 12px;
        }

        .detail-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .det-lbl {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .det-val {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .logout-profile-btn {
          width: 100%;
        }

        /* Connected apps lists */
        .wearables-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wearable-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background-color: rgba(255, 255, 255, 0.01);
          transition: border-color 150ms ease;
        }

        .wearable-item-row.connected {
          border-color: rgba(90, 138, 240, 0.2);
          background-color: rgba(90, 138, 240, 0.02);
        }

        .wearable-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .w-icon {
          font-size: 1.5rem;
        }

        .w-text-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .w-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }

        .w-status {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .wearable-item-row.connected .w-status {
          color: var(--secondary);
          font-weight: 700;
        }

        :global(.w-action-btn) {
          padding: 8px 16px !important;
          font-size: 0.75rem !important;
        }

        :global(.connected-style) {
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }

        :global(.connected-style:hover) {
          background-color: #ef4444 !important;
          color: #0E0F11 !important;
        }

        /* Toggle switches list */
        .toggles-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .toggle-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .toggle-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }

        .toggle-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
          max-width: 320px;
        }

        /* Custom toggle switch physics */
        .switch-track {
          width: 44px;
          height: 24px;
          background-color: var(--border);
          border-radius: 999px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background-color 150ms ease;
          flex-shrink: 0;
        }

        .switch-track.active {
          background-color: var(--primary);
        }

        .switch-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background-color: var(--text-primary);
          border-radius: 50%;
          transition: transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .switch-track.active .switch-thumb {
          transform: translateX(20px);
          background-color: #0E0F11;
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
