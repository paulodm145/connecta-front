"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { usePesquisasHook } from "@/app/hooks/usePesquisasHook";
import { useFormulariosHook } from "@/app/hooks/useFormulariosHook";
import { useTiposPesquisaHook } from "@/app/hooks/useTiposPesquisaHook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { parse, format } from "date-fns";
import { MaskedInput } from "@/components/InputDate";
import { SquarePlus, Pencil, UserPlus, FileText, Edit2Icon    } from "lucide-react";

type Status = "ABERTA" | "FECHADA";

interface Pesquisa {
  id: number;
  titulo: string;
  status: Status;
  slug: string;
  data_inicio: string;
  data_fim: string | null;
  observacao: string;
  autenticacao: boolean | string;
  tipo_pesquisa_id: number;
  tipo_pesquisa?: string;
  formulario_id: number;
  formulario?: string;
  data_inicio_formatada: string;
  data_fim_formatada: string | null;
}

interface Formulario {
  id: number;
  titulo: string;
}

interface TipoPesquisa {
  id: number;
  descricao: string;
  status: boolean;
}

export default function PaginaListagem() {
  const { listagemPesquisa, changeStatus, novaPesquisa, editarPesquisa } = usePesquisasHook();
  const { formulariosAtivos } = useFormulariosHook();
  const { pesquisasAtivas } = useTiposPesquisaHook();

  const [pesquisas, setPesquisas] = useState<Pesquisa[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [tiposPesquisa, setTiposPesquisa] = useState<TipoPesquisa[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPesquisa, setEditingPesquisa] = useState<Pesquisa | null>(null);

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
      status: "ABERTA" as Status,
      titulo: "",
      observacao: "",
      data_inicio: "",
      data_fim: "",
      autenticacao: false,
      tipo_pesquisa_id: "",
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPesquisas = pesquisas.filter((pesquisa) =>
    pesquisa.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPesquisas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPesquisa = filteredPesquisas.slice(startIndex, endIndex);

  // Carregando as listas iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [respPesquisas, respFormularios, respTipos] = await Promise.all([
          listagemPesquisa(),
          formulariosAtivos(),
          pesquisasAtivas(),
        ]);
        setPesquisas(respPesquisas || []);
        setFormularios(respFormularios || []);
        setTiposPesquisa(respTipos || []);
      } catch (error) {
        toast.error("Erro ao carregar dados");
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  // Quando setamos uma pesquisa em edição, carregamos os valores nos inputs
  useEffect(() => {
    if (editingPesquisa) {
      setValue("titulo", editingPesquisa.titulo);
      setValue("status", editingPesquisa.status);
      setValue("observacao", editingPesquisa.observacao);
      setValue("data_inicio", editingPesquisa.data_inicio_formatada);
      setValue("data_fim", editingPesquisa.data_fim_formatada || "");

      // Converter string->boolean se a API tiver retornado como string
      const authValue =
        typeof editingPesquisa.autenticacao === "string"
          ? editingPesquisa.autenticacao === "true"
          : editingPesquisa.autenticacao;
      setValue("autenticacao", authValue);

      setValue("formulario_id", String(editingPesquisa.formulario_id));
      setValue("tipo_pesquisa_id", String(editingPesquisa.tipo_pesquisa_id));
    }
  }, [editingPesquisa, setValue]);

  // Alternar status (ABERTA <-> FECHADA)
  const handleToggleStatus = async (pesquisaId: number) => {
    try {
      const pesquisaAtual = pesquisas.find((p) => p.id === pesquisaId);
      if (!pesquisaAtual) return;

      const novoStatus = pesquisaAtual.status === "ABERTA" ? "FECHADA" : "ABERTA";
      await changeStatus(pesquisaId);

      setPesquisas((prev) =>
        prev.map((p) => (p.id === pesquisaId ? { ...p, status: novoStatus } : p))
      );

      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  // Criar ou editar a pesquisa
  const onSubmit = async (data: any) => {
    try {
      console.log(data);
      const payload = {
        ...data,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim ? data.data_fim : null,
        autenticacao: data.autenticacao ? true : false,
      };

      if (editingPesquisa) {
        await editarPesquisa(editingPesquisa.id, payload);
        toast.success("Pesquisa atualizada!");
      } else {
        await novaPesquisa(payload);
        toast.success("Pesquisa criada!");
      }

      setModalOpen(false);
      reset();
      setEditingPesquisa(null);
      // Recarregar listagem
      const novasPesquisas = await listagemPesquisa();
      setPesquisas(novasPesquisas || []);
    } catch (error) {
      toast.error("Erro ao salvar pesquisa");
      console.error(error);
    }
  };

  function handleNovaPesquisa() {
    setEditingPesquisa(null)   // <- Garante que não estamos editando nada
    reset({                    // <- Volta para valores padrão (se quiser customizar, coloque aqui)
      formulario_id: "",
      status: "ABERTA",
      titulo: "",
      observacao: "",
      data_inicio: "",
      data_fim: "",
      autenticacao: false,
      tipo_pesquisa_id: "",
    })
    setModalOpen(true)         // <- Abre o modal
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
              <Button variant="outline" onClick={handleNovaPesquisa}>
                <SquarePlus size={16} className="mr-2" />
                Nova Pesquisa
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPesquisa ? "Editar Pesquisa" : "Nova Pesquisa"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  placeholder="Título"
                  {...register("titulo", { required: true })}
                />
                {errors.titulo && <span className="text-red-500">Campo obrigatório</span>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Data Início</label>
                    <MaskedInput
                      mask="99/99/9999"
                      placeholder="DD/MM/AAAA"
                      className="w-full p-2 border rounded"
                      value={watch("data_inicio")}
                      onChange={(e) => setValue("data_inicio", e.target.value)}
                    />
                    {errors.data_inicio && (
                      <span className="text-red-500">Campo obrigatório</span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1">Data Fim</label>
                    <MaskedInput
                      mask="99/99/9999"
                      placeholder="DD/MM/AAAA"
                      className="w-full p-2 border rounded"
                      value={watch("data_fim")}
                      onChange={(e) => setValue("data_fim", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Formulário</label>
                    <select
                      {...register("formulario_id", { required: true })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Selecione</option>
                      {formularios.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.titulo}
                        </option>
                      ))}
                    </select>
                    {errors.formulario_id && (
                      <span className="text-red-500">Campo obrigatório</span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1">Tipo de Pesquisa</label>
                    <select
                      {...register("tipo_pesquisa_id", { required: true })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Selecione</option>
                      {tiposPesquisa.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.descricao}
                        </option>
                      ))}
                    </select>
                    {errors.tipo_pesquisa_id && (
                      <span className="text-red-500">Campo obrigatório</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Status</label>
                    <select
                      {...register("status")}
                      className="w-full p-2 border rounded"
                    >
                      <option value="ABERTA">Aberta</option>
                      <option value="FECHADA">Fechada</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 mt-5">
                    <Switch
                      checked={watch("autenticacao")}
                      onCheckedChange={(value) => setValue("autenticacao", value)}
                    />
                    <label className="cursor-pointer select-none">Requer Autenticação</label>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingPesquisa ? "Atualizar" : "Salvar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Input
            placeholder="Buscar..."
            className="w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Formulário</TableHead>
              <TableHead>Tipo</TableHead>
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
                {/* Ações: Apenas edição via modal */}
                <TableCell>
                  <Button
                    title="Editar"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPesquisa(pesquisa);
                      setModalOpen(true);
                    }}
                    
                  >
                    <Pencil size={16}/>
                  </Button>

                   <Link className="ml-2" href={`/pesquisas/respondentes/${pesquisa.slug}`}>
                      <Button title="Adicionar Respondentes" variant="outline" size="sm">
                         <UserPlus size={16} /> 
                      </Button>
                    </Link>    

                    <Link className="ml-2" href={`/pesquisas/relatorios/${pesquisa.slug}`}>
                      <Button title="Relatório" variant="outline" size="sm">
                         <FileText size={16} />
                      </Button>
                    </Link>    



                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Exemplo de paginação, se necessário */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={i + 1 === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
