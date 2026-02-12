"use client";

import React, { useState } from "react";

export default function InchesToPixels() {
  const [ppi, setPpi] = useState("");
  const [inches, setInches] = useState("");
  const [pixels, setPixels] = useState("");

  // Check if input has letters
  const isInvalid = (value: string) => /[a-zA-Z]/.test(value);

  const convertNow = () => {
    if (ppi === "" || inches === "") return;

    // if letter found → show NaN
    if (isInvalid(ppi) || isInvalid(inches)) {
      setPixels("NaN");
      return;
    }

    const result = Number(ppi) * Number(inches);
    setPixels(String(result));
  };

  const copyPixels = async () => {
    if (!pixels) return;

    try {
      await navigator.clipboard.writeText(pixels);
      alert("Copied to clipboard!");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "50px auto", fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>
        Inches to Pixels Converter
      </h2>

      {/* PPI */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          type="text"
          value={ppi}
          onChange={(e) => {
            const v = e.target.value;
            setPpi(v);

            if (isInvalid(v)) setPixels("NaN");
            else setPixels("");
          }}
          placeholder="Pixels Per Inch (e.g., 96)"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 8,
            border: isInvalid(ppi) ? "1px solid red" : "1px solid #ccc",
            fontSize: 16,
          }}
        />

        <span
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            padding: "0 14px",
            background: "#4E8CD0",
            color: "white",
            borderRadius: "0 8px 8px 0",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          PPI
        </span>
      </div>

      {/* Inches */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          type="text"
          value={inches}
          onChange={(e) => {
            const v = e.target.value;
            setInches(v);

            if (isInvalid(v)) setPixels("NaN");
            else setPixels("");
          }}
          placeholder="Inches (e.g., 5)"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 8,
            border: isInvalid(inches) ? "1px solid red" : "1px solid #ccc",
            fontSize: 16,
          }}
        />

        <span
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            padding: "0 14px",
            background: "#4E8CD0",
            color: "white",
            borderRadius: "0 8px 8px 0",
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
          }}
        >
          Inches
        </span>
      </div>

      {/* Convert Button */}
      <button
        onClick={convertNow}
        style={{
          width: "100%",
          padding: "14px",
          background: "#00bfa6",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        Convert to Pixels
      </button>

      {/* Output */}
      <div style={{ position: "relative" }}>
        <input
          value={pixels}
          readOnly
          placeholder="Pixels"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            background: "#f7f7f7",
          }}
        />
        <button
          onClick={copyPixels}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            padding: "0 14px",
            background: "#4E8CD0",
            color: "white",
            border: "none",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📋
        </button>
      </div>
    </div>
  );
}
