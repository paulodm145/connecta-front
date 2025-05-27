"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Column {
  label: string
  datafield: string
}

interface ActionButton {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onClick: (filteredData: Record<string, any>[]) => void
  className?: string
}

interface TableProps {
  columns: Column[]
  data: Record<string, any>[]
  rowsPerPage?: number
  loading?: boolean
  actionsBar?: ActionButton[]
}

const BasicDataTable: React.FC<TableProps> = ({ columns, data, rowsPerPage = 5, loading = false, actionsBar = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filtrando os dados dinamicamente
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.some((col) => String(row[col.datafield]).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [searchTerm, data, columns])

  // Paginação
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Se estiver carregando, retorna somente a tela de Loading
  if (loading) {
    return (
      <div className="w-full mx-auto p-4 bg-white rounded-lg shadow-md flex flex-col items-center">
        <Loader2 className="animate-spin w-6 h-6 mb-2" />
        <span>Carregando...</span>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-lg shadow-md">
      {/* Barra superior com busca e botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Campo de busca com ícone de lupa */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Botões de ação */}
        {actionsBar.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {actionsBar.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  onClick={() => action.onClick(filteredData)}
                  className={action.className}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Caso não existam dados após filtrar, mostra mensagem de vazio */}
      {filteredData.length === 0 ? (
        <div className="text-center py-4">
          <p>Não há dados disponíveis</p>
        </div>
      ) : (
        <>
          {/* Tabela */}
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.datafield}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col) => (
                      <TableCell key={col.datafield}>{row[col.datafield]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 w-4 h-4" />
              Anterior
            </Button>

            <span>
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default BasicDataTable
