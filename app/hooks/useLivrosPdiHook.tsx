import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export interface LivroPdi {
  id: number;
  competencia_id: number;
  titulo: string;
  link: string;
  descricao: string;
  competencia?: {
    id: number;
    descricao: string;
  };
}

export const useLivrosPdiHook = () => {
  const index = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/livros-pdi`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as LivroPdi[];
    } catch (error) {
      console.error("Erro ao buscar livros do PDI:", error);
      toast.error("Erro ao buscar livros do PDI.");
      return null;
    }
  };

  const show = async (id: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/livros-pdi/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as LivroPdi;
    } catch (error) {
      console.error("Erro ao buscar livro do PDI:", error);
      toast.error("Erro ao buscar livro do PDI.");
      return null;
    }
  };

  const store = async (data: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/livros-pdi`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as LivroPdi;
    } catch (error) {
      console.error("Erro ao salvar livro do PDI:", error);
      toast.error("Erro ao salvar livro do PDI.");
      return null;
    }
  };

  const update = async (id: number, data: any) => {
    try {
      const response = await axios.put(`${BASE_URL}/livros-pdi/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as LivroPdi;
    } catch (error) {
      console.error("Erro ao atualizar livro do PDI:", error);
      toast.error("Erro ao atualizar livro do PDI.");
      return null;
    }
  };

  const destroy = async (id: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/livros-pdi/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = (error as any).response?.data?.error || "Erro desconhecido";
      toast.error("Erro ao excluir livro do PDI: " + errorMessage);
      console.error("Erro ao excluir livro do PDI:", error);
      return null;
    }
  };

  return {
    index,
    show,
    store,
    update,
    destroy,
  };
};
