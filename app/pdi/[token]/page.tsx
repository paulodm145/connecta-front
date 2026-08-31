"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { usePdiHook } from "@/app/hooks/usePdiHook"

interface RecursoPdi {
  id?: number
  titulo?: string
  link?: string
  descricao?: string
}

interface CompetenciaPdi {
  competencia_id?: number
  descricao?: string
  nota?: number
  acoes_recomendadas?: string[]
  indicadores_sucesso?: string[]
  prazo_meses?: number
  livros_pdi?: RecursoPdi[]
  videos_pdi?: RecursoPdi[]
}

interface PlanoPdi {
  objetivo_geral?: string
  competencias?: CompetenciaPdi[]
}

export default function PdiPublicoPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string
  const identificadorEmpresa = searchParams.get("e")

  const { buscarPdiPublico } = usePdiHook()

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [respondente, setRespondente] = useState<string | null>(null)
  const [statusPdi, setStatusPdi] = useState<string | null>(null)
  const [planoPdi, setPlanoPdi] = useState<PlanoPdi | null>(null)
  const [competenciasResumo, setCompetenciasResumo] = useState<CompetenciaPdi[]>([])

  useEffect(() => {
    if (!token || !identificadorEmpresa) {
      setErro("Link inválido. Verifique se o endereço foi copiado corretamente.")
      setCarregando(false)
      return
    }

    const carregar = async () => {
      try {
        setCarregando(true)
        const dados = await buscarPdiPublico(token, identificadorEmpresa)

        const respostaPdi = dados?.pdi?.resposta ?? null
        const plano: PlanoPdi | null = respostaPdi?.pdi ?? null
        const competenciasOrigem: CompetenciaPdi[] = dados?.competencias ?? []
        const competenciasPlano = plano?.competencias ?? []

        const competencias =
          competenciasPlano.length > 0
            ? competenciasPlano.map((competencia: CompetenciaPdi) => {
                const origem = competenciasOrigem.find(
                  (item) =>
                    item.competencia_id === competencia.competencia_id ||
                    item.descricao === competencia.descricao
                )
                return {
                  ...origem,
                  ...competencia,
                  descricao: competencia.descricao || origem?.descricao,
                  nota: competencia.nota ?? origem?.nota,
                }
              })
            : competenciasOrigem

        setRespondente(dados?.avaliacao?.respondente ?? null)
        setStatusPdi(dados?.pdi?.status ?? null)
        setPlanoPdi(plano)
        setCompetenciasResumo(competencias)
        setErro(null)
      } catch (error: any) {
        console.error("Erro ao carregar PDI público:", error)
        const mensagem = error?.response?.data?.message
        setErro(mensagem || "Não foi possível carregar o PDI. O link pode estar expirado ou inválido.")
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [token, identificadorEmpresa])

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-2 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Carregando seu Plano de Desenvolvimento Individual...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Não foi possível abrir o PDI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{erro}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!planoPdi || statusPdi !== "concluido") {
    const mensagem =
      statusPdi === "processando"
        ? "Seu plano de desenvolvimento ainda está sendo gerado. Tente novamente em alguns minutos."
        : statusPdi === "falhou"
          ? "Não foi possível gerar seu plano de desenvolvimento. Entre em contato com o RH."
          : "Seu plano de desenvolvimento ainda não foi gerado. Entre em contato com o RH."

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>PDI ainda não disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{mensagem}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {respondente ? `PDI de ${respondente}` : "Plano de Desenvolvimento Individual"}
          </h1>
          <p className="text-sm text-slate-500">Seu Plano de Desenvolvimento Individual (PDI)</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plano de Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planoPdi.objetivo_geral && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Objetivo geral</p>
                <p className="text-base font-medium">{planoPdi.objetivo_geral}</p>
              </div>
            )}

            <div className="space-y-3">
              {competenciasResumo.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma competência retornada para este PDI.</p>
              )}

              {competenciasResumo.map((item, index) => (
                <div key={`${item.competencia_id}-${index}`} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Competência</p>
                      <p className="text-base font-semibold">{item.descricao || "Competência"}</p>
                    </div>
                    {item.nota !== undefined && (
                      <Badge variant="secondary">Nota: {Number(item.nota).toFixed(2)}</Badge>
                    )}
                  </div>

                  {item.acoes_recomendadas && item.acoes_recomendadas.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Ações recomendadas</p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {item.acoes_recomendadas.map((acao, idx) => (
                          <li key={`${acao}-${idx}`}>{acao}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.indicadores_sucesso && item.indicadores_sucesso.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Indicadores de sucesso</p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {item.indicadores_sucesso.map((indicador, idx) => (
                          <li key={`${indicador}-${idx}`}>{indicador}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.prazo_meses && (
                    <p className="text-sm text-muted-foreground">Prazo sugerido: {item.prazo_meses} meses</p>
                  )}

                  {item.livros_pdi && item.livros_pdi.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Livros recomendados</p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {item.livros_pdi.map((livro, idx) => (
                          <li key={`${livro.titulo}-${idx}`}>
                            <span className="font-medium">{livro.titulo}</span>
                            {livro.descricao && <span className="text-muted-foreground"> — {livro.descricao}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.videos_pdi && item.videos_pdi.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Vídeos recomendados</p>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {item.videos_pdi.map((video, idx) => (
                          <li key={`${video.titulo}-${idx}`} className="space-y-1">
                            <div className="flex flex-col">
                              <span className="font-medium">{video.titulo}</span>
                              {video.link && (
                                <a
                                  href={video.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-amber-700 hover:underline"
                                >
                                  {video.link}
                                </a>
                              )}
                            </div>
                            {video.descricao && <p className="text-sm text-muted-foreground">{video.descricao}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
