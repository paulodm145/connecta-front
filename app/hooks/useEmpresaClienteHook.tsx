import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

export const useEmpresaClienteHook = () => {

    const dadosEmpresa = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/empresa-cliente`, {
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

    const updateEmpresaCliente = async (data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/empresa-cliente`, data, {
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
        dadosEmpresa,
        updateEmpresaCliente
    };
}