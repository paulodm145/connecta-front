import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export const useRespondentesHook = () => { 
     const index = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/respondentes`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar respondentes:", error);
            return null;
        }
     }

     const show = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/respondentes/${id}`, {
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
            const response = await axios.post(`${BASE_URL}/respondentes`, data, {
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
            const response = await axios.put(`${BASE_URL}/respondentes/${id}`, data, {
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
            const response = await axios.delete(`${BASE_URL}/respondentes/${id}`, {
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
            const response = await axios.get(`${BASE_URL}/respondentes/change-status/${id}`, {
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

    const getRespondentesByPesquisaSlug = async (slug : string) => {
        try {
            const response = await axios.get(`${BASE_URL}/respondentes/pesquisa/${slug}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar respondentes por pesquisa:", error);
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
    getRespondentesByPesquisaSlug
    };     
};



