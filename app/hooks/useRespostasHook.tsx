import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';
const URL_EXTERNA = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useRespostasHook = () => { 

     const responder = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/respostas`, data, {
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

     const responderExterno = async (data: any, tokenUsuario: string, identificador: string) => {
        try {
            const response = await axios.post(`${URL_EXTERNA}/externo-respostas?t=${tokenUsuario}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Empresa: identificador
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao salvar resposta:", error);
            return null;
        }
     } 

return { 
    responder,
    responderExterno
};     
};



