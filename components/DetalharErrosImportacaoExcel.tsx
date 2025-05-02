"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Tipo para os dados de erro
export type ErroDetalhado = {
  linha: number
  erro: string
  dados: Record<string, string>
}

export type ResultadoImportacao = {
  sucesso: number
  erros: number
  erros_detalhados: ErroDetalhado[]
}

export type DetalharErrosModalProps = {
  resultado: ResultadoImportacao
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Número de itens por página
const ITENS_POR_PAGINA = 10

export default function DetalharErrosImportacaoExcel({ resultado, open, onOpenChange }: DetalharErrosModalProps) {
  const [filtro, setFiltro] = useState("")
  const [erroSelecionado, setErroSelecionado] = useState<ErroDetalhado | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)

  const totalRegistros = resultado.sucesso + resultado.erros
  const percentualSucesso = Math.round((resultado.sucesso / totalRegistros) * 100) || 0
  const percentualErro = Math.round((resultado.erros / totalRegistros) * 100) || 0

  // Filtra os erros com base no texto de pesquisa
  const errosFiltrados = resultado.erros_detalhados.filter((erro) => {
    if (!filtro) return true

    const termoLowerCase = filtro.toLowerCase()

    // Verifica se o termo está na mensagem de erro ou na linha
    if (erro.erro.toLowerCase().includes(termoLowerCase)) return true
    if (erro.linha.toString().includes(termoLowerCase)) return true

    // Verifica se o termo está em algum dos dados
    return Object.values(erro.dados).some((valor) => valor.toLowerCase().includes(termoLowerCase))
  })

  // Calcula o total de páginas
  const totalPaginas = Math.ceil(errosFiltrados.length / ITENS_POR_PAGINA)

  // Obtém os erros da página atual
  const errosPaginados = errosFiltrados.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA)

  // Reseta a página atual quando o filtro muda
  useEffect(() => {
    setPaginaAtual(1)
  }, [filtro])

  // Navega para a página anterior
  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1)
    }
  }

  // Navega para a próxima página
  const irParaProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Relatório Detalhado de Erros</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="flex items-center gap-2">
                Registros importados com sucesso
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  {resultado.sucesso} ({percentualSucesso}%)
                </Badge>
              </AlertTitle>
            </Alert>

            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="flex items-center gap-2">
                Registros com erro
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  {resultado.erros} ({percentualErro}%)
                </Badge>
              </AlertTitle>
            </Alert>
          </div>

          {resultado.erros > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-lg font-medium">Detalhamento dos Erros</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar erros..."
                    className="pl-8 border-muted-foreground/20"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto max-h-[50vh]">
                  <Table className="whitespace-nowrap">
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-16 py-2 text-xs">Linha</TableHead>
                        <TableHead className="w-1/3 py-2 text-xs">Erro</TableHead>
                        <TableHead className="py-2 text-xs">Dados</TableHead>
                        <TableHead className="w-20 py-2 text-xs">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errosPaginados.length > 0 ? (
                        errosPaginados.map((erro, index) => (
                          <TableRow key={index}>
                            <TableCell className="py-2">
                              <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 text-xs">
                                {erro.linha}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium py-2 text-sm">{erro.erro}</TableCell>
                            <TableCell className="truncate max-w-xs py-2">
                              {Object.entries(erro.dados)
                                .slice(0, 2)
                                .map(([campo, valor]) => (
                                  <span key={campo} className="block text-sm text-muted-foreground">
                                    <span className="font-medium">{formatarNomeCampo(campo)}:</span> {valor}
                                  </span>
                                ))}
                              {Object.keys(erro.dados).length > 2 && (
                                <span className="text-sm text-muted-foreground">...</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setErroSelecionado(erro)}
                                className="h-7 px-2 text-xs"
                              >
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum erro encontrado com o termo pesquisado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {errosFiltrados.length > ITENS_POR_PAGINA && (
                  <div className="border-t p-2 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(paginaAtual - 1) * ITENS_POR_PAGINA + 1} a{" "}
                      {Math.min(paginaAtual * ITENS_POR_PAGINA, errosFiltrados.length)} de {errosFiltrados.length} erros
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={irParaPaginaAnterior}
                        disabled={paginaAtual === 1}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Página anterior</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Página {paginaAtual} de {totalPaginas}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={irParaProximaPagina}
                        disabled={paginaAtual === totalPaginas}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Próxima página</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {erroSelecionado && (
            <div className="mt-4 border rounded-md p-3">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Detalhes do erro na linha {erroSelecionado.linha}</h4>
                <Button variant="ghost" size="sm" onClick={() => setErroSelecionado(null)}>
                  Fechar detalhes
                </Button>
              </div>
              <div className="bg-muted/30 p-2 rounded mb-3">
                <p className="text-sm font-medium">{erroSelecionado.erro}</p>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-1/3 py-2 text-xs">Campo</TableHead>
                      <TableHead className="py-2 text-xs">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(erroSelecionado.dados).map(([campo, valor], i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium py-1.5 text-sm">{formatarNomeCampo(campo)}</TableCell>
                        <TableCell className="py-1.5 text-sm break-all">{valor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Função auxiliar para formatar nomes de campos
function formatarNomeCampo(campo: string): string {
  return campo
    .split("_")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ")
}
