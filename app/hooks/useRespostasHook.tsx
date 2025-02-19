import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

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


return { 
    responder,
};     
};



