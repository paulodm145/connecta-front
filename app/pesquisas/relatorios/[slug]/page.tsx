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

// Exemplo de dados com cor vinda do "backend" (placeholder).
// Certifique-se de que o backend retorne color em cada objeto.
const topScorers = [
  { name: "João", score: 50, color: "#ff0000" },
  { name: "Pedrinho", score: 30, color: "#007bff" },
  { name: "Maria", score: 25, color: "#00b894" },
  { name: "Ana", score: 45, color: "#fdcb6e" },
  { name: "Carlos", score: 38, color: "#6c5ce7" },
  { name: "Beatriz", score: 42, color: "#d63031" },
  { name: "Lucas", score: 35, color: "#e84393" },
  { name: "Fernanda", score: 28, color: "#0984e3" },
  { name: "Rafael", score: 33, color: "#636e72" },
  { name: "Juliana", score: 40, color: "#fd79a8" },
];

export default function Page() {
  const params = useParams();
  const slugPesquisa = params.slug as string;

  const { relatorioRespostas } = usePesquisasHook();

  const [respostas, setRespostas] = useState<any[]>([]);
  const [colunas, setColunas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Exemplo de dados
  const totalRespondents = 256;
  const responseRate = 78; // percentual

  const chartRef = useRef(null);

  const numRespondidos = 75;
  const numNaoResponderam = 25;

  useEffect(() => {
    const fetchRelatorio = async () => {
      try {
        const retornoRespostas = await relatorioRespostas(slugPesquisa);
        setRespostas(retornoRespostas.data);
        setColunas(retornoRespostas.columns);
      } catch (error) {
        console.error("Erro ao buscar relatório de respostas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, [slugPesquisa, relatorioRespostas]);

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
            <div className="text-3xl font-bold mb-4">{totalRespondents}</div>

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
        indexBy="name"
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
