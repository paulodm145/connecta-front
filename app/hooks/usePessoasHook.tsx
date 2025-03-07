import axios from "axios";
import { useCrud } from "./useCRUD";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

interface ICargo {
    id: number;
    nome: string;
    descricao: string;
    setor_id: number;
}

export const usePessoasHook = () => { 

    const criarPessoa = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/pessoas`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao cadastrar Pessoas:", error);
            return null;
        }
    }



    const pessoasIndex = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/pessoas`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar responsáveis:", error);
            return null;
        }
    }

    const getPessoasAtivas = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/pessoas-ativas`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar responsáveis:", error);
            return null;
        }
    }

   const getResponsaveis = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/pessoas-responsaveis`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar responsáveis:", error);
            return null;
        }
    }

    const changeStatus = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/pessoas/change-status/${id}`, {
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
    getResponsaveis,
    changeStatus,
    pessoasIndex,
    getPessoasAtivas
    };     
};



