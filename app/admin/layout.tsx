"use client";
import AdminLayout from '@/components/AdminLayout'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Loader from "@/components/Loader";

export default function UsersPage({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Pega o usuário autenticado do contexto
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Redireciona para o login se o usuário não estiver autenticado
      alert("Você não está logado. Redirecionando para a página de login.");
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    // Enquanto redireciona, pode exibir um loading
    return <p>Carregando...</p>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}