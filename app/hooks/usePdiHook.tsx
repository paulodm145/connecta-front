import { useCallback } from "react"
import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/empresas"
const URL_EXTERNA = process.env.NEXT_PUBLIC_API_BASE_URL

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

  const consultarStatusPdi = useCallback(async (envioId: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/envios/${envioId}/pdi/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Erro ao consultar status do PDI:", error)
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

  const gerarLotePdi = useCallback(async (envioIds: number[], contextoAdicional?: string) => {
    try {
      const payload: { envio_ids: number[]; contexto_adicional?: string } = { envio_ids: envioIds }
      if (contextoAdicional) payload.contexto_adicional = contextoAdicional

      const response = await axios.post(
        `${BASE_URL}/pdis/gerar-lote`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao gerar PDIs em lote:", error)
      throw error
    }
  }, [])

  const consultarStatusLotePdi = useCallback(async (envioIds: number[]) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pdis/status-lote`,
        { envio_ids: envioIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao consultar status do lote de PDIs:", error)
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

  const enviarWhatsappPdiEnvio = useCallback(async (envioId: number) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/envios/${envioId}/pdi/enviar-whatsapp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao enviar PDI por WhatsApp:", error)
      throw error
    }
  }, [])

  const enviarWhatsappPdiPesquisa = useCallback(async (pesquisaId: number) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pesquisas/${pesquisaId}/pdi/enviar-whatsapp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error("Erro ao enviar PDI em massa por WhatsApp:", error)
      throw error
    }
  }, [])

  const buscarPdiPublico = useCallback(async (token: string, identificadorEmpresa: string) => {
    try {
      const response = await axios.get(`${URL_EXTERNA}/externo-pdi/${token}`, {
        headers: {
          Empresa: identificadorEmpresa,
        },
      })

      return response.data
    } catch (error) {
      console.error("Erro ao buscar PDI público:", error)
      throw error
    }
  }, [])

  return {
    gerarPdiEnvio,
    consultarStatusPdi,
    buscarPdiEnvio,
    buscarPdiPublico,
    enviarEmailPdiEnvio,
    enviarEmailPdiPesquisa,
    enviarWhatsappPdiEnvio,
    enviarWhatsappPdiPesquisa,
    gerarLotePdi,
    consultarStatusLotePdi,
  }
}
