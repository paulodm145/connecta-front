import { toast } from "react-toastify";
import { UserMenu } from "./user-menu"
import { usePortalColaboradorAuth } from '@/app/store/authColabStore';


export function Header() {

const { clearAuth } = usePortalColaboradorAuth();

    const handleLogout = () => {
        toast.info("Deslogando...")
        clearAuth(); // limpa Zustand + localStorage
        window.location.href = '/portal-colaborador/login'; // redireciona pro login
    }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            Início
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            Painel do Colaborador
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            Sair
          </a>
        </nav>

        <UserMenu />
      </div>
    </header>
  )
}
