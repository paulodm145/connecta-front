"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-toastify"
import { usePesquisasHook } from "@/app/hooks/usePesquisasHook"
import { useFormulariosHook } from "@/app/hooks/useFormulariosHook"
import { useTiposPesquisaHook } from "@/app/hooks/useTiposPesquisaHook"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import InputMask from "react-input-mask"

enum Status {
  ABERTA = "ABERTA",
  FECHADA = "FECHADA",
}

interface Pesquisa {
  id: number
  titulo: string
  status: string
  slug: string
  data_inicio: string
  data_fim: string
  data_criacao: string
  data_atualizacao: string
  observacao: string
  autenticacao: string
  tipo_pesquisa_id: number
  tipo_pesquisa: string
  formulario_id: number
  formulario: string
}

interface Formulario {
  id: number
  titulo: string
  descricao: string
  status: string
  slug: string
}

interface TipoPesquisa {
  id: number
  descricao: string
  status: boolean
}

export default function PaginaListagem() {
  const { listagemPesquisa, changeStatus } = usePesquisasHook()
  const { formulariosAtivos } = useFormulariosHook()
  const { pesquisasAtivas } = useTiposPesquisaHook()

  const [pesquisa, setPesquisas] = useState<Pesquisa[]>([])
  const [formularios, setFormularios] = useState<Formulario[]>([])
  const [tiposPesquisa, setTiposPesquisa] = useState<TipoPesquisa[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      formulario_id: "",
      status: "ABERTA",
      titulo: "",
      observacao: "",
      data_inicio: undefined,
      data_fim: undefined,
      autenticacao: false,
      tipo_pesquisa_id: "",
    },
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredPesquisas = pesquisa.filter((pesquisa) =>
    pesquisa.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPesquisas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPesquisa = filteredPesquisas.slice(startIndex, endIndex)

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Carrega a lista de pesquisas
  const carregarPesquisas = async () => {
    try {
      const response = await listagemPesquisa()
      if (response) {
        setPesquisas(response)
      }
    } catch (error) {
      console.error("Erro ao carregar os Pesquisas:", error)
    }
  }

  // Carrega o combo de formulários
  const carregarFormularios = async () => {
    try {
      const response = await formulariosAtivos()
      if (response) {
        setFormularios(response)
      }
    } catch (error) {
      console.error("Erro ao carregar os Formulários:", error)
    }
  }

  // Carrega o combo de tipos de pesquisa
  const carregarTiposPesquisa = async () => {
    try {
      const response = await pesquisasAtivas()
      if (response) {
        setTiposPesquisa(response)
      }
    } catch (error) {
      console.error("Erro ao carregar os Tipos de Pesquisa:", error)
    }
  }

  useEffect(() => {
    carregarPesquisas()
    carregarFormularios()
    carregarTiposPesquisa()
  }, [])

  async function handleToggleStatus(pesquisaId: number) {
    try {
      const pesquisaAtual = pesquisa.find((p) => p.id === pesquisaId)
      if (!pesquisaAtual) return

      const novoStatus = pesquisaAtual.status === "ABERTA" ? "FECHADA" : "ABERTA"

      await changeStatus(pesquisaId)
      toast.success("Status atualizado com sucesso!")

      setPesquisas((prev) =>
        prev.map((p) => (p.id === pesquisaId ? { ...p, status: novoStatus } : p))
      )
    } catch (error) {
      console.error("Erro ao atualizar status da Pesquisa:", error)
      toast.error("Erro ao atualizar status da Pesquisa.")
    }
  }

  const onSubmit = async (data) => {
    try {
      // Formata as datas para o formato dd/MM/yyyy antes de enviar
      const formattedData = {
        ...data,
        data_inicio: data.data_inicio ? format(data.data_inicio, "dd/MM/yyyy") : null,
        data_fim: data.data_fim ? format(data.data_fim, "dd/MM/yyyy") : null,
      }
      await salvarPesquisa(formattedData)
      toast.success("Pesquisa salva com sucesso!")
      carregarPesquisas()
      setModalOpen(false)
      reset()
    } catch (error) {
      toast.error("Erro ao salvar a pesquisa.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesquisas</CardTitle>
        <CardDescription>Gerenciamento de Pesquisas</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Nova Pesquisa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Pesquisa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input placeholder="Título" {...register("titulo", { required: true })} />
                {errors.titulo && <span className="text-red-500">Título é obrigatório</span>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Data de Início</label>
                <InputMask
                  mask="99/99/9999"
                  placeholder="DD/MM/YYYY"
                  className="w-full p-2 border rounded"
                  {...register("data_inicio", { required: true })}
                />
                {errors.data_inicio && <span className="text-red-500">Data início é obrigatória</span>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Data de Fim</label>
                <InputMask
                  mask="99/99/9999"
                  placeholder="DD/MM/YYYY"
                  className="w-full p-2 border rounded"
                  {...register("data_fim", { required: true })}
                />
                {errors.data_fim && <span className="text-red-500">Data fim é obrigatória</span>}
              </div>

              <div className="space-y-2">
                <select {...register("formulario_id", { required: true })} className="w-full p-2 border rounded">
                  <option value="">Selecione um formulário</option>
                  {formularios.map((form) => (
                    <option key={form.id} value={form.id}>{form.titulo}</option>
                  ))}
                </select>
                {errors.formulario_id && <span className="text-red-500">Formulário é obrigatório</span>}
              </div>

              <div className="space-y-2">
                <select {...register("tipo_pesquisa_id", { required: true })} className="w-full p-2 border rounded">
                  <option value="">Selecione um tipo de pesquisa</option>
                  {tiposPesquisa.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.descricao}</option>
                  ))}
                </select>
                {errors.tipo_pesquisa_id && <span className="text-red-500">Tipo de pesquisa é obrigatório</span>}
              </div>

              <div className="space-y-2">
                <select {...register("status", { required: true })} className="w-full p-2 border rounded">
                  <option value="ABERTA">ABERTA</option>
                  <option value="FECHADA">FECHADA</option>
                </select>
                {errors.status && <span className="text-red-500">Status é obrigatório</span>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Switch {...register("autenticacao")} />
                  <span>Autenticação</span>
                </label>
              </div>

              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
          <div className="w-1/4">
            <Input
              placeholder="Buscar pesquisa pelo título..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Formulário</TableHead>
              <TableHead>Tipo Pesquisa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPesquisa.map((pesquisa) => (
              <TableRow key={pesquisa.id}>
                <TableCell>{pesquisa.id}</TableCell>
                <TableCell>{pesquisa.titulo}</TableCell>
                <TableCell>{pesquisa.formulario}</TableCell>
                <TableCell>{pesquisa.tipo_pesquisa}</TableCell>
                <TableCell>
                  <Switch
                    checked={pesquisa.status === "ABERTA"}
                    onCheckedChange={() => handleToggleStatus(pesquisa.id)}
                  />
                </TableCell>
                <TableCell>
                  {/* Botão de Ações com Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`visualizar/${pesquisa.slug}`} className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Respostas
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`editar/${pesquisa.slug}`} className="flex items-center">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem
                        className="text-red-500 cursor-pointer"
                        onClick={() => console.log("Excluir pesquisa", pesquisa.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {currentPesquisa.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhuma pesquisa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)}>
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}