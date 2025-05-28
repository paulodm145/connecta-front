"use client"; // Adicione isso no início do arquivo

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAccessHook } from "@/app/hooks/useAccessHook";

interface RecoveryFormInputs {
  email: string;
}

const Esqueceu = () => {

  const { register, handleSubmit, formState: { errors } } = useForm<RecoveryFormInputs>();

  const { verificarEmail } = useAccessHook(); // Obtendo o método logout do hook

  const onSubmit = async (data: RecoveryFormInputs) => {
    
    // Simulação de envio ao backend
    console.log("Email enviado para recuperação:", data.email);
    
    const response = await verificarEmail(data.email); // Replace "secondArgument" with the actual second argument
    
    if (response){
      toast.success("Instruções de recuperação enviadas para o email!");
    } else {
      toast.error("Email não cadastrado!");
    }
    
  };

  return (
    <div className="flex h-screen relative overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-left"
        style={{
          backgroundColor: "rgba(0, 128, 128, 0.5)",
          filter: "brightness(1.1) contrast(1.05) opacity(0.5)",
        }}
      />
      <div className="w-full flex justify-center items-center z-10">
        <div className="w-full max-w-md p-8 backdrop-blur-xl bg-white/30 rounded-xl shadow-2xl border border-white/50">
          <img src={`/images/logo.png`} alt="Logo" className="w-40 h-20 mx-auto mb-4" />
          <p className="text-gray-600 text-center mb-8">Digite o email cadastrado</p>
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

            {/* Botão de Enviar */}
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300"
              type="submit"
            >
              Enviar Instruções
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Esqueceu;
