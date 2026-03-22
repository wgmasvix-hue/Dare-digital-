import React, { useEffect } from 'react';

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fade-in" style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 300,
      background: "white", padding: "12px 20px", borderRadius: "6px",
      boxShadow: "0 8px 32px rgba(15,35,64,0.16)", 
      borderLeft: `4px solid ${type === "success" ? "#1A7A4A" : "#C0392B"}`,
      display: "flex", alignItems: "center", gap: 12, minWidth: 280,
      animation: "fadeSlideIn 0.3s ease forwards"
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: type === "success" ? "#1A7A4A" : "#C0392B",
        display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12
      }}>
        {type === "success" ? "✓" : "!"}
      </div>
      <div style={{ fontSize: 13, color: "#1A1A2E", fontWeight: 500, fontFamily: "'Source Sans 3', sans-serif" }}>{message}</div>
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>✕</button>
    </div>
  );
};

export default Toast;
