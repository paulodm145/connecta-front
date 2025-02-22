
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import Loader from "@/components/Loader";
import { getUserData } from "../utils/UserData";
import AlertDialog from "@/components/AlertDialog";

const UsersPage: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const usuarioLogado = getUserData();
  const [isOpenAlert, setIsOpenAlert] = useState(false); // Controle do diálogo

  const handleConfirm = () => {
    setIsOpenAlert(false);
    router.push("/"); // Redireciona para a página inicial
  };

  const handleCancel = () => {
    setIsOpenAlert(false); // Apenas fecha o diálogo sem redirecionar
  };

  useEffect(() => {
    if (!loading && !usuarioLogado) {
      setIsOpenAlert(true); // Exibe o diálogo se o usuário não estiver logado
    }
  }, [loading, usuarioLogado]);

  if (loading) {
    // Exibe um loader enquanto verifica a autenticação
    return <Loader />;
  }

  if (!usuarioLogado) {
    // Renderiza o diálogo para confirmação
    return (
      <AlertDialog
        title="Acesso Restrito"
        description="Você precisa estar logado para acessar esta página. Deseja sair para a página inicial?"
        confirmText="Sim"
        cancelText="Não"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isOpen={isOpenAlert}
        setIsOpen={setIsOpenAlert}
      />
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default UsersPage;


// "use client";
// import AdminLayout from '@/components/AdminLayout'

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";
// import Loader from "@/components/Loader";

// export default function UsersPage({ children }: { children: React.ReactNode }) {
//   const { user } = useAuth(); // Pega o usuário autenticado do contexto
//   const router = useRouter();

//   useEffect(() => {
//     if (!user) {
//       // Redireciona para o login se o usuário não estiver autenticado
//       alert("Você não está logado. Redirecionando para a página de login.");
//       router.push("/");
//     }
//   }, [user, router]);

//   if (!user) {
//     // Enquanto redireciona, pode exibir um loading
//     return <p>Carregando...</p>;
//   }

//   return <AdminLayout>{children}</AdminLayout>;
// }