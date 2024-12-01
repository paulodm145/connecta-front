"use client"; // Adicione isso no início do arquivo

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

import { useAccessHook } from '@/app/hooks/useAccessHook';

import { useSearchParams } from 'next/navigation'
 

interface RecoveryFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
}


const RecuperarSenha = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RecoveryFormInputs>();
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams()

  const { verifyToken, redefinirSenha } = useAccessHook(); 

  const token = searchParams.get("token") ?? null;
  const email = searchParams.get("email") ?? null;


  if (!token || !email) {
    toast.error("Token inválido ou expirado258258");
    window.location.href = "/acesso/esqueceu";
  }

  useEffect(() => {
    if (token && email) {
      
      const tokenValido = verifyToken(token as string, email as string);

      console.log("Token válido:", tokenValido);

      if (!tokenValido) {
        toast.error("Token inválido ou expirado2525");
        
      }
      
    }
  }, [token, email]);

  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: RecoveryFormInputs) => {
    try {
      const retorno = await redefinirSenha(email as string, data.password, data.confirmPassword, token as string);
  
      if (retorno.errors) {
        Object.keys(retorno.errors).forEach((key) => {
          retorno.errors[key].forEach((message: string) => {
            toast.error(message);
          });
        });
        return;
      }
  
      toast.success("Senha redefinida com sucesso!");
      setSuccess(true); // Marca sucesso para navegação
    } catch (error: any) {
      
      console.error("Erro ao redefinir senha:", error);
      const mensagemErro = error.response?.data?.message || "Erro ao redefinir senha. Tente novamente.";
      toast.error(mensagemErro);
    }
  };
  
  // Redireciona em caso de sucesso
  useEffect(() => {
    if (success) {
      window.location.href = "/";
    }
  }, [success]);

  return (
    <div className="flex h-screen relative overflow-hidden">
      <ToastContainer />
      <div
        className="absolute inset-0 bg-cover bg-left"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          filter: "brightness(1.1) contrast(1.05) opacity(0.5)",
        }}
      />
      <div className="w-full flex justify-center items-center z-10">
        <div className="w-full max-w-md p-8 backdrop-blur-xl bg-white/30 rounded-xl shadow-2xl border border-white/50">
          <img src={`/images/logo.png`} alt="Logo" className="w-40 h-20 mx-auto mb-4" />
          <p className="text-gray-600 text-center mb-8">Recuperar Senha</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                placeholder="exemplo@email.com"
                type="email"
                className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500"
                {...register("email", {
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email inválido",
                  },
                })}
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>

            {/* Nova Senha */}
            <div>
              <Label htmlFor="password" className="text-gray-700">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500"
                  {...register("password", { required: "Senha é obrigatória" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500"
                  {...register("confirmPassword", {
                    required: "Confirmação de senha é obrigatória",
                    validate: (value) => value === watch("password") || "As senhas não coincidem",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Botão de Enviar */}
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300"
              type="submit"
            >
              Redefinir Senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
