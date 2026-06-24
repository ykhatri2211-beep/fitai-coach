"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function WeeklyCheckinPage() {
  const { weeklyCheckin } = useStore();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!weeklyCheckin) {
    return <div className="skeleton card" style={{ height: "450px" }} />;
  }

  // Score Trend Chart Math (SVG line plotting)
  const data = weeklyCheckin.scoreHistory || [];
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Grid coordinates mapping
  const points = data.map((d, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / (data.length - 1 || 1);
    // Scale scores from 50 to 100 to make progression visually interesting
    const minScore = 50;
    const maxScore = 100;
    const y = chartHeight - paddingY - ((d.score - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
    return { x, y, label: d.week, score: d.score };
  });

  // Build the SVG path string
  const pathString = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Build a nice gradient area path under the line
  const areaPathString = points.length > 0
    ? `${pathString} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : "";

  return (
    <div className="checkin-container">
      <header className="page-header">
        <h1 className="page-title">CHECK YOUR WEEK</h1>
        <p className="page-subtitle">Your AI Coach consolidates training logs, macro ratios, and biomechanics indicators.</p>
      </header>

      <div className="divider" />

      <div className="checkin-grid">
        
        {/* Left Side: Coach Summary & Transformations */}
        <div className="left-column">
          {/* Summary Card */}
          <section className="card coach-card">
            <div className="coach-header">
              <div className="coach-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
                </svg>
              </div>
              <h2 className="section-title">COACHING ANALYSIS</h2>
            </div>
            
            <p className="coach-summary-text">{weeklyCheckin.coachSummary}</p>
            
            <div className="compliance-row">
              <span className="comp-lbl">CHECK-IN SCORE</span>
              <span className="comp-val data-mono">{weeklyCheckin.score} / 100</span>
            </div>
          </section>

          {/* Transformation Predictions */}
          <section className="card prediction-card">
            <h2 className="section-title">TRANSFORMATION PREDICTION</h2>
            <p className="prediction-desc">Algorithmic forecast based on your current rate of adaptation.</p>
            
            <div className="prediction-box">
              <p className="prediction-highlight">"{weeklyCheckin.predictionText}"</p>
              
              <div className="prediction-stats-row">
                <div className="p-stat">
                  <span className="p-lbl">EST. BODY FAT (4W)</span>
                  <span className="p-val data-mono">{weeklyCheckin.predictedBodyFat}%</span>
                </div>
                <div className="p-stat">
                  <span className="p-lbl">EST. SCALE WEIGHT (4W)</span>
                  <span className="p-val data-mono">{weeklyCheckin.predictedWeightKg} KG</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Compliance Trend Graph */}
        <div className="right-column">
          <section className="card chart-card">
            <h2 className="section-title">WEEKLY COMPLIANCE TREND</h2>
            <p className="chart-subtitle">Aggregated metrics scoring sleep, caloric adherence, and workload volume.</p>
            
            <div className="chart-wrapper">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="compliance-chart-svg"
                width="100%"
                height="100%"
              >
                <defs>
                  {/* Grid / Line Gradients */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[50, 75, 100].map((level, i) => {
                  const minScore = 50;
                  const maxScore = 100;
                  const y = chartHeight - paddingY - ((level - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
                  return (
                    <g key={level}>
                      <line 
                        x1={paddingX} 
                        y1={y} 
                        x2={chartWidth - paddingX} 
                        y2={y} 
                        stroke="var(--border)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingX - 10} 
                        y={y + 4} 
                        fill="var(--text-muted)" 
                        fontSize="10" 
                        fontFamily="var(--font-data)"
                        textAnchor="end"
                      >
                        {level}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area Under Line */}
                {animate && points.length > 0 && (
                  <path 
                    d={areaPathString} 
                    fill="url(#areaGrad)" 
                    className="chart-area" 
                  />
                )}

                {/* Trend line */}
                {animate && points.length > 0 && (
                  <path 
                    d={pathString} 
                    fill="none" 
                    stroke="var(--secondary)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="chart-line" 
                  />
                )}

                {/* Data Points (Glow nodes) */}
                {animate && points.map((p, i) => (
                  <g key={i} className="chart-node">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="7" 
                      fill="var(--background)" 
                      stroke="var(--primary)" 
                      strokeWidth="2" 
                    />
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="3" 
                      fill="var(--primary)" 
                    />
                    
                    {/* Node value label */}
                    <text 
                      x={p.x} 
                      y={p.y - 12} 
                      fill="var(--text-primary)" 
                      fontSize="10" 
                      fontWeight="bold"
                      fontFamily="var(--font-data)"
                      textAnchor="middle"
                    >
                      {p.score}
                    </text>

                    {/* X-Axis labels */}
                    <text 
                      x={p.x} 
                      y={chartHeight - paddingY + 16} 
                      fill="var(--text-muted)" 
                      fontSize="9" 
                      fontFamily="var(--font-display)"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {p.label.toUpperCase()}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </section>
        </div>

      </div>

      <style jsx>{`
        .checkin-container {
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

        .checkin-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
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

        /* Summary coach card */
        .coach-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .coach-header .section-title {
          margin-bottom: 0;
        }

        .coach-avatar {
          background-color: rgba(200, 240, 90, 0.08);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .coach-summary-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 28px;
        }

        .compliance-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }

        .comp-lbl {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .comp-val {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--primary);
        }

        /* Prediction Card */
        .prediction-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .prediction-box {
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }

        .prediction-highlight {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: 24px;
        }

        .prediction-stats-row {
          display: flex;
          gap: 24px;
          border-top: 1px dashed var(--border);
          padding-top: 20px;
        }

        .p-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .p-lbl {
          font-family: var(--font-display);
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .p-val {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary);
        }

        /* SVG Trend Chart */
        .chart-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 24px;
          line-height: 1.4;
        }

        .chart-wrapper {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px 16px;
        }

        .compliance-chart-svg {
          display: block;
          overflow: visible;
        }

        .chart-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 150ms;
        }

        .chart-area {
          opacity: 0;
          animation: fade-in 600ms ease forwards;
          animation-delay: 800ms;
        }

        .chart-node {
          opacity: 0;
          animation: fade-in 300ms ease forwards;
        }
        
        .chart-node:nth-child(1) { animation-delay: 200ms; }
        .chart-node:nth-child(2) { animation-delay: 350ms; }
        .chart-node:nth-child(3) { animation-delay: 500ms; }
        .chart-node:nth-child(4) { animation-delay: 650ms; }
        .chart-node:nth-child(5) { animation-delay: 800ms; }
        .chart-node:nth-child(6) { animation-delay: 950ms; }

        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }

        @keyframes fade-in {
          to { opacity: 1; }
        }

        @media (max-width: 900px) {
          .checkin-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
