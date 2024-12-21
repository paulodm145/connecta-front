"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { toast } from "react-toastify";


import { useFormulariosHook } from "@/app/hooks/useFormulariosHook"

interface Formulario {
  id: number
  titulo: string
  descricao: string
  status: string
  slug: string
  data_criacao: string
  data_atualizacao: string
}

export default function PaginaListagem() {
  const { listagemFormularios, changeStatus } = useFormulariosHook()

  // Exemplo de estado local para os formulários.
  // Caso você carregue da API, pode chamar setForms no useEffect.
  const [forms, setForms] = useState<Formulario[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filtro por busca
  const filteredForms = forms.filter((form) =>
    form.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginação
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentForms = filteredForms.slice(startIndex, endIndex)

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reseta para a página 1 quando pesquisa
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

   // Função para carregar a lista de setores
   const carregarFormularios = async () => {
    try {
        const response = await listagemFormularios();
        if (response) {
            setForms(response); // Atualizar o estado do componente
        }
    } catch (error) {
        console.error('Erro ao carregar os setores:', error);
    }
  };

  useEffect(() => {
    carregarFormularios();
  }, []);

  async function handleToggleStatus(formId: number) {
    try {
      // Chama a sua função que altera o status no backend
      await changeStatus(formId)
      toast.success("Status atualizado com sucesso!")
      
      // Atualiza o status localmente
      setForms((prev) =>
        prev.map((f) => (f.id === formId ? { ...f, status: "PUBLICADO" } : f))
      )

    } catch (error) {
      console.error("Erro ao atualizar status do formulário:", error)  
      toast.error("Erro ao atualizar status do formulário.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulários</CardTitle>
        <CardDescription>Gerenciamento de Formulários</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Container flex para alinhar o botão e o input na mesma linha */}
        <div className="flex items-center justify-between">
            {/* Botão de Criar */}
            <Link
            href={"builder"}
            className={buttonVariants({ variant: "outline" })}
            >
            Novo Formulário
            </Link>

            {/* Input de Busca */}
            <div className="w-1/4">
            <Input
                placeholder="Buscar formulário pelo título..."
                value={searchTerm}
                onChange={handleSearch}
            />
            </div>
        </div>

        {/* Tabela */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Publicado/Rascunho</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead>Editar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentForms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>{form.id}</TableCell>
                <TableCell>{form.titulo}</TableCell>
                <TableCell>{form.descricao}</TableCell>
                <TableCell>
                  <Switch
                    checked={form.status === "PUBLICADO"} // Exemplo: se for "RASCUNHO" é desligado, senão ligado
                    onCheckedChange={() => handleToggleStatus(form.id)}
                  />
                </TableCell>
                <TableCell>{form.data_criacao}</TableCell>
                <TableCell>{form.data_atualizacao}</TableCell>
                <TableCell>
                  {/* Botão que direciona para edição */}
                  <Link href={`editar/${form.slug}`}>
                    <Button variant="secondary" size="sm">
                      Editar
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}

            {/* Caso não haja resultados */}
            {currentForms.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum formulário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
            >
              Anterior
            </Button>

            <span>
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
