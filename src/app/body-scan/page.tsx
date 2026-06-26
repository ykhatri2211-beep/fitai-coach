"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";

export default function BodyScanPage() {
  const { scans, uploadScan } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);
  const [dragActive, setDragActive] = useState(false);

  const simulateScan = async (file: File) => {
    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await uploadScan(base64);
      } catch (err) {
        console.error("Scan upload failed:", err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.onerror = () => {
      setIsScanning(false);
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
      simulateScan(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateScan(e.target.files[0]);
    }
  };

  const latestScan = scans[0];

  return (
    <div className="bodyscan-container">
      <header className="page-header">
        <h1 className="page-title">BODY SCAN</h1>
        <p className="page-subtitle">Track body recomposition and lean mass accumulation with AI estimations.</p>
      </header>

      <div className="divider" />

      <div className="bodyscan-grid">
        
        {/* Left Side: Upload & Estimates */}
        <div className="left-column">
          {/* Upload card */}
          <section className="card upload-card" onDragEnter={handleDrag}>
            <h2 className="section-title">NEW PROGRESS SCAN</h2>
            
            <div 
              className={`dropzone ${dragActive ? "drag-active" : ""} ${isScanning ? "scanning" : ""}`}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {isScanning ? (
                <div className="scanning-overlay">
                  <div className="skeleton scan-skeleton-bar" />
                  <span className="scan-label data-mono">ANALYZING COMPOSITION...</span>
                  <p className="scan-sub">Estimating body fat and skeletal mass distribution</p>
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
                      <path d="M21 16V8a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
                      <path d="M12 18v-4" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span className="dropzone-text">UPLOAD RECOMPOSTION PHOTO</span>
                  <span className="dropzone-sub">For best accuracy, stand straight in uniform lighting</span>
                </label>
              )}
            </div>
          </section>

          {/* AI Estimate Display */}
          <section className="card estimates-card">
            <h2 className="section-title font-bold">LATEST AI METRICS</h2>
            
            {latestScan ? (
              <div className="estimates-layout">
                <div className="estimate-grid">
                  <div className="estimate-item">
                    <span className="est-lbl">BODY FAT</span>
                    <span className="est-val data-mono">{latestScan.bodyFatPercent}%</span>
                  </div>
                  <div className="estimate-item">
                    <span className="est-lbl">SKELETAL MUSCLE</span>
                    <span className="est-val data-mono">{latestScan.muscleMassKg} KG</span>
                  </div>
                  <div className="estimate-item">
                    <span className="est-lbl">SCALE WEIGHT</span>
                    <span className="est-val data-mono">{latestScan.weightKg} KG</span>
                  </div>
                  <div className="estimate-item">
                    <span className="est-lbl">ESTIMATE CONFIDENCE</span>
                    <span className="est-val data-mono" style={{ color: "var(--primary)" }}>
                      {latestScan.confidenceScore}%
                    </span>
                  </div>
                </div>
                
                <div className="estimate-note">
                  <span>AI models predict an incremental fat reduction of 0.3% next week at current caloric metrics.</span>
                </div>
              </div>
            ) : (
              <div className="empty-estimates">
                <p>Upload a progress photo to trigger AI lean mass and body fat metrics.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Timeline Comparison Slider */}
        <div className="right-column">
          <section className="card slider-card">
            <h2 className="section-title">VISUAL COMPARISON SLIDER</h2>
            <p className="slider-instructions">Drag the divider to compare baseline cyan scan (left) and current lime scan (right).</p>
            
            <div className="comparison-slider-container">
              {/* Underneath image (Before) */}
              <div className="slide-image-wrapper before-image">
                <img 
                  src="/body_before.png" 
                  alt="Baseline composition scan" 
                  className="slide-img" 
                />
                <span className="slide-tag tag-before data-mono">BASELINE (WEEK 1)</span>
              </div>

              {/* Clipped overlay image (After) */}
              <div 
                className="slide-image-wrapper after-image" 
                style={{ width: `${sliderVal}%` }}
              >
                <img 
                  src={latestScan?.image || "/body_after.png"} 
                  alt="Current composition scan" 
                  className="slide-img" 
                  style={{ objectFit: "cover" }}
                />
                <span className="slide-tag tag-after data-mono">CURRENT (WEEK 6)</span>
              </div>

              {/* Slider Divider Line */}
              <div className="slider-divider" style={{ left: `${sliderVal}%` }}>
                <div className="slider-handle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
                  </svg>
                </div>
              </div>

              {/* Range Input element overlapping the slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="slider-input-range"
                aria-label="Composition comparison slider control"
              />
            </div>
          </section>
        </div>

      </div>

      <style jsx>{`
        .bodyscan-container {
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

        .bodyscan-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 32px;
          align-items: start;
        }

        .left-column {
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
          min-height: 200px;
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
          width: 64px;
          height: 64px;
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
          max-width: 240px;
          line-height: 1.4;
        }

        /* Scan anims */
        .scanning-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .scan-skeleton-bar {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--primary);
          box-shadow: 0 0 8px var(--primary);
          animation: scan-move 1.5s infinite ease-in-out;
        }

        @keyframes scan-move {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }

        .scan-label {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 700;
        }

        .scan-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Estimate items */
        .estimates-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .estimate-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .estimate-item {
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .est-lbl {
          font-family: var(--font-display);
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .est-val {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .estimate-note {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .empty-estimates {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-align: center;
          padding: 40px 16px;
        }

        /* Visual Slider Styling */
        .slider-instructions {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .comparison-slider-container {
          position: relative;
          width: 100%;
          aspect-ratio: 0.75; /* Perfect vertical side aspect */
          background-color: #000;
          border-radius: 12px;
          overflow: hidden;
          user-select: none;
          border: 1px solid var(--border);
        }

        .slide-image-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Clipped overlay setup */
        .after-image {
          overflow: hidden;
          z-index: 10;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .after-image .slide-img {
          width: 100%; /* Important: prevent scaling inside clip */
          max-width: none;
          height: 100%;
        }

        /* Ensure overlay image maintains identical width of parent container */
        .comparison-slider-container .after-image {
          width: 50%;
        }
        
        /* Set static size for the child image inside clipped parent wrapper */
        .comparison-slider-container .after-image .slide-img {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }

        .slide-tag {
          position: absolute;
          bottom: 16px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          z-index: 20;
        }

        .tag-before {
          left: 16px;
          background-color: var(--secondary);
          color: #0E0F11;
        }

        .tag-after {
          right: 16px;
          background-color: var(--primary);
          color: #0E0F11;
        }

        /* Handle styling */
        .slider-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: var(--primary);
          z-index: 30;
          box-shadow: 0 0 10px rgba(200, 240, 90, 0.5);
          pointer-events: none;
        }

        .slider-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          background-color: var(--primary);
          color: #0E0F11;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(200, 240, 90, 0.4);
          z-index: 31;
        }

        /* Invisible slider range covering container */
        .slider-input-range {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: ew-resize;
          z-index: 40;
        }

        @media (max-width: 900px) {
          .bodyscan-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
