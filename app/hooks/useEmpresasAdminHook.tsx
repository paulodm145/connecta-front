import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas-admin';

export const useEmpresaAdminHook = () => {

    const indexEmpresas = async () => {
        try {
            const response = await axios.get(`${BASE_URL}`, {
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

     const showEmpresa = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, {
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

     const storeEmpresa = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}`, data, {
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

     const updateEmpresa = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, data, {
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

    const destroyEmpresa = async (id: number) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`, {
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
            const response = await axios.get(`${BASE_URL}/change-status/${id}`, {
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
    indexEmpresas,
    showEmpresa,
    storeEmpresa,
    updateEmpresa,
    destroyEmpresa,
    changeStatus
    };     
}