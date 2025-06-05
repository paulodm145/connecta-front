"use client"

import BasicDataTable from "@/components/BasicDataTable"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { usePesquisasHook } from "@/app/hooks/usePesquisasHook"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveBar } from "@/components/chart"
import { Progress } from "@/components/ui/progress"
import { UserIcon, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { exportChart } from "@/lib/export-utils"
import { Badge } from "@/components/ui/badge"
import { downloadFile } from "@/app/utils/Helpers"
import { toast } from "react-toastify"
import { EditModal } from "./edit-modal"
import { useAnotacoesHook } from "@/app/hooks/useAnotacoesHook"

interface ScoreItem {
  name: string
  first_name: string
  score: number
  color: string
  [key: string]: string | number
}

interface RespostaDados {
  total_respondentes: number
  responderam: number
  nao_responderam: number
  taxa_resposta: number
  score: ScoreItem[]
}

// Enum para tipos de anotação
enum TipoAnotacao {
  AVALIADO = "AVALIADO",
  AVALIADOR_LIDER = "AVALIADOR_LIDER",
  PDI_AVALIADO = "PDI_AVALIADO",
}

export default function Page() {
  const params = useParams()
  const slugPesquisa = params.slug as string

  const { relatorioRespostas, dadosDashBoard, exportarDados, getBySlug } = usePesquisasHook()

  const [respostas, setRespostas] = useState<any[]>([])
  const [colunas, setColunas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [numRespondidos, setNumRespondidos] = useState(0)
  const [numNaoResponderam, setNumNaoResponderam] = useState(0)
  const [totalRespondentes, setTotalRespondentes] = useState(0)
  const [responseRate, setresponseRate] = useState(0)
  const [topScorers, setTopScorers] = useState<ScoreItem[]>([])
  const [pesquisa, setPesquisa] = useState<any>(null)

  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [currentAnnotationType, setCurrentAnnotationType] = useState<TipoAnotacao>(TipoAnotacao.AVALIADO)

  const { createAnotacao, getAnotacaoAvaliado, getAnotacaoAvaliadorLider, getAnotacaoPDI } = useAnotacoesHook()

  const chartRef = useRef(null)

  const fetchRelatorio = async () => {
    try {
      const pesquisaData = await getBySlug(slugPesquisa)
      setPesquisa(pesquisaData)

      if (!pesquisaData || !pesquisaData.id) {
        toast.error("Pesquisa não encontrada ou inválida.")
        console.error("Pesquisa não encontrada ou inválida.")
        setLoading(false)
        return
      }

      const retornoRespostas = await relatorioRespostas(slugPesquisa)
      const retornoDashboard: RespostaDados = (await dadosDashBoard(pesquisaData.id)) ?? {
        total_respondentes: 0,
        responderam: 0,
        nao_responderam: 0,
        taxa_resposta: 0,
        score: [],
      }

      setRespostas(retornoRespostas.data)
      setColunas(retornoRespostas.columns)
      setNumRespondidos(retornoDashboard.responderam)
      setNumNaoResponderam(retornoDashboard.nao_responderam)
      setTotalRespondentes(retornoDashboard.total_respondentes)
      setresponseRate(retornoDashboard.taxa_resposta)

      const formattedScores = retornoDashboard.score.map((item: ScoreItem) => ({
        name: item.name,
        first_name: item.first_name,
        score: item.score,
        color: item.color || "#ccc",
      }))

      setTopScorers(formattedScores)
    } catch (error) {
      console.error("Erro ao buscar relatório de respostas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatorio()
  }, [])

  const handleExport = async () => {
    try {
      const dadosExportar = await exportarDados(slugPesquisa)

      if (!dadosExportar || !dadosExportar.base64 || !dadosExportar.filename) {
        console.error("Dados inválidos ao exportar.")
        return
      }

      downloadFile(dadosExportar.base64, dadosExportar.filename, dadosExportar.mimeType)
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
    }
  }

  // Função genérica para buscar anotações baseada no tipo
  const buscarAnotacao = async (envioId: string, tipo: TipoAnotacao) => {
    try {
      let anotacao
      switch (tipo) {
        case TipoAnotacao.AVALIADO:
          anotacao = await getAnotacaoAvaliado(envioId)
          break
        case TipoAnotacao.AVALIADOR_LIDER:
          anotacao = await getAnotacaoAvaliadorLider(envioId)
          break
        case TipoAnotacao.PDI_AVALIADO:
          anotacao = await getAnotacaoPDI(envioId)
          break
        default:
          throw new Error(`Tipo de anotação inválido: ${tipo}`)
      }

      return anotacao && anotacao.length > 0 ? anotacao[0].anotacao : ""
    } catch (error) {
      console.error(`Erro ao buscar anotação do tipo ${tipo}:`, error)
      toast.error(`Erro ao buscar anotação do tipo ${tipo}.`)
      return ""
    }
  }

  // Função genérica para abrir modal de anotações
  const handleOpenAnnotationModal = async (row: any, tipo: TipoAnotacao) => {
    setCurrentAnnotationType(tipo)

    // Busca a anotação existente
    const anotacaoExistente = await buscarAnotacao(row.envio_id, tipo)

    // Atualiza a linha selecionada com a anotação
    setSelectedRow({ ...row, anotacao: anotacaoExistente })

    // Define o título do modal baseado no tipo
    const tipoTexto = {
      [TipoAnotacao.AVALIADO]: "Avaliado",
      [TipoAnotacao.AVALIADOR_LIDER]: "Avaliador/Líder",
      [TipoAnotacao.PDI_AVALIADO]: "PDI do Avaliado",
    }

    setModalTitle(`Anotações ${tipoTexto[tipo]}: ${row.respondente || "Usuário"}`)
    setIsModalOpen(true)
  }

  // Funções específicas para cada tipo de anotação
  const handleOpenNotesAvaliadoModal = (row: any) => {
    handleOpenAnnotationModal(row, TipoAnotacao.AVALIADO)
  }

  const handleOpenNotesAvaliadorLiderModal = (row: any) => {
    handleOpenAnnotationModal(row, TipoAnotacao.AVALIADOR_LIDER)
  }

  const handleOpenNotesPDIModal = (row: any) => {
    handleOpenAnnotationModal(row, TipoAnotacao.PDI_AVALIADO)
  }

  // Função genérica para salvar anotações
  const salvarAnotacao = async ({ anotacao, rowData }: { anotacao: string; rowData: Record<string, any> }) => {
    // Atualiza o estado local
    setRespostas(respostas.map((item) => (item === rowData ? { ...item, anotacao } : item)))
    setIsModalOpen(false)

    console.log("Dados salvos:", { anotacao, rowData, tipo: currentAnnotationType })

    try {
      const response = await createAnotacao({
        envio_id: rowData.envio_id,
        anotacao: anotacao,
        tipo: currentAnnotationType,
        respondente_id: rowData.respondente_id,
      })

      if (response) {
        const tipoTexto = {
          [TipoAnotacao.AVALIADO]: "do Avaliado",
          [TipoAnotacao.AVALIADOR_LIDER]: "do Avaliador/Líder",
          [TipoAnotacao.PDI_AVALIADO]: "do PDI",
        }
        toast.success(`Anotações ${tipoTexto[currentAnnotationType]} salvas com sucesso!`)
      } else {
        toast.error("Erro ao salvar anotações.")
      }
    } catch (error) {
      console.error("Erro ao salvar anotações:", error)
      toast.error("Erro ao salvar anotações.")
    }
  }

  const actionsBar = [
    {
      label: "Exportar",
      icon: Download,
      variant: "outline" as const,
      onClick: handleExport,
    },
  ]

  const actionsColumn = [
    {
      label: "Anotações do Avaliado",
      icon: MessageSquare,
      onClick: handleOpenNotesAvaliadoModal,
      variant: "ghost" as const,
      className: "text-blue-500 hover:text-blue-700",
    },
    {
      label: "Anotações do Avaliador/Líder",
      icon: MessageSquare,
      onClick: handleOpenNotesAvaliadorLiderModal,
      variant: "ghost" as const,
      className: "text-green-500 hover:text-green-700",
    },
    {
      label: "PDI do Avaliado",
      icon: MessageSquare,
      onClick: handleOpenNotesPDIModal,
      variant: "ghost" as const,
      className: "text-purple-500 hover:text-purple-700",
    },
  ]

  return (
    <div className="w-100 p-4 space-y-6">
      {/* Título principal */}
      <h1 className="text-2xl font-bold">DashBoard - Pesquisa: {pesquisa ? pesquisa.titulo : "Carregando..."}</h1>

      {/* Grid para cards e gráfico */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Card 1/4 - Total de Respondentes */}
        <Card className="col-span-1 border border-gray-200 bg-gray-50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Total de Respondentes</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
            </div>
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{totalRespondentes}</div>
            <Progress value={responseRate} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Taxa de resposta: <span className="font-medium">{responseRate}%</span>
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Respondidos</Badge>
                <span className="text-sm font-medium">{numRespondidos}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Ainda não responderam</Badge>
                <span className="text-sm font-medium">{numNaoResponderam}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3/4 - Gráfico de Top Scorers */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Top 10 Maiores Pontuações</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportChart(chartRef, "png", "pontuacoes")}>
                  Exportar como PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChart(chartRef, "svg", "pontuacoes")}>
                  Exportar como SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChart(chartRef, "pdf", "pontuacoes")}>
                  Exportar como PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="w-full overflow-x-auto">
              <div ref={chartRef} id="chart-container" className="relative h-[300px] min-w-[500px]">
                <ResponsiveBar
                  data={topScorers}
                  indexBy="first_name"
                  keys={["score"]}
                  colors={(bar) => bar.data.color || "#ccc"}
                  margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: "linear" }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  enableGridX={false}
                  enableGridY
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  label={(d) => `${d.value}`}
                  theme={{
                    tooltip: {
                      container: {
                        fontSize: "12px",
                      },
                    },
                    grid: {
                      line: {
                        stroke: "hsl(var(--border))",
                        strokeWidth: 1,
                      },
                    },
                  }}
                  role="application"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card para a Tabela */}
      <h1 className="text-2xl font-bold">Respostas</h1>
      <BasicDataTable
        columns={colunas}
        data={respostas}
        loading={loading}
        actionsBar={actionsBar}
        actionsColumn={actionsColumn}
      />

      <EditModal
        title={modalTitle}
        rowData={selectedRow}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={salvarAnotacao}
      />
    </div>
  )
}
