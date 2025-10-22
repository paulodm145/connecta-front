"use client";

import React from "react";
import Teste from "../components/teste";
import LoginForm from "../components/login-form";


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-teal-800 mb-2">Área do Colaborador</h1>
            <p className="text-teal-600">Acesse sua conta para continuar</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

