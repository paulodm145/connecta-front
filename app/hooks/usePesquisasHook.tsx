import axios from "axios";
import { useCrud } from "./useCRUD";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';
const URL_EXTERNA = process.env.NEXT_PUBLIC_API_BASE_URL;

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

    const relatorioRespostas = async (slugPesquisa: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/respostas/pesquisa/${slugPesquisa}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar relatório de respostas:", error);
            return null;
        }
    };

    const pesquisaBySlug = async (slug : string) => {
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

    const pesquisaexternaBySlug = async (slug : string, tokenRespondente : string, identificadorEmpresa : string) => {
        try {
            const response = await axios.get(`${URL_EXTERNA}/externo-pesquisas/${slug}?t=${tokenRespondente}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Empresa: identificadorEmpresa,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar formulário:", error);
            return null;
        }
    };

    const dadosDashBoard = async (idPesquisa: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/dados-dashboard/info-respondentes/${idPesquisa}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar dados do dashboard:", error);
            return null;
        }
    }

return { 
        novaPesquisa,
        editarPesquisa,
        changeStatus,
        listagemPesquisa,
        getBySlug,
        relatorioRespostas,
        pesquisaBySlug,
        pesquisaexternaBySlug,
        dadosDashBoard
    };     
};




