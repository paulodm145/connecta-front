import axios from "axios";
import { toast } from 'react-toastify'

export const useEstadosCidadesHook = () => {

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';

  const getCidades = async (sigla :  string) => {
        try {
            const response = await axios.get(`${BASE_URL}/cidades?uf=${sigla.toLocaleUpperCase()}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar cidades:", error);
            return null;
        }
    }

  const getEstados = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/estados`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar estados:", error);
            return
        }
    }

  return { 
    getCidades,
    getEstados
  };

}