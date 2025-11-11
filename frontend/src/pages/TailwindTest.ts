import React from "react";

export default function TailwindTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Tailwind CSS is working!</h1>
        <p className="text-lg text-gray-600">If you see this styled card, your setup is correct 🎉</p>
      </div>
    </div>
  );
}
