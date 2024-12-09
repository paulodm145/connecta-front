import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

interface ICargo {
    id: number;
    nome: string;
    descricao: string;
    setor_id: number;
}

export const useCargosHook = () => { 
     const index = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/cargos`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar cargos:", error);
            return null;
        }
     }

     const show = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/cargos/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar cargo:", error);
            return null;
        }
     }

     const store = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/cargos`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao salvar cargo:", error);
            return null;
        }
     }

     const update = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/cargos/${id}`, data, {
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
            const response = await axios.delete(`${BASE_URL}/cargos/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            toast.error("Erro ao excluir cargo.:" + error.response.data?.error);
            console.error("Erro ao excluir cargo:", error);
            return null;
        }
    }
    
    const changeStatus = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/cargos/change-status/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao mudar status do setor:", error);
            return null;
        }
    }

return { 
    index,
    show,
    store,
    update,
    destroy,
    changeStatus
    };     
};



