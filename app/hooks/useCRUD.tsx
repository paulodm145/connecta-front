import { useState, useCallback, useRef } from "react";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { toast } from "react-toastify";

interface UseCrudReturn<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  get: (endpoint: string, headers?: Record<string, string>) => Promise<T>;
  post: (endpoint: string, body: unknown, headers?: Record<string, string>) => Promise<T>;
  put: (endpoint: string, body: unknown, headers?: Record<string, string>) => Promise<T>;
  del: (endpoint: string, headers?: Record<string, string>) => Promise<T>;
}

export function useCrud<T = any>(
  baseUrl: string = "",
  defaultHeaders: Record<string, string> = {}
): UseCrudReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  // Adiciona a URL base da API
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL + '/empresas' + baseUrl;

  // Guarda os cabeçalhos padrão em uma referência estável: o objeto literal
  // passado pelas telas muda de identidade a cada render e fazia get/post/put/del
  // mudarem junto, redisparando efeitos que dependem deles (requisições repetidas).
  const cabecalhosPadrao = useRef(defaultHeaders);

  const request = useCallback(
    async (endpoint: string, method: AxiosRequestConfig["method"] = "GET", body: unknown = null, headers: Record<string, string> = {}) => {
      setLoading(true);
      setError(null);

      // Lê o token no momento da requisição (fica atualizado após o login)
      const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await axios({
          url: `${baseUrl}/${endpoint}`,
          method,
          headers: {
            ...cabecalhosPadrao.current,
            ...authHeaders,
            ...headers,
          },
          data: body,
        });

        setData(response.data);
        return response.data;
      } catch (err) {
        const axiosErr = err as AxiosError;
        const message = axiosErr.response?.data && typeof axiosErr.response.data === 'object'
          ? (axiosErr.response.data as any).message || axiosErr.message
          : axiosErr.message;
        // 403 já é tratado globalmente pelo interceptor de permissões
        if (axiosErr.response?.status !== 403) {
          toast.error(message);
        }
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  const get = useCallback(async (endpoint: string, headers?: Record<string, string>) => {
    return request(endpoint, "GET", null, headers);
  }, [request]);

  const post = useCallback(async (endpoint: string, body: unknown, headers?: Record<string, string>) => {
    return request(endpoint, "POST", body, headers);
  }, [request]);

  const put = useCallback(async (endpoint: string, body: unknown, headers?: Record<string, string>) => {
    return request(endpoint, "PUT", body, headers);
  }, [request]);

  const del = useCallback(async (endpoint: string, headers?: Record<string, string>) => {
    return request(endpoint, "DELETE", null, headers);
  }, [request]);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    del,
  };
}
