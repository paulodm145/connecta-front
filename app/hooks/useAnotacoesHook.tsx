import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';


export const useAnotacoesHook = () => { 

    
    const createAnotacao = async (dados : any) => {
        try {
            const response = await axios.post(`${BASE_URL}/anotacoes-envio`, {
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

return { 
    createAnotacao,
    getAnotacaoAvaliado,
    getAnotacaoAvaliadorLider,
    getAnotacaoPDI
};     

};



