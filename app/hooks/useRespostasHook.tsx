import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';
const URL_EXTERNA = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useRespostasHook = () => { 

     const extrairMensagemErroExterno = (error: any) => {
        const resposta = error?.response?.data;
        const mensagemErro = resposta?.error;
        const mensagemPadrao = resposta?.message;

        if (typeof mensagemErro === "string" && mensagemErro.trim()) {
            return mensagemErro;
        }

        if (
            typeof mensagemPadrao === "string" &&
            mensagemPadrao.trim() &&
            mensagemPadrao.toLowerCase() !== "internal server error."
        ) {
            return mensagemPadrao;
        }

        return "Não foi possível enviar as respostas. Tente novamente em instantes.";
     }

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
            const mensagem = extrairMensagemErroExterno(error);
            return { data: null, error: mensagem };
        }
     } 

return { 
    responder,
    responderExterno
};     
};
