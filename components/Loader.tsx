"use client";

import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700">Carregando...</p>
    </div>
  );
};

export default Loader;
