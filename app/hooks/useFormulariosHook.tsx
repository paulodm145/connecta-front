import axios from "axios";
import { useCrud } from "./useCRUD";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas';
const URL_EXTERNA = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useFormulariosHook = () => { 

    const listagemFormularios = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/formularios`, {
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

    const novoFormulario = async (data: any) => {
        try {
            const response = await axios.post(`${BASE_URL}/formularios`, data, {
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

    const editarFormulario = async (id: number, data: any) => {
        try {
            const response = await axios.put(`${BASE_URL}/formularios/${id}`, data, {
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

    const deletarFormulario = async (id: number) => {
        try {
            const response = await axios.delete(`${BASE_URL}/formularios/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error: any) {
            // A API responde 400 (em uso) e 404 (não encontrado) com o mesmo
            // formato { status, message, data } do sucesso — repassamos o corpo
            // para o chamador tratar pelo campo `status`.
            if (error.response?.data) {
                return error.response.data;
            }
            console.error("Erro ao excluir formulário:", error);
            return null;
        }
    }

    const changeStatus = async (id: number) => {
            try {
                const response = await axios.get(`${BASE_URL}/formularios/change-status/${id}`, {
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
            const response = await axios.get(`${BASE_URL}/formularios/slug/${slug}`, {
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

    const formulariosAtivos = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/formularios-ativos`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao carregar os setores:', error);
            return null;
        }
    }

    const exportarFormulario = async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/formularios/${id}/exportar`, {
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao exportar formulário:", error);
            return null;
        }
    }

    const importarFormulario = async (arquivo: File) => {
        const formData = new FormData();
        formData.append("arquivo", arquivo);
        try {
            const response = await axios.post(`${BASE_URL}/formularios/importar`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao importar formulário:", error);
            return null;
        }
    }

    const formularioExternoBySlug = async (slug : string, tokenRespondente : string, identificadorEmpresa : string) => {
        try {
            const response = await axios.get(`${URL_EXTERNA}/externo-formularios/${slug}?t=${tokenRespondente}`, {
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

    return {
            novoFormulario,
            editarFormulario,
            deletarFormulario,
            changeStatus,
            listagemFormularios,
            getBySlug,
            formulariosAtivos,
            formularioExternoBySlug,
            exportarFormulario,
            importarFormulario
        };     
};




