"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl flex flex-col items-center"
      >
        {/* 404 Number */}
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-8xl font-extrabold text-white drop-shadow-xl"
        >
          404
        </motion.h1>

        <p className="mt-4 text-2xl font-semibold text-white/90">
          Page Not Found
        </p>

        <p className="mt-2 text-center text-gray-300">
          Oops! The admin page you're looking for doesn't exist or has been moved.
        </p>

        {/* Working Illustration */}
        <motion.img
          src="https://undraw.co/api/illustrations/9c86f0d8-eaf7-47e7-af95-5d8f5cb9186f"
          alt="404 Illustration"
          className="w-56 mt-6 opacity-90"
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />

        <Link
          href="/"
          className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition"
        >
          Back to Admin Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
