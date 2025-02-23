"use client"

import { useState, useEffect } from "react"
import { ChevronDown, User, LogOut, KeyRound, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUserStore } from '@/app/store/userStore'
import { useAccessHook } from '@/app/hooks/useAccessHook'
import { useUsuariosHook } from "@/app/hooks/useUsuariosHook"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { ehSenhaDificil } from "@/app/utils/Helpers"

interface Usuarios {
  id?: number
  name: string
  email: string
  identificador_empresa: string
  password?: string
  confirm_password?: string
  status?: boolean
  empresa?: string
}

export default function UserMenuSimple() {
  const { logout } = useAccessHook()
  const { updateUsuario } = useUsuariosHook()
  const user = useUserStore((state) => state.user)

  // Controle do modal e tipo de conteúdo ("dados" ou "senha")
  const [modalTipo, setModalTipo] = useState<"dados" | "senha" | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Formulário para atualizar dados
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Usuarios>()

  // Atualiza os valores do form quando abre o modal
  useEffect(() => {
    if (modalTipo === "dados" && user) {
      reset({
        name: user.name,
        email: user.email,
      })
    }
  }, [modalTipo, user, reset])

  if (!user) return null

  // Abrir modal de dados
  const handleOpenModalDados = () => {
    document.body.click() // Fecha o DropdownMenu
    setTimeout(() => setModalTipo("dados"), 100)
  }

  // Abrir modal de troca de senha
  const handleOpenModalSenha = () => {
    document.body.click()
    setTimeout(() => setModalTipo("senha"), 100)
  }

  // Fechar modal
  const handleCloseModal = () => {
    setModalTipo(null)
  }

  // Atualizar dados do usuário
  const onSubmitDados = async (data: Usuarios) => {
    try {
      await updateUsuario(user.id, data)
      useUserStore.getState().setUser({ ...user, name: data.name })
      toast.success("Dados atualizados com sucesso")
      handleCloseModal()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar os dados")
    }
  }

  // Trocar senha
  const onSubmitSenha = async (data: { password: string; confirm_password: string }) => {
    if (!ehSenhaDificil(data.password)) {
      setError("password", { type: "manual", message: "A senha não é forte o suficiente" })
      return
    }
    if (data.password !== data.confirm_password) {
      setError("confirm_password", { type: "manual", message: "As senhas não coincidem" })
      return
    }

    try {
      await updateUsuario(user.id, { password: data.password })
      toast.success("Senha alterada com sucesso")
      handleCloseModal()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao alterar a senha")
    }
  }

  // Logout
  const handleLogout = () => {
    logout()
    toast.success("Logout realizado com sucesso")
    window.location.href = "/"
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 font-normal h-auto">
            {user.name}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            <span>{user.email}</span>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button onClick={handleOpenModalDados}>
              <User className="mr-2 h-4 w-4" />
              <span>Meus Dados</span>
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button onClick={handleOpenModalSenha}>
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Trocar Senha</span>
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Unificado */}
      <Dialog open={!!modalTipo} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{modalTipo === "dados" ? "Atualizar Dados" : "Trocar Senha"}</DialogTitle>
            {modalTipo === "dados" && (
              <DialogDescription>Atualize seus dados e salve as alterações.</DialogDescription>
            )}
          </DialogHeader>

          {modalTipo === "dados" ? (
            <form onSubmit={handleSubmit(onSubmitDados)} className="space-y-4 py-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" type="text" placeholder="Nome" {...register("name", { required: true })} />
              {errors.name && <p className="text-red-500 text-sm">O nome é obrigatório.</p>}

              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="E-mail" {...register("email", { required: true })} />
              {errors.email && <p className="text-red-500 text-sm">O e-mail é obrigatório.</p>}

              <DialogFooter>
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmitSenha)} className="space-y-4 py-2">
            {/* Nova Senha */}
            <div className="relative">
            <Label>Nova Senha</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua nova senha"
                {...register("password", { required: "A senha é obrigatória" })}
                className="pr-10" // Garante espaço para o botão no lado direito
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
        
          {/* Confirmar Senha */}
          <div className="relative">
            <Label>Confirmar Senha</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua nova senha"
                {...register("confirm_password", { required: "Confirme sua senha" })}
                className="pr-10" // Garante espaço para o ícone no lado direito
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>
            )}
          </div>
        
            <DialogFooter>
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
