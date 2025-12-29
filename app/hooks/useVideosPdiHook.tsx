import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export interface VideoPdi {
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

export const useVideosPdiHook = () => {
  const index = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/videos-pdi`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as VideoPdi[];
    } catch (error) {
      console.error("Erro ao buscar vídeos do PDI:", error);
      toast.error("Erro ao buscar vídeos do PDI.");
      return null;
    }
  };

  const show = async (id: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/videos-pdi/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as VideoPdi;
    } catch (error) {
      console.error("Erro ao buscar vídeo do PDI:", error);
      toast.error("Erro ao buscar vídeo do PDI.");
      return null;
    }
  };

  const store = async (data: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/videos-pdi`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as VideoPdi;
    } catch (error) {
      console.error("Erro ao salvar vídeo do PDI:", error);
      toast.error("Erro ao salvar vídeo do PDI.");
      return null;
    }
  };

  const update = async (id: number, data: any) => {
    try {
      const response = await axios.put(`${BASE_URL}/videos-pdi/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data as VideoPdi;
    } catch (error) {
      console.error("Erro ao atualizar vídeo do PDI:", error);
      toast.error("Erro ao atualizar vídeo do PDI.");
      return null;
    }
  };

  const destroy = async (id: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/videos-pdi/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = (error as any).response?.data?.error || "Erro desconhecido";
      toast.error("Erro ao excluir vídeo do PDI: " + errorMessage);
      console.error("Erro ao excluir vídeo do PDI:", error);
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
