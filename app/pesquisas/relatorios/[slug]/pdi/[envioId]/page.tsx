"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, ArrowLeft } from "lucide-react"
import { usePdiHook } from "@/app/hooks/usePdiHook"

interface CompetenciaPdi {
  competencia_id?: number
  descricao?: string
  nota?: number
  acoes_recomendadas?: string[]
  indicadores_sucesso?: string[]
  prazo_meses?: number
}

interface PlanoPdi {
  objetivo_geral?: string
  competencias?: CompetenciaPdi[]
}

export default function VisualizarPdiPage() {
  const params = useParams()
  const router = useRouter()
  const { buscarPdiEnvio } = usePdiHook()

  const slugPesquisa = params.slug as string
  const envioIdParam = params.envioId as string

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [avaliacao, setAvaliacao] = useState<any>(null)
  const [planoPdi, setPlanoPdi] = useState<PlanoPdi | null>(null)
  const [promptPdi, setPromptPdi] = useState<string | null>(null)
  const [competenciasResumo, setCompetenciasResumo] = useState<any[]>([])

  const title = useMemo(() => {
    if (avaliacao?.respondente) {
      return `PDI de ${avaliacao.respondente}`
    }

    return "Plano de Desenvolvimento Individual"
  }, [avaliacao])

  useEffect(() => {
    const carregarPdi = async () => {
      const envioId = Number(envioIdParam)

      if (!envioId) {
        setErro("Envio inválido para visualizar o PDI.")
        setLoading(false)
        return
      }

      try {
        const dados = await buscarPdiEnvio(envioId)

        const avaliacaoDados = dados.avaliacao || dados.resposta?.avaliacao
        const plano = dados.pdi || dados.resposta?.pdi || null
        const competencias = plano?.competencias || dados.competencias || []
        const prompt = dados.prompt || dados.resposta?.prompt || null

        setAvaliacao(avaliacaoDados)
        setPlanoPdi(plano)
        setCompetenciasResumo(competencias)
        setPromptPdi(prompt)
      } catch (error) {
        console.error("Erro ao carregar PDI:", error)
        setErro("Não foi possível carregar o PDI gerado para este envio.")
      } finally {
        setLoading(false)
      }
    }

    carregarPdi()
  }, [buscarPdiEnvio, envioIdParam])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando PDI...
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Envio #{envioIdParam}</p>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            {title}
          </h1>
          {avaliacao?.data_envio && (
            <p className="text-sm text-muted-foreground">Enviado em {avaliacao.data_envio}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/pesquisas/relatorios/${slugPesquisa}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para respostas
          </Button>
        </div>
      </div>

      {erro && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {avaliacao && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do envio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-4">
              <span>
                <strong>Respondente:</strong> {avaliacao.respondente || "Não informado"}
              </span>
              <span>
                <strong>Pesquisa:</strong> {avaliacao.pesquisa_id || "-"}
              </span>
              <span>
                <strong>Formulário:</strong> {avaliacao.formulario_id || "-"}
              </span>
            </div>
            {avaliacao.token_respondente && (
              <p className="text-muted-foreground">Token: {avaliacao.token_respondente}</p>
            )}
          </CardContent>
        </Card>
      )}

      {promptPdi && (
        <Card>
          <CardHeader>
            <CardTitle>Prompt utilizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{promptPdi}</p>
          </CardContent>
        </Card>
      )}

      {planoPdi ? (
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
                <div key={`${item.competencia_id}-${index}`} className="border rounded-lg p-4 space-y-2">
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
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {item.acoes_recomendadas.map((acao: string, idx: number) => (
                          <li key={`${acao}-${idx}`}>{acao}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.indicadores_sucesso && item.indicadores_sucesso.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Indicadores de sucesso</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {item.indicadores_sucesso.map((indicador: string, idx: number) => (
                          <li key={`${indicador}-${idx}`}>{indicador}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.prazo_meses && (
                    <p className="text-sm text-muted-foreground">Prazo sugerido: {item.prazo_meses} meses</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Plano não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este envio ainda não possui um PDI gerado. Volte para a listagem de respostas e clique em "Gerar PDI" para criar um
              plano.
            </p>
          </CardContent>
        </Card>
      )}

      {competenciasResumo.length > 0 && !planoPdi && (
        <Card>
          <CardHeader>
            <CardTitle>Competências avaliadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {competenciasResumo.map((competencia, index) => (
              <div key={`${competencia.competencia_id}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{competencia.descricao}</p>
                  {competencia.nota && (
                    <Badge variant="secondary">Nota: {Number(competencia.nota).toFixed(2)}</Badge>
                  )}
                </div>
                {competencia.prompt_pdi && (
                  <>
                    <p className="text-xs uppercase text-muted-foreground">Prompt sugerido</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {competencia.prompt_pdi}
                    </p>
                  </>
                )}
                {index < competenciasResumo.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
