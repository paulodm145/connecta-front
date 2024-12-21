import axios from "axios";
import { useCrud } from "./useCRUD";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export const useFormulariosHook = () => { 

    const listagemFormularios = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/formularios`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar formulários:", error);
            return null;
        }
    }

    const novoFormulario = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/formularios`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao criar formulário:", error);
            return null;
        }
    }

    const editarFormulario = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/formularios/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao editar formulário:", error);
            return null;
        }
    }

    const changeStatus = async (id: number) => {
            try {
                const response = await axios.get(`${BASE_URL}/formularios/change-status/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error("Erro ao mudar status do formulário:", error);
                return null;
        }

    }

return { 
    novoFormulario,
    editarFormulario,
    changeStatus,
    listagemFormularios
    
    };     
};




