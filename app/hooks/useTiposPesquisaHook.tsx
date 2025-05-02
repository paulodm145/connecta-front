import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

interface ICargo {
    id: number;
    nome: string;
    descricao: string;
    setor_id: number;
}

export const useTiposPesquisaHook = () => { 
     const index = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/tipos-pesquisas`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar Tipo Pesquisa:", error);
            return null;
        }
     }

     const show = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/tipos-pesquisas/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar Tipo Pesquisa:", error);
            return null;
        }
     }

     const store = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/tipos-pesquisas`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao salvar  Tipo Pesquisa:", error);
            return null;
        }
     }

     const update = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/tipos-pesquisas/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar cargo:", error);
            return null;
        }
     }

    const destroy = async (id: number) => {
        try {
            const response = await axios.delete(`${BASE_URL}/tipos-pesquisas/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error("Erro ao excluir Tipo pesquisa.:" + error.response.data?.error);
            } else {
                toast.error("Erro ao excluir Tipo pesquisa.");
            }
            console.error("Erro ao excluir Tipo Pesquisa:", error);
            return null;
        }
    }
    
    const changeStatus = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/tipos-pesquisas/change-status/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao mudar status do Tipo Pesquisa:", error);
            return null;
        }
    }

    const pesquisasAtivas = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/tipos-pesquisas/pesquisas-ativas`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar Pesquisas Ativas:", error);
            return null;
        }    
    }

return { 
        index,
        show,
        store,
        update,
        destroy,
        changeStatus,
        pesquisasAtivas
    };     
};
