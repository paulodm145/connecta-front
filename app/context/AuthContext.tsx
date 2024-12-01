"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import Loader from "@/components/Loader";

import { getUserData, setUserData } from "../utils/UserData"; 

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean; // Expor o estado de carregamento
}

interface User {
  id: number;
  name: string;
  email: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [router]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return; // Não redireciona aqui, deixa o componente cuidar disso
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await api.get("/me");
      setUser(data.data);
      setUserData(data.data); // Atualiza o usuário no gerenciador centralizado
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/login", { email, password });
      localStorage.setItem("token", data.token);

      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      await fetchUser();

      toast.success("Login realizado com sucesso.");
      setUserData(data.user);

      router.push(`/cadastros/pessoas`);
    } catch (error) {
      console.error("Login falhou:", error);
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      setUserData(null); // Limpa os dados do usuário no gerenciador centralizado
      router.push("/");

      await api.post("/logout");
      toast.success("Logout realizado com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao sair. Tente novamente.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
