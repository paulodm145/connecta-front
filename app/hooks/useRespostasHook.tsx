import axios from "axios";
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
            return { data: response.data, error: null };
        } catch (error: any) {
            console.error("Erro ao salvar resposta:", error);
            const mensagem = error?.response?.data?.message || "Erro ao enviar respostas.";
            return { data: null, error: mensagem };
        }
     } 

     const verificarStatusRespostaExterna = async (
        pesquisaId: number,
        respondente: string,
        tipoEnvio: string,
        identificador: string
     ) => {
        try {
            const response = await axios.get(`${URL_EXTERNA}/externo-respostas/status`, {
                params: {
                    pesquisa_id: pesquisaId,
                    respondente,
                    tipo_envio: tipoEnvio,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Empresa: identificador,
                },
            });
            return { data: response.data, error: null };
        } catch (error: any) {
            console.error("Erro ao verificar status da resposta:", error);
            const mensagem = error?.response?.data?.message || "Erro ao verificar status da resposta.";
            return { data: null, error: mensagem };
        }
     }

return { 
    responder,
    responderExterno,
    verificarStatusRespostaExterna
};     
};
