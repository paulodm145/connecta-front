"use client"

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock, Building, Router } from "lucide-react";
import { cleanInput } from "@/app/utils/Helpers";

import { useLoginColaboradorHook } from "@/app/hooks/useLoginColaborador";
import { toast } from "react-toastify";

interface LoginFormData {
  email: string
  password: string
  cnpj: string
}

const formatCNPJ = (value: string) => {
  const cleanValue = value.replace(/\D/g, "")
  return cleanValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18)
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [cnpjValue, setCnpjValue] = useState("")

  const { loginColaborador } = useLoginColaboradorHook()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>()

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setCnpjValue(formatted)
    setValue("cnpj", formatted)
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {

      // Simular chamada de API
      let clearCNPJ = cleanInput(data.cnpj)
      const dataLogin = await loginColaborador(data.email, data.password, clearCNPJ)
      
      if (!dataLogin) {
        toast.error("Falha ao fazer login. Verifique suas credenciais.")
        throw new Error("Login falhou")
      }

      toast.success("Login realizado com sucesso!")
      window.location.href = "/portal-colaborador/dashboard"
    } catch (err) {
      setError("Email ou senha incorretos. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">Entrar</CardTitle>
          <CardDescription className="text-gray-600">Digite suas credenciais para acessar o portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  className="pl-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  {...register("email", {
                    required: "Email é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                CNPJ *
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpjValue}
                  onChange={handleCnpjChange}
                  className="pl-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              {errors.cnpj && <p className="text-sm text-red-600">{errors.cnpj.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  {...register("password", {
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "Senha deve ter pelo menos 6 caracteres",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-left pt-4">
            <button className="text-sm text-teal-600 hover:text-teal-700 hover:underline">Esqueceu sua senha?</button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
