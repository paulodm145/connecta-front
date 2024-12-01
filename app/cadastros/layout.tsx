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
