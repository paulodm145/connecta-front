"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  Menu, 
  Home, 
  Target, 
  Shield, 
  UserPlus, 
  FileText, 
  AlertTriangle, 
  HardHat, 
  Clipboard, 
  Book, 
  User, 
  Bell, 
  Calendar, 
  Briefcase, 
  Thermometer, 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  Folder,
  ListCheck,
  Landmark,
  FileSliders,
  LogOut
} from 'lucide-react';
  
import Image from 'next/image';
import { useAccessHook } from '@/app/hooks/useAccessHook';
import AlertDialog from './AlertDialog'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserMenuSimple from './user-menu-simple';

import { useUserStore } from '@/app/store/userStore';


type LogoPosition = 'left' | 'right' | 'top' | 'bottom';

interface ThemeConfig {
    primary: string;
    secondary: string;
    text: string;
    hover: string;
    button: string;
    input: string;
    logo: string;
    logoPath: string; // Novo campo para o caminho da logo
  }
  
  const themes: Record<string, ThemeConfig> = {
    '1': { 
      primary: 'bg-gradient-to-r from-red-700 to-red-600',
      secondary: 'bg-red-800',
      text: 'text-white',
      hover: 'hover:bg-red-500',
      button: 'bg-red-600 hover:bg-red-700',
      input: 'bg-white text-gray-800 border border-red-300 focus:border-red-500',
      logo: 'text-red-600',
      logoPath: '/images/1.png' // Caminho para a logo da Seara
    },
    '2': { // Tema baseado na imagem ALL IN DOT (escuro)
      primary: 'bg-gradient-to-r from-gray-900 to-gray-800',
      secondary: 'bg-gray-800',
      text: 'text-white',
      hover: 'hover:bg-gray-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      input: 'bg-gray-700 text-white border border-gray-600 focus:border-blue-500',
      logo: 'text-white',
      logoPath: '/images/1.png' // Caminho para a logo ALL IN DOT escura
    },
    '3': { // Tema baseado na imagem ALL IN DOT (claro)
      primary: 'bg-gradient-to-r from-gray-100 to-white',
      secondary: 'bg-white',
      text: 'text-gray-800',
      hover: 'hover:bg-gray-200',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      input: 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500',
      logo: 'text-blue-600',
      logoPath: '/images/logo.png' // Caminho para a logo ALL IN DOT clara
    },
    '4': { // Tema baseado na cor Tea
      primary: 'bg-gradient-to-r from-teal-500 to-teal-400',
      secondary: 'bg-teal-500',
      text: 'text-teal-900',
      hover: 'hover:bg-teal-600',
      button: 'bg-teal-500 hover:bg-teal-600 text-white',
      input: 'bg-white text-teal-900 border border-teal-300 focus:border-teal-500',
      logo: 'text-teal-500',
      logoPath: '/images/tea-logo.png' // Caminho para a logo do tema Tea
    }
  };
  
  interface MenuItem {
    name: string;
    icon: React.ElementType;
    link?: string;
    children?: MenuItem[];
    onClick?: () => void;
  }

  

