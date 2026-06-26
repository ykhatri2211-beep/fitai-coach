"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";

export default function FoodLogPage() {
  const { foodLog, logMealText, logMealPhoto } = useStore();
  const [textInput, setTextInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    await logMealText(textInput);
    setTextInput("");
  };

  const simulatePhotoScan = async (file: File) => {
    setIsScanning(true);
    setScanProgress(10);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;

      let progress = 10;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 90) {
          clearInterval(interval);
          setScanProgress(90);
        } else {
          setScanProgress(progress);
        }
      }, 200);

      setTimeout(async () => {
        clearInterval(interval);
        setScanProgress(100);
        try {
          await logMealPhoto(base64);
        } catch (err) {
          console.error("Food photo log failed:", err);
        } finally {
          setIsScanning(false);
          setScanProgress(0);
        }
      }, 1000);
    };
    reader.onerror = () => {
      setIsScanning(false);
      setScanProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulatePhotoScan(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulatePhotoScan(e.target.files[0]);
    }
  };

  // Helper to color confidence badges
  const getConfidenceStyle = (score: number) => {
    if (score >= 95) return { color: "var(--primary)", bg: "rgba(200, 240, 90, 0.08)", border: "rgba(200, 240, 90, 0.2)" };
    return { color: "var(--secondary)", bg: "rgba(90, 138, 240, 0.08)", border: "rgba(90, 138, 240, 0.2)" };
  };

  return (
    <div className="food-log-container">
      <header className="page-header">
        <h1 className="page-title">FOOD LOG</h1>
        <p className="page-subtitle">Log your meals using AI computer vision or natural language description.</p>
      </header>

      <div className="divider" />

      <div className="food-log-grid">
        
        {/* Left Side: Upload & Input */}
        <div className="log-input-column">
          
          {/* Photo Dropzone Card */}
          <section className="card upload-card" onDragEnter={handleDrag}>
            <h2 className="section-title">PHOTO SCANNER</h2>
            
            <div 
              className={`dropzone ${dragActive ? "drag-active" : ""} ${isScanning ? "scanning" : ""}`}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {isScanning ? (
                <div className="scanner-overlay">
                  <div className="skeleton scan-skeleton-bar" style={{ bottom: `${100 - scanProgress}%` }} />
                  <span className="scan-label data-mono">SCANNING MEAL... {scanProgress}%</span>
                  <div className="scanner-progress-track">
                    <div className="scanner-progress-fill" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              ) : (
                <label className="dropzone-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-hidden-input"
                  />
                  <div className="upload-icon">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span className="dropzone-text">DRAG PHOTO HERE OR TAP TO CAMERA</span>
                  <span className="dropzone-sub">FitAI automatically extracts portion weight and macronutrients</span>
                </label>
              )}
            </div>
          </section>

          {/* Text Input Card */}
          <section className="card text-input-card">
            <h2 className="section-title">DESCRIBE MEAL</h2>
            <p className="card-instructions">Describe your food intake in plain English. AI handles the scaling.</p>
            
            <form onSubmit={handleTextSubmit} className="text-log-form">
              <textarea
                placeholder="e.g. 200g chicken breast, 1 cup cooked white rice, and 1 tablespoon of olive oil"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                required
                className="meal-textarea"
                rows={3}
              />
              <button type="submit" className="btn-primary log-meal-btn">
                LOG YOUR MEAL
              </button>
            </form>
          </section>

        </div>

        {/* Right Side: Logged List */}
        <div className="log-list-column">
          <section className="card history-card">
            <div className="history-header">
              <h2 className="section-title">RECENT MEALS</h2>
              <span className="history-count data-mono">{foodLog.length} ENTRIES TODAY</span>
            </div>

            {isScanning && (
              <div className="skeleton-entry card">
                <div className="skeleton sk-line1" />
                <div className="skeleton sk-line2" />
                <div className="skeleton sk-badge" />
              </div>
            )}

            {foodLog.length === 0 && !isScanning ? (
              <div className="empty-state">
                <p>No meals logged today. Establish caloric input metrics above.</p>
              </div>
            ) : (
              <div className="meals-list">
                {foodLog.map((meal) => {
                  const conf = getConfidenceStyle(meal.confidence);
                  const mealTime = new Date(meal.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div key={meal.id} className="meal-entry-card">
                      <div className="meal-entry-main">
                        <div>
                          <h3 className="meal-name">{meal.name}</h3>
                          <span className="meal-meta data-mono">
                            {mealTime} • {meal.sourceType.toUpperCase()} INPUT
                          </span>
                        </div>
                        <div className="meal-calories data-mono">
                          <span className="cal-num">{meal.calories}</span>
                          <span className="cal-unit">KCAL</span>
                        </div>
                      </div>

                      <div className="meal-macros-grid">
                        <div className="meal-macro-stat">
                          <span className="m-val data-mono">{meal.protein}g</span>
                          <span className="m-lbl">PROTEIN</span>
                        </div>
                        <div className="meal-macro-stat">
                          <span className="m-val data-mono">{meal.carbs}g</span>
                          <span className="m-lbl">CARBS</span>
                        </div>
                        <div className="meal-macro-stat">
                          <span className="m-val data-mono">{meal.fats}g</span>
                          <span className="m-lbl">FATS</span>
                        </div>
                      </div>

                      <div className="meal-confidence-row">
                        <span 
                          className="confidence-badge data-mono"
                          style={{
                            color: conf.color,
                            backgroundColor: conf.bg,
                            border: `1px solid ${conf.border}`,
                          }}
                        >
                          {meal.confidence}% AI CONFIDENCE
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

      </div>

      <style jsx>{`
        .food-log-container {
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

        .food-log-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .log-input-column {
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

        .dropzone {
          border: 1px dashed var(--border);
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
          position: relative;
          overflow: hidden;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone:hover {
          border-color: var(--primary);
          background-color: rgba(200, 240, 90, 0.02);
        }

        .dropzone.drag-active {
          border-color: var(--primary);
          background-color: rgba(200, 240, 90, 0.05);
        }

        .file-hidden-input {
          display: none;
        }

        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          width: 100%;
        }

        .upload-icon {
          background-color: rgba(200, 240, 90, 0.05);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease;
        }

        .dropzone:hover .upload-icon {
          transform: scale(1.05);
        }

        .dropzone-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          color: var(--text-primary);
        }

        .dropzone-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          max-width: 280px;
          line-height: 1.4;
        }

        /* Scanning animation overlays */
        .scanner-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
          height: 100%;
          justify-content: center;
          position: relative;
        }

        .scan-skeleton-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background-color: var(--primary);
          box-shadow: 0 0 10px var(--primary);
          opacity: 0.8;
          transition: bottom 200ms linear;
        }

        .scan-label {
          font-size: 0.85rem;
          color: var(--primary);
          letter-spacing: 0.05em;
          font-weight: 700;
        }

        .scanner-progress-track {
          width: 80%;
          height: 4px;
          background-color: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .scanner-progress-fill {
          height: 100%;
          background-color: var(--primary);
          border-radius: 2px;
          transition: width 200ms linear;
        }

        /* Text Input */
        .card-instructions {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .text-log-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .meal-textarea {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-family: var(--font-body);
          line-height: 1.5;
          resize: none;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .meal-textarea:focus {
          border-color: var(--primary);
          background-color: rgba(255, 255, 255, 0.04);
          outline: none;
        }

        .log-meal-btn {
          width: 100%;
        }

        /* History Meals List */
        .history-card {
          min-height: 520px;
          display: flex;
          flex-direction: column;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .history-count {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .meals-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .meal-entry-card {
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
        }

        .meal-entry-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .meal-entry-main {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
          gap: 16px;
        }

        .meal-name {
          font-size: 1.15rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .meal-meta {
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .meal-calories {
          text-align: right;
          display: flex;
          flex-direction: column;
        }

        .cal-num {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .cal-unit {
          font-family: var(--font-display);
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: -2px;
        }

        .meal-macros-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
        }

        .meal-macro-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .m-val {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .m-lbl {
          font-family: var(--font-display);
          font-size: 0.6rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-top: 2px;
        }

        .confidence-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          padding: 48px 24px;
        }

        /* Skeleton Entry */
        .skeleton-entry {
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sk-line1 { height: 16px; width: 60%; }
        .sk-line2 { height: 12px; width: 35%; }
        .sk-badge { height: 24px; width: 120px; }

        @media (max-width: 900px) {
          .food-log-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
