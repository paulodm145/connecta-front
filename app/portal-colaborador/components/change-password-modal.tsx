"use client"

import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { useState, useEffect } from "react"

interface ChangePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }, [isOpen, reset])

  const newPassword = watch("newPassword")

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8
    const hasLetter = /[A-Za-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

    if (!hasMinLength) return "Senha deve ter pelo menos 8 caracteres"
    if (!hasLetter) return "Senha deve conter pelo menos uma letra"
    if (!hasNumber) return "Senha deve conter pelo menos um número"
    if (!hasSpecialChar) return "Senha deve conter pelo menos um caractere especial"
    return true
  }

  const onSubmit = (data: ChangePasswordFormData) => {
    console.log("[v0] Password change requested")
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4 text-teal-600" />
              Senha Atual
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...register("currentPassword", {
                  required: "Senha atual é obrigatória",
                })}
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4 text-teal-600" />
              Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword", {
                  required: "Nova senha é obrigatória",
                  validate: validatePassword,
                })}
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword.message}</p>}

            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
              <p className="text-xs text-teal-700 font-medium mb-2">Requisitos da senha:</p>
              <ul className="text-xs text-teal-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${newPassword?.length >= 8 ? "bg-teal-500" : "bg-gray-300"}`} />
                  Pelo menos 8 caracteres
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${/[A-Za-z]/.test(newPassword || "") ? "bg-teal-500" : "bg-gray-300"}`}
                  />
                  Pelo menos uma letra
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword || "") ? "bg-teal-500" : "bg-gray-300"}`}
                  />
                  Pelo menos um número
                </li>
                <li className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(newPassword || "") ? "bg-teal-500" : "bg-gray-300"}`}
                  />
                  Pelo menos um caractere especial
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4 text-teal-600" />
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Confirmação de senha é obrigatória",
                  validate: (value) => value === newPassword || "As senhas não coincidem",
                })}
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
              Alterar Senha
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