const TreeMenuItem: React.FC<{ item: MenuItem; depth: number; sidebarMinimized: boolean; theme: ThemeConfig }> = ({ item, depth, sidebarMinimized, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = item.icon;

  const paddingLeft = depth * 16;

  const handleClick = () => {
    if (item.onClick) {
      item.onClick(); // Executa a função associada ao item do menu
    }
    if (item.children) {
      setIsOpen(!isOpen); // Expande/colapsa submenus
    }
  };

  const renderMenuItem = () => (
    <Button
      variant="ghost"
      className={`w-full text-left py-3 px-4 ${sidebarMinimized ? 'justify-center' : 'justify-between'} ${theme.hover} transition-colors duration-200`}
      style={{ paddingLeft: sidebarMinimized ? undefined : `${paddingLeft + 16}px` }}
      onClick={handleClick}
    >
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${sidebarMinimized ? 'mx-auto' : 'mr-3'} ${theme.text}`} />
        {!sidebarMinimized && <span className={`text-sm font-medium ${theme.text} whitespace-nowrap`}>{item.name}</span>}
      </div>
      {!sidebarMinimized && item.children && (
        isOpen ? <ChevronDown className={`h-4 w-4 flex-shrink-0 ${theme.text}`} /> : <ChevronRight className={`h-4 w-4 flex-shrink-0 ${theme.text}`} />
      )}
    </Button>
  );

  return (
    <div>
      {item.link ? (
        <Link href={item.link} className="block">
          {renderMenuItem()}
        </Link>
      ) : (
        renderMenuItem()
      )}
      {isOpen && !sidebarMinimized && item.children && (
        <div className="mt-1">
          {item.children.map((child, index) => (
            <TreeMenuItem key={index} item={child} depth={depth + 1} sidebarMinimized={sidebarMinimized} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
};

  interface AdminLayoutProps {
    children: React.ReactNode;
  }
  
  const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarMinimized, setSidebarMinimized] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('3');
    const [darkMode, setDarkMode] = useState(false);

    const [isOpenAlert, setIsOpenAlert] = useState(false);
  
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleMinimize = () => setSidebarMinimized(!sidebarMinimized);
    const toggleDarkMode = () => setDarkMode(!darkMode);
  
    const theme = themes[currentTheme];

    const { logout } = useAccessHook(); // Obtendo o método logout do hook

    const sair = async () => {
      setIsOpenAlert(true);
    };

    const handleConfirm = async () => {
      try {
        const response = await logout(); // Chama o logout do hook
        if (response?.status === 204) {
          localStorage.removeItem("token");
          toast.success("Logout realizado com sucesso.");
          window.location.href = "/"; // Redireciona para a página de login
        } else {
          toast.error("Falha ao fazer logout. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro durante o logout:", error);
      }
    };
  
    const handleCancel = () => {
      setIsOpenAlert(false);
    };

    const menuData: MenuItem[] = [
      // {
      //   name: "Dashboard",
      //   icon: Home,
      //   children: [
      //     {
      //       name: "Visão Geral",
      //       icon: Home,
      //       children: [
      //         { name: "Resumo Diário", icon: FileText, link: "/admin/dashboard/resumo-diario" },
      //         { name: "Estatísticas Semanais", icon: FileText, link: "/admin/dashboard/estatisticas-semanais" },
      //         { name: "Relatórios Mensais", icon: FileText, link: "/admin/dashboard/relatorios-mensais" }
      //       ]
      //     },
      //     { name: "Indicadores", icon: AlertTriangle, link: "/admin/dashboard/indicadores" },
      //     { name: "Metas", icon: Target, link: "/admin/dashboard/metas" }
      //   ]
      // },
      {
        name : "Home", 
        icon : Home,
        link : "/admin/home/cliente"
      },
      {
        name: "SuperAdmin",
        icon: Home,
        children: [
          {
            name: "Clientes",
            icon: Home,
            children: [
              { name: "Empresas", icon: FileText, link: "/admin/empresas" },
              { name: "Usuários", icon: User, link: "/admin/users" },
            ]
          },
          // { name: "Indicadores", icon: AlertTriangle, link: "/admin/dashboard/indicadores" },
          // { name: "Metas", icon: Target, link: "/admin/dashboard/metas" }
        ]
      },
      {
        name: "Cadastros",
        icon: Folder,
        children: [
          { name: "Setores", icon: Clipboard, link: "/cadastros/setores" },
          { name: "Cargos", icon: UserPlus, link: "/cadastros/cargos" },
          { name: "Pessoas", icon: Users, link: "/cadastros/pessoas" }
        ]
      },
      { name: "Formulários", icon: ListCheck, link: "/formularios/listagem" },
      { name: "Pesquisas", icon: FileText,
        children: [
          { name: "Listagem", icon: FileText, link: "/pesquisas/listagem" },
          { name: "Tipos de Pesquisa", icon: FileText, link: "/cadastros/tipos-pesquisa" },
        ]
       },
      { name: "Minha Empresa", icon: Landmark, link: "/empresas/cliente" },
      { name: "SAIR", icon: LogOut, link: "#", onClick: () => sair() }
  ];


  const user = useUserStore((state) => state.user);
  if (!user) return null;
  
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <ToastContainer />
        {/* Barra lateral do sistema SST */}
        <div className={`fixed top-0 left-0 h-full ${theme.primary} shadow-lg transition-all duration-300 z-20 ${
          sidebarOpen ? (sidebarMinimized ? 'w-16' : 'w-72') : 'w-0'
        } overflow-hidden`}>
          <div className={`p-4 flex flex-col justify-center items-center border-b ${theme.secondary}`} style={{ minHeight: '70px' }}>
            {!sidebarMinimized && (
              <div className="flex flex-col justify-center items-center w-full">
                <Image
                  src={theme.logoPath}
                  alt="Logo"
                  width={90}
                  height={90}
                />
                {/* Título abaixo da imagem */}
                {/* <h1 className={`text-sm mt-2 ${theme.text}`}>Título do Sistema</h1> */}
              </div>
            )}
            <div style={{ position: 'absolute', right: '0.5rem', top: '0.5rem' }}>
              <Button variant="ghost" size="icon" onClick={toggleMinimize} className={`${theme.text} ${theme.hover}`}>
                {sidebarMinimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <nav className="mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {menuData.map((item, index) => (
              <TreeMenuItem key={index} item={item} depth={0} sidebarMinimized={sidebarMinimized} theme={theme} />
            ))}
          </nav>
        </div>
  
        {/* Conteúdo principal*/}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? (sidebarMinimized ? 'ml-16' : 'ml-72') : 'ml-0'}`}>
          <header  style={{ minHeight: '70px' }} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b-gray-300 border-b outline-4 border-solid  shadow-md p-4 flex items-center justify-between`}>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className={`mr-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{user.informacoes_usuario.empresa.nome}</h1>
            </div>
            <div className="flex items-center space-x-2">

              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className={darkMode ? 'text-white' : 'text-black'}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
              >
                <option value="1">Tema 1</option>
                <option value="2">Tema 2</option>
                <option value="3">Tema 3</option>
              </select>

              <UserMenuSimple />
            </div>
          </header>
          <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {children}
          </main>
        </div>
      
        <AlertDialog
        title="Deseja Sair ?"
        description="Confirma a ação de sair do Sistema?"
        confirmText="Sim"
        cancelText="Não"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isOpen={isOpenAlert}
        setIsOpen={setIsOpenAlert}
      />  
      </div>
      
    );
  };
  
  export default AdminLayout;
