import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/empresas"

export const usePdiHook = () => {
  const gerarPdiEnvio = async (envioId: number, contextoAdicional?: string) => {
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
  }

  return {
    gerarPdiEnvio,
  }
}
