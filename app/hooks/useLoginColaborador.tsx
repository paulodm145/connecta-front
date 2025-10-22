import axios from "axios";
import { usePortalColaboradorAuth } from "../store/authColabStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/t";

export const useLoginColaboradorHook = () => {
  const { setAuth, token, tokenType, cnpj } = usePortalColaboradorAuth();

  const loginColaborador = async (email: string, password: string, cnpj: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/${cnpj}/auth/pessoas/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const data = response.data;
        setAuth(data, cnpj); // salva token + user no zustand
        return data;
      }

      console.error("Login failed with status:", response.status);
      return null;
    } catch (error) {
      console.error("Erro ao logar colaborador:", error);
      return null;
    }
  };

  const usuarioLogado = async () => {
    try {
      if (!token || !cnpj) {
        console.warn("Nenhum token ou CNPJ encontrado");
        return null;
      }
      console.log('Token encontrado:', token);
      const response = await axios.get(`${BASE_URL}/${cnpj}/colaborador/me`, {
        headers: { Authorization: `${tokenType ?? "Bearer"} ${token}` },
      });

      if (response.status === 200) {
        return response.data; // backend deve devolver os dados do user
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter usuário logado:", error);
      return null;
    }
  };

  const editarUsuario = async (dados: any) => {
    try {
      if (!token || !cnpj) {
        console.warn("Nenhum token ou CNPJ encontrado");
        return null;
      }

      const response = await axios.put(`${BASE_URL}/${cnpj}/colaborador/me`, dados, {
        headers: { Authorization: `${tokenType ?? "Bearer"} ${token}` },
      });

      if (response.status === 200) {
        return response.data; 
      }
      return null;
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      return null;
    }
  }

  return {
    loginColaborador,
    usuarioLogado,
    editarUsuario,
  };
};
