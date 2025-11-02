"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { usePesquisasHook } from "@/app/hooks/usePesquisasHook";
import { useRespondentesHook } from "@/app/hooks/useRespondentesHook";
import { usePessoasHook } from "@/app/hooks/usePessoasHook";
import { useSetoresHook } from "@/app/hooks/useSetoresHook";
import { useClipboard } from '@/app/hooks/useClipBoard'; // ajuste o caminho se necessário
import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';


import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import MultiSelectDropdown from "@/components/MultiSelectDropdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { set } from "date-fns";
import { PlusCircle } from "lucide-react";

//importar o store
import { useUserStore } from '@/app/store/userStore'
import { parse } from "path";

interface Respondente {
  setor_id: number;
  id: number;
  pessoa_id: number;
  pesquisa_id: number;
  status: boolean;
  token: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  pesquisa_slug: string;
  pessoa_nome: string;
  pessoa_email: string;
  pessoa_cpf: string;
  setor_descricao?: string;
  cargo_descricao?: string;
}

export default function PesquisasRespondentes() {
  const params = useParams();
  const slug = params.slug as string;
  const BASE_URL = process.env.NEXT_PUBLIC_URL_INICIAL;

  const { getBySlug } = usePesquisasHook();
  const { getRespondentesByPesquisaSlug, store, update, destroy, listarRespondentesCombo, enviarRespondentesMultiplos } = useRespondentesHook();
  const { getPessoasAtivas } = usePessoasHook();
  const { copyToClipboard } = useClipboard();
  const { setoresAtivos } = useSetoresHook();
  const { isSuperAdmin, permissoes, temPermissao } = useInformacoesUsuarioHook();

  const permissoesUsuario = {
    podeCadastrar: temPermissao('pesquisas.pesquisas.adicionar.respondentes.tela') || false,
    podeCadastrarEmLote: temPermissao('pesquisas.pesquisas.adicionar.respondentes.lote') || false,
    podeEditar: temPermissao('pesquisas.pesquisas.adicionar.respondentes.lote') || false,
    podeExcluir: temPermissao('pesquisas.pesquisas.excluir.respondentes') || false,
    podeAlterarStatus: temPermissao('pesquisas.pesquisas.bloquear.respondentes') || false,
    podeCopiarLink: temPermissao('pesquisas.pesquisas.copiar.link.pesquisa') || false,
  }

  const [pesquisa, setPesquisa] = useState<{ id: number; titulo: string; formulario_slug: string } | null>(
    null
  );
  const [respondentes, setRespondentes] = useState<Respondente[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRespondente, setEditingRespondente] = useState<Respondente | null>(
    null
  );
  const [respondentesCombo, setRespondentesCombo] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);

  const itemsPerPage = 10;

  const { register, handleSubmit, reset, setValue } = useForm<Respondente>();

  //dados usuario
  const user = useUserStore((state) => state.user)


  //Carregando listas iniciais
  useEffect(() => {
    const loadData = async () => {
    const [respPessoas, respPesquisa, respRespondentes, respCombo, respStores] = await Promise.all([
      getPessoasAtivas(),
      getBySlug(slug),
      getRespondentesByPesquisaSlug(slug),
      listarRespondentesCombo(),
      setoresAtivos(),
    ]);

    setPesquisa(respPesquisa || []);
    setRespondentes(respRespondentes || []);
    setPessoas(respPessoas || []);
    setRespondentesCombo(respCombo || []);
    setSetores(respStores || []);
    };

    loadData();
  }, []);

  /**
   * Filtragem e Paginação
   */
  const filteredRespondentes = respondentes.filter((respondente) =>
    respondente.pessoa_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRespondentes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRespondentes = filteredRespondentes.slice(startIndex, endIndex);

  /**
   * Alternar status (ativo/inativo) de um respondente
   */
  const handleToggleStatus = async (id: number) => {
    const respondente = respondentes.find((r) => r.id === id);
    if (respondente) {
      const updatedAtivo = !respondente.status;
      try {
        await update(id, { ...respondente, status: updatedAtivo });
        setRespondentes(
          respondentes.map((r) =>
            r.id === id ? { ...r, status: updatedAtivo } : r
          )
        );
        toast.success("Status atualizado com sucesso");
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        toast.error("Erro ao atualizar status");
      }
    }
  };


  /**
   * Submeter formulário (adicionar ou editar)
   */
  const onSubmit = async (data: Respondente) => {
    try {
      if (editingRespondente) {
        // Editar respondente
        await update(editingRespondente.id, data);
        setRespondentes(
          respondentes.map((r) =>
            r.id === editingRespondente.id ? { ...r, ...data } : r
          )
        );
        toast.success("Respondente atualizado com sucesso");
      } else {
        // Criar novo respondente
        const newRespondente = await store({
          ...data,
          pesquisa_id: pesquisa!.id,
        });
        setRespondentes([...respondentes, newRespondente]);
        toast.success("Respondente criado com sucesso");
      }
      setIsModalOpen(false);
      reset();

      // Recarregar dados para refletir alterações
      const updatedRespondentes = await getRespondentesByPesquisaSlug(slug);
      setRespondentes(updatedRespondentes || []);
    } catch (error) {
      console.error("Erro ao salvar respondente:", error);
      toast.error("Erro ao salvar respondente");
    }
  };

  /**
   * Excluir respondente
   */
  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este respondente?")) {
      try {
        await destroy(id);
        setRespondentes(respondentes.filter((r) => r.id !== id));
        toast.success("Respondente excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir respondente:", error);
        toast.error("Erro ao excluir respondente");
      }
    }
  };

  const handleSelectionChange = (selectedIds: number[]) => {
    console.log("Itens selecionados:", selectedIds)
  }

  const addRespondentesMultiplos = async (selectedIds: number[]) => {
    try {

      if (!selectedIds || selectedIds.length === 0) {
        toast.error("Selecione ao menos um respondente");
        return;
      }

      const sendData = {
        idsRespondentes : selectedIds, 
        pesquisaId : pesquisa?.id
      }

      await enviarRespondentesMultiplos(sendData);

      // Recarregar dados para refletir alterações
      const updatedRespondentes = await getRespondentesByPesquisaSlug(slug);
      setRespondentes(updatedRespondentes || []);

      toast.success("Respondentes enviados com sucesso");
    } catch (error) {
      console.error("Erro ao enviar respondentes:", error);
      toast.error("Erro ao enviar respondentes");
    }
  }

  const handleFilterChange = async (setorId: number | null) => {
    // Implementar lógica de filtragem por setor aqui
    if (setorId != null && setorId !== 0) {
      const filteredRespondentes = respondentes.filter(
        (r) => r.setor_id === setorId
      );

      const parseSetor = filteredRespondentes.map((item) => ({
        id: item.id,
        label: item.pessoa_nome,
      }));
      
      setRespondentesCombo(parseSetor);
    } else {
      // Se nenhum setor estiver selecionado, recarregar todos os respondentes
      const updatedRespondentes = await getPessoasAtivas();
      const listarPessoasCombos = updatedRespondentes.map((item: { id: any; nome: any; }) => ({
        id: item.id,
        label: item.nome,
      }));

      console.log('LISTAR PESSOAS:: ', listarPessoasCombos);
    
      setRespondentesCombo(listarPessoasCombos || []);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Respondentes - Pesquisa: {pesquisa ? pesquisa.titulo : "Carregando..."}
        </CardTitle>
        <CardDescription>
          Gerenciamento das pessoas que irão responder a pesquisa.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between mb-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

            <DialogTrigger asChild>

             {permissoesUsuario.podeCadastrar && ( <Button
                title="Adicionar Respondente"
                onClick={() => {
                  setEditingRespondente(null);
                  reset();
                }}
              >
                <PlusCircle size={16} />
              </Button>)}

            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRespondente ? "Editar" : "Adicionar"} Respondente
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="pessoa_id">Pessoa</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("pessoa_id", Number(value))
                    }
                    defaultValue={editingRespondente?.pessoa_id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoas.map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id.toString()}>
                          {pessoa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ativo">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("status", value === "true")
                    }
                    defaultValue={editingRespondente?.status?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          {permissoesUsuario.podeCadastrarEmLote && (<MultiSelectDropdown
            data={respondentesCombo}
            title="Selecionar Respondentes"
            onSelectionChange={handleSelectionChange}
            buttonText="Adicionar Respondentes"
            onSend={addRespondentesMultiplos}
          />)}

          <div>
            <Select onValueChange={(value) => handleFilterChange(Number(value) || null)} defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Filtrar Por Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todos os Setores</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id.toString()}>
                    {setor.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Pesquisar respondentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CPF</TableHead>
              {permissoesUsuario.podeAlterarStatus && (<TableHead>Status</TableHead>)}
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRespondentes.map((respondente) => (
              <TableRow key={respondente.id}>
                <TableCell>{respondente.pessoa_nome}</TableCell>
                <TableCell>{respondente.cargo_descricao}</TableCell>
                <TableCell>{respondente.setor_descricao}</TableCell>
                <TableCell>{respondente.pessoa_email}</TableCell>
                <TableCell>{respondente.pessoa_cpf}</TableCell>
                {permissoesUsuario.podeAlterarStatus && (<TableCell>
                  <Switch
                    checked={respondente.status}
                    onCheckedChange={() => handleToggleStatus(respondente.id)}
                  />
                </TableCell>)}
                
                <TableCell>

                  {permissoesUsuario.podeEditar && (<Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => {
                      setEditingRespondente(respondente);
                      setIsModalOpen(true);
                      Object.keys(respondente).forEach((key) => {
                        // @ts-ignore (fazemos ignore para simplificar a atribuição)
                        setValue(key, respondente[key]);
                      });
                    }}
                  >
                    Editar
                  </Button>)}
                  
                  {permissoesUsuario.podeExcluir && (<Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(respondente.id)}
                  >
                    Excluir
                  </Button>)}

                  {permissoesUsuario.podeCopiarLink && (<Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      const link = `${BASE_URL}/respostas/formulario/${pesquisa.formulario_slug}?t=${respondente.token}&p=${respondente.pesquisa_slug}
                        &e=${user?.informacoes_usuario?.identificador_empresa}&tpo=1`;
                      const success = copyToClipboard(link);
                      if (success) {
                        toast.success("Link copiado com sucesso");
                      } else {
                        toast.error("Não foi possível copiar o link");
                      }
                    }}
                  >
                    Copiar Link
                  </Button>)}

                 {permissoesUsuario.podeCopiarLink && (<Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      const link = `${BASE_URL}/respostas/formulario/${pesquisa.formulario_slug}?t=${respondente.token}&p=${respondente.pesquisa_slug}
                        &e=${user?.informacoes_usuario?.identificador_empresa}&tpo=2`;
                      const success = copyToClipboard(link);
                      if (success) {
                        toast.success("Link copiado com sucesso");
                      } else {
                        toast.error("Não foi possível copiar o link");
                      }
                    }}
                  >
                    Av. Líder
                  </Button>)}     


                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-center mt-4 space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
