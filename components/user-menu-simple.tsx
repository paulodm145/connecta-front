"use client"

import { useState, useEffect } from "react"
import { ChevronDown, User, LogOut, KeyRound, Mail } from "lucide-react"
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

  // Controla se o modal de "Meus Dados" está aberto
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dropdownKey, setDropdownKey] = useState(0) // Força re-render do DropdownMenu

  // useForm
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Usuarios>()

  // Atualiza o form quando abre o modal
  useEffect(() => {
    if (isModalOpen && user) {
      reset({
        name: user.name,
        email: user.email,
      })
    }
  }, [isModalOpen, user, reset])

  if (!user) return null

  // Abre e fecha o modal
  const handleOpenModal = () => {
    document.body.click(); // Força fechamento do DropdownMenu
    setTimeout(() => setIsModalOpen(true), 100); // Pequeno delay para evitar conflito de eventos
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setDropdownKey((prev) => prev + 1) // Força re-renderização do DropdownMenu
  }

  // Logout
  const handleLogout = () => {
    logout()
    toast.success("Logout realizado com sucesso")
    window.location.href = "/"
  }

  // Submit do formulário
  const onSubmit = async (data: Usuarios) => {
    try {
      await updateUsuario(user.id, data)
      //Atualiza os nome do usuario logado
      useUserStore.getState().setUser({ ...user, name: data.name })
      toast.success("Dados atualizados com sucesso")
      handleCloseModal()
    } catch (error) {
      console.error(error)
      toast.error("Falha ao atualizar os dados")
    }
  }

  return (
    <>
      <DropdownMenu key={dropdownKey}>
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

          {/* Usamos asChild e onClick em vez de onSelect */}
          <DropdownMenuItem asChild>
            <button onClick={handleOpenModal}>
              <User className="mr-2 h-4 w-4" />
              <span>Meus Dados</span>
            </button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button onClick={() => toast.info("Trocar Senha")}>
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

      {/* Modal (Dialog) controlado */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Atualizar Dados</DialogTitle>
            <DialogDescription>
              Atualize os campos desejados e salve as alterações.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite o seu nome"
                  {...register("name", { required: true })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    O campo nome é obrigatório.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite o seu email"
                  {...register("email", { required: true })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    O campo e-mail é obrigatório.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              {/* Botão que realmente envia o form */}
              <Button type="submit">Salvar</Button>

              {/* Botão que NÃO envia o form */}
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
