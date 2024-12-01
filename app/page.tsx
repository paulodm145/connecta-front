"use client"; 

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { useForm } from "react-hook-form";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Eye, EyeOff } from "lucide-react"; // Biblioteca para os ícones

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar exibição da senha
  const [numberBackground] = useState(Math.floor(Math.random() * 6) + 1); // Calcula apenas uma vez
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      toast.error("Falha ao fazer login");
      console.error("Login failed", error);
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/acesso/esqueceu");
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      <ToastContainer />
      <div
        className="absolute inset-0 bg-cover bg-left"
        style={{
          backgroundImage: `url('/images/bg-${numberBackground}.jpg')`,
          filter: "brightness(1.1) contrast(1.05) opacity(0.5)",
        }}
      />
      <div className="w-full flex justify-start items-center z-10">
        <div className="w-full max-w-md ml-16 p-8 backdrop-blur-xl bg-white/30 rounded-xl shadow-2xl border border-white/50">
          <img src={`/images/logo.png`} alt="Logo" className="w-200 h-20 mx-auto mb-4" />
          <p className="text-gray-600 text-center mb-8">Entre com suas credenciais</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                placeholder="carole.carroll@gmail.com"
                type="email"
                required
                {...register("email", { required: "Email is required" })}
                className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500"
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password" className="text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"} // Alterna o tipo
                  required
                  {...register("password", { required: "Password is required" })}
                  className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500 pr-10" // Adicionado padding à direita para o ícone
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* Opções e Redirecionamento */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Checkbox id="remember" className="text-red-500 border-gray-400" />
                <label htmlFor="remember" className="ml-2 text-gray-700">
                  Lembrar-me
                </label>
              </div>
              <Button
                variant="link"
                onClick={handleForgotPasswordClick}
                className="text-blue-600 hover:text-blue-800"
              >
                Esqueci minha senha
              </Button>
            </div>

            {/* Botões */}
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300"
              type="submit"
            >
              Entrar
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-400 text-gray-700 hover:bg-white/50 transition-colors duration-300"
              type="button"
            >
              Cancelar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoginPageWithProvider: React.FC = () => (
  <AuthProvider>
    <LoginPage />
  </AuthProvider>
);

export default LoginPageWithProvider;
