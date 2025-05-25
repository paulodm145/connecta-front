"use client";

import BasicDataTable from "@/components/BasicDataTable";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePesquisasHook } from "@/app/hooks/usePesquisasHook";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@/components/chart";
import { Progress } from "@/components/ui/progress";
import { UserIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { exportChart } from "@/lib/export-utils";
import { Badge } from "@/components/ui/badge"; // Caso queira badges



interface ScoreItem {
  name: string;
  first_name: string;
  score: number;
  color: string;
  [key: string]: string | number; // Add index signature for BarDatum compatibility
}

interface RespostaDados {
  total_respondentes: number;
  responderam: number;
  nao_responderam: number;
  taxa_resposta: number;
  score: ScoreItem[];
}

export default function Page() {
  const params = useParams();
  const slugPesquisa = params.slug as string;

  const { relatorioRespostas, dadosDashBoard } = usePesquisasHook();

  const [respostas, setRespostas] = useState<any[]>([]);
  const [colunas, setColunas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [numRespondidos, setNumRespondidos] = useState(0);
  const [numNaoResponderam, setNumNaoResponderam] = useState(0);
  const [totalRespondentes, setTotalRespondentes] = useState(0);
  const [responseRate, setresponseRate] = useState(0);
  const [topScorers, setTopScorers] = useState<ScoreItem[]>([]);
  
  const chartRef = useRef(null);

  const fetchRelatorio = async () => {
      try {
        const retornoRespostas = await relatorioRespostas(slugPesquisa);
        const retornoDashboard: RespostaDados = await dadosDashBoard(5) ?? {
          total_respondentes: 0,
          responderam: 0,
          nao_responderam: 0,
          taxa_resposta: 0,
          score: [],
        };
        
        // Aqui você pode usar os dados retornados para atualizar o estado
        setRespostas(retornoRespostas.data);
        setColunas(retornoRespostas.columns);

        setNumRespondidos(retornoDashboard.responderam);
        setNumNaoResponderam(retornoDashboard.nao_responderam);
        setTotalRespondentes(retornoDashboard.total_respondentes);
        setresponseRate(retornoDashboard.taxa_resposta);
        
        const formattedScores = retornoDashboard.score.map((item: ScoreItem) => ({
          name: item.name,
          first_name: item.first_name,
          score: item.score,
          color: item.color || "#ccc", // Definindo uma cor padrão se não houver
        }));
        
        setTopScorers(formattedScores);

      } catch (error) {
        console.error("Erro ao buscar relatório de respostas:", error);
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchRelatorio();
  }, []);

  return (
    <div className=" w-100 p-4 space-y-6">
      {/* Título principal */}
      <h1 className="text-2xl font-bold">DashBoard - Nome da Pesquisa</h1>

      {/* Grid para cards e gráfico */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Card 1/4 - Total de Respondentes */}
        <Card
          className="col-span-1 border border-gray-200 bg-gray-50 shadow-sm"
          /* Você pode ajustar cores e bordas aqui */
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium">
                Total de Respondentes
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </div>
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Número grande no topo */}
            <div className="text-3xl font-bold mb-4">{totalRespondentes}</div>

            {/* Barra de progresso e taxa de resposta */}
            <Progress value={responseRate} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Taxa de resposta: <span className="font-medium">{responseRate}%</span>
            </p>

            {/* Indicadores adicionais: Respondidos / Não responderam */}
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
            <CardTitle className="text-sm font-medium">
              Top 10 Maiores Pontuações
            </CardTitle>
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
  {/* Para evitar que o layout quebre em telas pequenas caso o rótulo esteja muito grande, 
      você pode envolver em um container que permita scroll horizontal  */}
  <div className="w-full overflow-x-auto">
    {/* Contêiner que define claramente altura para o gráfico */}
    <div
      ref={chartRef}
      id="chart-container"
      className="relative h-[300px] min-w-[500px]" 
      // min-w opcional: evita que, em telas estreitas, as barras "apertem" e atrapalhem o layout
    >
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

      {/* Card para a Tabela - melhora o visual do layout */}
      <h1 className="text-2xl font-bold">Respostas</h1>
      <BasicDataTable
            columns={colunas}
            data={respostas}
            // Caso queira usar a prop loading que criamos antes,
            // basta descomentar e passar como prop.
            // loading={loading}
          />
    </div>
  );
}
