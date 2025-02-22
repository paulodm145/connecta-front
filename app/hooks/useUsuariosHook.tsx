import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export const useUsuariosHook = () => { 
     const indexUsuario = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/usuarios-admin`, {
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

     const showUsuario = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/usuarios-admin/${id}`, {
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

     const storeUsuario = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/usuarios-admin`, data, {
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

     const updateUsuario = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/usuarios-admin/${id}`, data, {
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

    const destroyUsuario = async (id: number) => {
        try {
            const response = await axios.delete(`${BASE_URL}/usuarios-admin/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error || "Erro ao excluir cargo.";
                toast.error("Erro ao excluir cargo.:" + errorMessage);
            } else {
                toast.error("Erro ao excluir cargo.");
            }
            console.error("Erro ao excluir cargo:", error);
            return null;
        }
    }
    
    const changeStatusUsuario = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/usuarios-admin/change-status/${id}`, {
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
    indexUsuario,
    showUsuario,
    storeUsuario,
    updateUsuario,
    destroyUsuario,
    changeStatusUsuario
    };     
};



