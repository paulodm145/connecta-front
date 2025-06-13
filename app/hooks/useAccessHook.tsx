import axios from "axios";
import { toast } from 'react-toastify'

export const useAccessHook = () => {

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const logout = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/logout`,{},
         {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },  
      });
      
      return response;
    } catch (error) {
      console.error("Erro durante o logout:", error);
      alert("Erro ao tentar sair. Tente novamente.1111111111");
    }
  }

  const getUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return null;
    }
  }

  const verifyToken = async (token: string, email: string) => {
    console.log("Verificando token:", token, email);
    try {
      const response = await axios.post(`${BASE_URL}/password/verify-token`, {
        token,
        email,
      });
      return response;
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          Object.keys(errors).forEach((key) => {
            errors[key].forEach((message: string) => {
              toast.error(message);
            });
          });
        } else {
          toast.error("Erro de validação desconhecido.");
          window.location.href = "/acesso/esqueceu";
        }
        return false;
      } else {
        console.error("Erro ao verificar token:", error);
        toast.error("Erro ao tentar verificar o token. Tente novamente.");
      }
      throw error;
    }
  };

  const redefinirSenha = async (email: string, password: string, password_dois: string, token: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/password/reset`, {
        email,
        password,
        password_dois,
        token
      });
      return response;
    } catch (error: any) {
      return error.response.data;
    }
  }

  const verificarEmail = async (email: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/password/email`, {
        email,
      });
      return response;
    } catch (error: any) {
      return error.response.data;
    }
  }

  return { 
    logout,
    getUser,
    verifyToken,
    redefinirSenha,
    verificarEmail
  };

}