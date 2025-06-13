"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAccessHook } from "@/app/hooks/useAccessHook"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

interface PasswordResetFormInputs {
  email: string
  password: string
  confirmPassword: string
}

const Esqueceu = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // pegar a variavel token da URL
  const params = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordResetFormInputs>()

  const { verificarEmail, redefinirSenha } = useAccessHook()

  // Observa o valor da senha para comparar com a confirmação
  const watchPassword = watch("password")

  const onSubmit = async (data: PasswordResetFormInputs) => {
    setIsSubmitting(true)

    try {
      console.log("Dados para redefinição de senha:", {
        email: data.email,
        password: data.password,
      })

      const response = await redefinirSenha(data.email, data.password, data.confirmPassword, token ?? "");

      if (response) {
        toast.success("Senha redefinida com sucesso!")

        // Aguarda um pouco para o usuário ver a mensagem de sucesso
        setTimeout(() => {
          router.push("/") // Redireciona para a página inicial
        }, 2000)
      } else {
        toast.error("Email não cadastrado!")
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      toast.error("Erro interno. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para validar a força da senha
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

    if (!minLength) return "A senha deve ter pelo menos 8 caracteres"
    if (!hasLetter) return "A senha deve conter pelo menos uma letra"
    if (!hasNumber) return "A senha deve conter pelo menos um número"
    if (!hasSpecialChar) return "A senha deve conter pelo menos um caractere especial"

    return true
  }

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
          <p className="text-gray-600 text-center mb-8">Redefina sua senha</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                placeholder="exemplo@email.com"
                type="email"
                disabled={isSubmitting}
                className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Label htmlFor="password" className="text-gray-700">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  placeholder="Digite sua nova senha"
                  type={showPassword ? "text" : "password"}
                  disabled={isSubmitting}
                  className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  {...register("password", {
                    required: "Senha é obrigatória",
                    validate: validatePassword,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}

              {/* Indicadores de força da senha */}
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-600">A senha deve conter:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`${watchPassword?.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                    ✓ 8+ caracteres
                  </div>
                  <div className={`${/[a-zA-Z]/.test(watchPassword || "") ? "text-green-600" : "text-gray-400"}`}>
                    ✓ Letras
                  </div>
                  <div className={`${/\d/.test(watchPassword || "") ? "text-green-600" : "text-gray-400"}`}>
                    ✓ Números
                  </div>
                  <div
                    className={`${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(watchPassword || "") ? "text-green-600" : "text-gray-400"}`}
                  >
                    ✓ Especiais
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  placeholder="Confirme sua nova senha"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={isSubmitting}
                  className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  {...register("confirmPassword", {
                    required: "Confirmação de senha é obrigatória",
                    validate: (value) => {
                      if (value !== watchPassword) {
                        return "As senhas não coincidem"
                      }
                      return true
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent disabled:opacity-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
            </div>

            {/* Botão de Redefinir */}
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Esqueceu
