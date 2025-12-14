import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export interface Competencia {
  id: number;
  descricao: string;
  prompt_pdi: string;
  ativo: boolean;
}

export const useCompetenciasHook = () => {
  const index = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/competencias`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as Competencia[];
    } catch (error) {
      console.error("Erro ao buscar competências:", error);
      toast.error("Erro ao buscar competências.");
      return null;
    }
  };

  const show = async (id: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/competencias/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as Competencia;
    } catch (error) {
      console.error("Erro ao buscar competência:", error);
      toast.error("Erro ao buscar competência.");
      return null;
    }
  };

  const store = async (data: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/competencias`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as Competencia;
    } catch (error) {
      console.error("Erro ao salvar competência:", error);
      toast.error("Erro ao salvar competência.");
      return null;
    }
  };

  const update = async (id: number, data: any) => {
    try {
      const response = await axios.put(`${BASE_URL}/competencias/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as Competencia;
    } catch (error) {
      console.error("Erro ao atualizar competência:", error);
      toast.error("Erro ao atualizar competência.");
      return null;
    }
  };

  const destroy = async (id: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/competencias/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = (error as any).response?.data?.error || "Erro desconhecido";
      toast.error("Erro ao excluir competência: " + errorMessage);
      console.error("Erro ao excluir competência:", error);
      return null;
    }
  };

  const changeStatus = async (id: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/competencias/change-status/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as Competencia;
    } catch (error) {
      console.error("Erro ao mudar status da competência:", error);
      toast.error("Erro ao alterar status da competência.");
      return null;
    }
  };

  return {
    index,
    show,
    store,
    update,
    destroy,
    changeStatus,
  };
};
