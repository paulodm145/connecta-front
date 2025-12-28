import { useCallback } from "react"
import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/empresas"

export const usePdiHook = () => {
  const gerarPdiEnvio = useCallback(async (envioId: number, contextoAdicional?: string) => {
    try {
      const payload = contextoAdicional
        ? { contexto_adicional: contextoAdicional }
        : {}

      const response = await axios.post(
        `${BASE_URL}/envios/${envioId}/pdi/gerar`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao gerar PDI:", error)
      throw error
    }
  }, [])

  const buscarPdiEnvio = useCallback(async (envioId: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/envios/${envioId}/pdi`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Erro ao buscar PDI:", error)
      throw error
    }
  }, [])

  const enviarEmailPdiEnvio = useCallback(async (envioId: number) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/envios/${envioId}/pdi/enviar-email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao enviar PDI por e-mail:", error)
      throw error
    }
  }, [])

  const enviarEmailPdiPesquisa = useCallback(async (pesquisaId: number) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pesquisas/${pesquisaId}/pdi/enviar-email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao enviar PDI em massa:", error)
      throw error
    }
  }, [])

  return {
    gerarPdiEnvio,
    buscarPdiEnvio,
    enviarEmailPdiEnvio,
    enviarEmailPdiPesquisa,
  }
}
