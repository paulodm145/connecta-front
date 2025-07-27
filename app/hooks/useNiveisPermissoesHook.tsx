import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';


export const useNiveisPermissoesHook = () => { 

     const indexNiveis = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/niveis`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar niveis:", error);
            return null;
        }
     }

    const treeViewPermissoes = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/tree-view-permissoes-menu`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar Tree View de Permissoes:", error);
            return null;
        }
     }

     const storeNiveis = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/niveis`, data, {
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

    const getNiveis = async (id : number) => {
        try {
            const response = await axios.get(`${BASE_URL}/niveis/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar niveis:", error);
            return null;
        }
     }

    const updateNiveis = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/niveis/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar nivel:", error);
            return null;
        }
     }

    const changeStatus = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/niveis/change-status/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao mudar status do nivel:", error);
            return null;
        }
    }

    const destroyNivel = async (id: number) => {
        try {
            const response = await axios.delete(`${BASE_URL}/niveis/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            const errorMessage = (error as any).response?.data?.error || "Erro desconhecido";
            toast.error("Erro ao excluir nivel: " + errorMessage);
            console.error("Erro ao excluir nivel:", error);
            return null;
        }
    }

return { 
    indexNiveis,
    treeViewPermissoes,
    updateNiveis,
    storeNiveis,
    changeStatus,
    getNiveis,
    destroyNivel
    };     
};



