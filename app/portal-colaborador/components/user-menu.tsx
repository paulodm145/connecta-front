"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, Lock, LogOut, ChevronDown } from "lucide-react"
import { EditUserModal } from "./edit-user-modal"
import { ChangePasswordModal } from "./change-password-modal"
import { usePortalColaboradorAuth } from '@/app/store/authColabStore';
import { toast } from "react-toastify"

export function UserMenu() {
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleEditUserOpen = () => {
    setIsDropdownOpen(false)
    setIsChangePasswordOpen(false)
    setIsEditUserOpen(true)
  }

  const handleChangePasswordOpen = () => {
    setIsDropdownOpen(false)
    setIsEditUserOpen(false)
    setIsChangePasswordOpen(true)
  }

  const handleEditUserClose = () => {
    setIsEditUserOpen(false)
  }

  const handleChangePasswordClose = () => {
    setIsChangePasswordOpen(false)
  }

  const { clearAuth,user } = usePortalColaboradorAuth();

    const handleLogout = () => {
        toast.info("Deslogando...")
        clearAuth(); // limpa Zustand + localStorage
        window.location.href = '/portal-colaborador/login'; // redireciona pro login
    };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-teal-50 rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-teal-100">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{user?.nome}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 bg-white border-0 shadow-xl">
          <DropdownMenuItem
            className="cursor-pointer hover:bg-teal-50 focus:bg-teal-50 text-gray-700"
            onClick={handleEditUserOpen}
          >
            <User className="mr-3 h-4 w-4 text-teal-600" />
            Editar Dados
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:bg-teal-50 focus:bg-teal-50 text-gray-700"
            onClick={handleChangePasswordOpen}
          >
            <Lock className="mr-3 h-4 w-4 text-teal-600" />
            Alterar Senha
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-teal-50 focus:bg-teal-50 text-gray-700">
            <Settings className="mr-3 h-4 w-4 text-teal-600" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserModal isOpen={isEditUserOpen} onClose={handleEditUserClose} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={handleChangePasswordClose} />
    </>
  )
}
