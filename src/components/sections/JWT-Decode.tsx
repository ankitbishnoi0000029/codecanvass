"use client";

import React, { useState } from "react";

export default function JwtDecoder() {
  const [jwtInput, setJwtInput] = useState("");
  const [auto, setAuto] = useState(true);
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");

  const decodePart = (str: string) => {
    try {
      return JSON.stringify(
        JSON.parse(
          atob(str.replace(/-/g, "+").replace(/_/g, "/"))
        ),
        null,
        2
      );
    } catch (e) {
      return "";
    }
  };

  const handleDecode = () => {
    const parts = jwtInput.split(".");
    if (parts.length !== 3) {
      setHeader("");
      setPayload("");
      setSignature("");
      return;
    }

    setHeader(decodePart(parts[0]));
    setPayload(decodePart(parts[1]));
    setSignature(parts[2]);
  };

  const handleReset = () => {
    setJwtInput("");
    setHeader("");
    setPayload("");
    setSignature("");
  };

  return (
    <div className="w-full flex justify-center bg-gray-100 py-10">
      <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6">JWT Decode</h1>

        <label className="font-medium">Encoded JWT String</label>
        <textarea
          className="w-full h-32 border border-blue-300 rounded-lg p-3 mt-1 mb-4 bg-white"
          value={jwtInput}
          onChange={(e) => {
            setJwtInput(e.target.value);
            if (auto) handleDecode();
          }}
        />

        <div className="flex items-center gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={auto}
              onChange={() => setAuto(!auto)}
            />
            Auto
          </label>

          <button
            onClick={handleDecode}
            className="bg-teal-500 text-white px-5 py-2 rounded-lg"
          >
            Go
          </button>

          <button
            onClick={handleReset}
            className="bg-white border px-5 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HEADER */}
          <div>
            <label className="font-medium">Header</label>
            <textarea
              className="w-full h-48 border border-teal-300 rounded-lg p-3 mt-1 bg-white"
              value={header}
              readOnly
            />
          </div>

          {/* PAYLOAD */}
          <div>
            <label className="font-medium">Payload data</label>
            <textarea
              className="w-full h-48 border border-blue-300 rounded-lg p-3 mt-1 bg-white"
              value={payload}
              readOnly
            />
          </div>

          {/* SIGNATURE */}
          <div>
            <label className="font-medium">Signature data</label>
            <textarea
              className="w-full h-48 border border-yellow-300 rounded-lg p-3 mt-1 bg-white"
              value={signature}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
