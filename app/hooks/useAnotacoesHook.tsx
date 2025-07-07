import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';


export const useAnotacoesHook = () => { 

    
    const createAnotacao = async (dados : any) => {
        try {
            const response = await axios.post(`${BASE_URL}/anotacoes-envio`, dados, {
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

    const getAnotacaoAvaliado = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/anotacoes-envio-avaliado/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar anotação de avaliação:", error);
            toast.error("Erro ao buscar anotação de avaliação.");
            return null;
        }
    }

    const getAnotacaoAvaliadorLider = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/anotacoes-envio-avaliador-lider/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar anotação de avaliação:", error);
            toast.error("Erro ao buscar anotação de avaliação.");
            return null;
        }
    }

    const getAnotacaoPDI = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/anotacoes-envio-pdi/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar anotação de avaliação:", error);
            toast.error("Erro ao buscar anotação de avaliação.");
            return null;
        }
    }

    const createAnotacaoLider = async (dados : any) => {
        try {
            const response = await axios.post(`${BASE_URL}/anotacao-avaliacao-lider`, dados, {
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

    const getAnotacaoBySlug = async (slug: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/anotacoes-slug/${slug}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar anotação:", error);
            toast.error("Erro ao buscar anotação.");
            return null;
        }
    }

    const getAnotacaoLider  = async (slug: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/anotacoes-lider/${slug}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar anotação de avaliação:", error);
            toast.error("Erro ao buscar anotação de avaliação.");
            return null;
        }
    }

return { 
    createAnotacao,
    getAnotacaoAvaliado,
    getAnotacaoAvaliadorLider,
    getAnotacaoPDI,
    createAnotacaoLider,
    getAnotacaoBySlug,
    getAnotacaoLider
};     

};



