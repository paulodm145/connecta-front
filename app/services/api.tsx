import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 403 = usuário autenticado sem permissão para a ação: avisa e não desloga.
// O toastId evita toasts duplicados quando várias requisições falham juntas.
const tratarErroSemPermissao = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    toast.error('Você não tem permissão para executar esta ação.', {
      toastId: 'sem-permissao',
    });
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, tratarErroSemPermissao);
// Cobre também os hooks que usam a instância padrão do axios
axios.interceptors.response.use((response) => response, tratarErroSemPermissao);

export default api;
