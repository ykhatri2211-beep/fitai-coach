"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login, register } = useStore();
  const [email, setEmail] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      let success = false;
      if (isRegister) {
        success = await register(email);
      } else {
        success = await login(email);
      }

      if (!success) {
        setError("Connection failed. Check your API server or retry.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <div className="logo-display">
            <span className="logo-accent">FIT</span>AI COACH
          </div>
          <p className="login-subtitle">
            {isRegister ? "Start your disciplined progression" : "Access your coaching dashboard"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              type="email"
              required
              placeholder="e.g. coach@fitai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input"
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={isSubmitting}>
            {isSubmitting ? "PROCESSING..." : isRegister ? "REGISTER" : "ENTER"}
          </button>
        </form>

        <div className="toggle-mode">
          <span>
            {isRegister ? "Already have an account?" : "New to FitAI Coach?"}
          </span>
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="toggle-btn"
          >
            {isRegister ? "LOGIN" : "CREATE ACCOUNT"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background);
          padding: 24px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 48px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: cardIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          text-align: center;
        }

        .logo-display {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.75rem;
          letter-spacing: 0.1em;
          color: var(--text-primary);
        }

        .logo-accent {
          color: var(--primary);
        }

        .login-subtitle {
          color: var(--text-muted);
          font-size: 0.85rem;
          letter-spacing: 0.02em;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .email-input {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 18px;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .email-input:focus {
          border-color: var(--primary);
          background-color: rgba(255, 255, 255, 0.04);
          outline: none;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.8rem;
          text-align: center;
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px;
          border-radius: 8px;
        }

        .login-btn {
          width: 100%;
        }

        .toggle-mode {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 4px;
          transition: color 150ms ease;
        }

        .toggle-btn:hover {
          color: #d4f76b;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}
