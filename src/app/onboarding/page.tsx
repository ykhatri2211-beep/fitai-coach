"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";

type OnboardingStep = "metrics" | "diet" | "goal";

export default function OnboardingPage() {
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState<OnboardingStep>("metrics");
  
  // Form fields state
  const [age, setAge] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [diet, setDiet] = useState("Balanced");
  const [dietStrictness, setDietStrictness] = useState("Normal Cut");
  const [goal, setGoal] = useState("Build Muscle");
  const [trainingDays, setTrainingDays] = useState(5);
  const [error, setError] = useState("");

  const stepsList: OnboardingStep[] = ["metrics", "diet", "goal"];
  const currentStepIndex = stepsList.indexOf(step);
  const progressPercent = Math.round(((currentStepIndex + 1) / stepsList.length) * 100);

  const handleNext = () => {
    setError("");

    if (step === "metrics") {
      if (!age || age <= 0) {
        setError("Enter a valid age");
        return;
      }
      if (!weight || weight <= 0) {
        setError("Enter a valid weight in kg");
        return;
      }
      if (!height || height <= 0) {
        setError("Enter a valid height in cm");
        return;
      }
      setStep("diet");
    } else if (step === "diet") {
      setStep("goal");
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "diet") setStep("metrics");
    if (step === "goal") setStep("diet");
  };

  const handleFinish = () => {
    if (!age || !weight || !height) {
      setStep("metrics");
      setError("Please complete all metrics first");
      return;
    }
    completeOnboarding(
      { age: Number(age), weight: Number(weight), height: Number(height) },
      diet,
      goal,
      trainingDays,
      dietStrictness
    );
  };

  return (
    <div className="onboard-container">
      <div className="onboard-card">
        {/* Progress Bar Header */}
        <header className="progress-header">
          <div className="progress-label">
            <span className="step-count">STEP {currentStepIndex + 1} OF 3</span>
            <span className="percent-count">{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </header>

        {/* Form Body with conditional rendering based on step */}
        <div className="step-content">
          {step === "metrics" && (
            <div className="form-step active-step">
              <h2>Enter body metrics</h2>
              <p className="step-description">Provide baseline dimensions to establish caloric baselines.</p>
              
              <div className="input-grid">
                <div className="field-group">
                  <label htmlFor="age">AGE (YEARS)</label>
                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                    className="num-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="weight">WEIGHT (KG)</label>
                  <input
                    id="weight"
                    type="number"
                    min="10"
                    max="400"
                    placeholder="e.g. 78.5"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    className="num-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="height">HEIGHT (CM)</label>
                  <input
                    id="height"
                    type="number"
                    min="50"
                    max="300"
                    placeholder="e.g. 182"
                    value={height}
                    onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                    className="num-input"
                  />
                </div>
              </div>
            </div>
          )}

          {step === "diet" && (
            <div className="form-step active-step">
              <h2>Select nutrition style</h2>
              <p className="step-description">Choose how you plan to hit your macronutrient metrics.</p>

              <div className="options-grid-2col">
                {["Balanced", "High Protein", "Vegan", "Keto", "Carnivore"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDiet(opt)}
                    className={`option-btn select-compact ${diet === opt ? "selected" : ""}`}
                  >
                    <span className="option-name">{opt.toUpperCase()}</span>
                    <span className="radio-circle" />
                  </button>
                ))}
              </div>

              <div className="step-sub-divider" />
              
              <h3>DIET PACE & STRICTNESS</h3>
              <p className="step-description">Establish your caloric adjustment aggression rate.</p>

              <div className="options-vertical">
                {[
                  { name: "Strict Diet", desc: "Aggressive deficit/clean surplus bounds" },
                  { name: "Normal Cut", desc: "Standard progressive fat reduction/mass surplus" },
                  { name: "Low Level Cut/Gain", desc: "Mild recomposition rate, near maintenance" },
                ].map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => setDietStrictness(opt.name)}
                    className={`option-btn ${dietStrictness === opt.name ? "selected" : ""}`}
                  >
                    <div className="option-text-group">
                      <span className="option-name">{opt.name.toUpperCase()}</span>
                      <span className="option-desc">{opt.desc}</span>
                    </div>
                    <span className="radio-circle" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "goal" && (
            <div className="form-step active-step">
              <h2>Choose your objective</h2>
              <p className="step-description">Select your focus. This updates your macro splits and training schedule.</p>

              <div className="options-vertical">
                {[
                  { name: "Build Muscle", desc: "Gain hypertrophy, strength focus" },
                  { name: "Lose Fat", desc: "Caloric deficit, body recomposition" },
                  { name: "Lean Bulk", desc: "Clean mass gain, minimal surplus" },
                  { name: "Endurance", desc: "Aerobic conditioning, power output" },
                ].map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => setGoal(opt.name)}
                    className={`option-btn ${goal === opt.name ? "selected" : ""}`}
                  >
                    <div className="option-text-group">
                      <span className="option-name">{opt.name.toUpperCase()}</span>
                      <span className="option-desc">{opt.desc}</span>
                    </div>
                    <span className="radio-circle" />
                  </button>
                ))}
              </div>

              <div className="step-sub-divider" />

              <h3>WEEKLY TRAINING FREQUENCY</h3>
              <p className="step-description">Specify how many days in a week you want to workout.</p>

              <div className="days-row">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTrainingDays(days)}
                    className={`day-selector-btn data-mono ${trainingDays === days ? "selected" : ""}`}
                  >
                    {days} DAYS
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <div className="step-error">{error}</div>}

        {/* Footer Navigation Buttons */}
        <footer className="onboard-footer">
          {currentStepIndex > 0 ? (
            <button onClick={handleBack} className="btn-secondary nav-btn">
              BACK
            </button>
          ) : (
            <div />
          )}

          {step === "goal" ? (
            <button onClick={handleFinish} className="btn-primary nav-btn">
              FINISH ONBOARDING
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary nav-btn">
              NEXT STEP
            </button>
          )}
        </footer>
      </div>

      <style jsx>{`
        .onboard-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background);
          padding: 24px;
        }

        .onboard-card {
          width: 100%;
          max-width: 580px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
        }

        .progress-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-data);
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .step-count {
          font-weight: 700;
          color: var(--secondary);
        }

        .percent-count {
          font-weight: 700;
          color: var(--text-primary);
        }

        .progress-track {
          height: 4px;
          background-color: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background-color: var(--primary);
          border-radius: 2px;
          transition: width 250ms ease-out;
        }

        .step-content {
          min-height: 340px;
        }

        .form-step h2 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .form-step h3 {
          font-family: var(--font-display);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .step-description {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .step-sub-divider {
          height: 1px;
          background-color: var(--border);
          margin: 32px 0 24px;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-group label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .num-input {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 18px;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: var(--font-data);
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .num-input:focus {
          border-color: var(--primary);
          background-color: rgba(255, 255, 255, 0.04);
          outline: none;
        }

        .options-vertical {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .options-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .option-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          cursor: pointer;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .option-btn.select-compact {
          padding: 12px 16px;
        }

        .option-btn:hover {
          border-color: var(--border-hover);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .option-btn.selected {
          border-color: var(--primary);
          background-color: rgba(200, 240, 90, 0.04);
        }

        .option-text-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .option-name {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          color: var(--text-primary);
        }

        .option-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .radio-circle {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border);
          border-radius: 50%;
          position: relative;
          transition: border-color 150ms ease;
        }

        .option-btn.selected .radio-circle {
          border-color: var(--primary);
        }

        .option-btn.selected .radio-circle::after {
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

        /* Days horizontal row selectors */
        .days-row {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .day-selector-btn {
          flex: 1;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 8px;
          font-size: 0.9rem;
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

        .step-error {
          color: #ef4444;
          font-size: 0.8rem;
          text-align: center;
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px;
          border-radius: 8px;
        }

        .onboard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }

        @media (max-width: 580px) {
          .onboard-card {
            padding: 32px 24px;
          }
          .options-grid-2col {
            grid-template-columns: 1fr;
          }
          .days-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
