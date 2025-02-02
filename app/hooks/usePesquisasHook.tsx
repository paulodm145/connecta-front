import axios from "axios";
import { useCrud } from "./useCRUD";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export const usePesquisasHook = () => { 

    const listagemPesquisa = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/pesquisas`, {
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

    const novaPesquisa = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/pesquisas`, data, {
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

    const editarPesquisa = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/pesquisas/${id}`, data, {
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
                const response = await axios.get(`${BASE_URL}/pesquisas/change-status/${id}`, {
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

    const getBySlug = async (slug: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/pesquisas/slug/${slug}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar formulário:", error);
            return null;
        }
    };

return { 
        novaPesquisa,
        editarPesquisa,
        changeStatus,
        listagemPesquisa,
        getBySlug
    };     
};




