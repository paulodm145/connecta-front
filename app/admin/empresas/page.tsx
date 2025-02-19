"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Switch } from "@/components/ui/switch";

import { useEmpresaAdminHook } from "@/app/hooks/useEmpresasAdminHook";
import { useEstadosCidadesAdminHook } from "@/app/hooks/useEstadosCidadesAdminHook";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import InputMask from "react-input-mask";
import { isValidCNPJ, isValidEmail, cleanInput, maskCPFOrCNPJ, maskBRPhone } from '@/app/utils/Helpers';



// Tipos
interface Empresa {
  id?: number;
  nome: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  numero: string;
  bairro: string;
  cidade_id: number;
  estado_id: number;
  complemento: string;
  logo: string;
  status: boolean;
}

interface Estados {
  id: number;
  nome: string;
  sigla: string;
  nome_completo: string;
  total_cidades: number;
}

interface Cidades {
  id: number;
  nome: string;
  sigla: string;
}

export default function PaginaListagem() {
  // Hooks para as ações da empresa
  const {
    indexEmpresas,
    storeEmpresa,
    updateEmpresa,
    destroyEmpresa,
    showEmpresa,
    changeStatus,
  } = useEmpresaAdminHook();

  // Hooks para Estados e Cidades
  const { getCidades, getEstados } = useEstadosCidadesAdminHook();

  // Estado local para armazenar lista de empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Estados e cidades para popular selects
  const [estados, setEstados] = useState<Estados[]>([]);
  const [cidades, setCidades] = useState<Cidades[]>([]);

  // Controle de modal e de edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  // Campo de busca e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Referências e estados auxiliares para logo (exemplo de upload)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [cepError, setCepError] = useState<string>("");

  // useForm com os campos relevantes para EMPRESA
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Empresa>({
    defaultValues: {
      nome: "",
      razao_social: "",
      cnpj: "",
      email: "",
      telefone: "",
      cep: "",
      endereco: "",
      numero: "",
      bairro: "",
      estado_id: 0,
      cidade_id: 0,
      complemento: "",
      logo: "",
    },
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [respEmpresas, respEstados] = await Promise.all([
          indexEmpresas(),
          getEstados(),
        ]);

        // @ts-ignore
        respEmpresas?.forEach((empresa) => {
          empresa.cnpj = maskCPFOrCNPJ(empresa.cnpj);
          empresa.telefone = maskBRPhone(empresa.telefone);
        });
  
        setEmpresas(respEmpresas ?? []);
        setEstados(respEstados ?? []);
      } catch (error) {
        toast.error("Erro ao carregar dados");
        console.error(error);
      }
    };
    carregarDados();
  // Rodar só uma vez na montagem:
  }, []); // <-- sem [indexEmpresas, getEstados]
  
  const estadoId = watch("estado_id");

  useEffect(() => {
    if (estadoId) {
      const estadoSigla = estados.find((estado) => estado.id == estadoId)?.sigla;
      
      if (estadoSigla) {
        getCidades(estadoSigla).then((data) => {
          setCidades(data ?? []);
        });
      }
      
    } else {
      setCidades([]);
    }
  }, [estadoId]); // <-- muda somente quando "estadoId" de fato muda

  // Função para abrir o seletor de arquivos
  function handleLogoClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  // Função para preview da logo

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert("O arquivo deve ser uma imagem.");
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          alert("O arquivo deve ter no máximo 25MB.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const base64Image = reader.result as string;
          setLogoPreview(base64Image); // Define a pré-visualização
          setValue("logo", base64Image); // Define o valor no formulário
        };
        reader.readAsDataURL(file);
      }
    };


  // Ao enviar o formulário, cria ou atualiza
  async function onSubmit(data: Empresa) {
    try {
      // Validações extras

      // Validação de CNPJ
      if (!isValidCNPJ(data.cnpj)) {
        toast.error("CNPJ inválido");
        return;
      }

      // Validação de e-mail
      if (!isValidEmail(data.email)) {
        toast.error("E-mail inválido");
        return;
      }

      // Validação de CEP
      if (data.cep && data.cep.length !== 9) {
        setCepError("CEP inválido");
        return;
      } else {
        setCepError("");
      }

      // LIMPAR CARACTERES ESPECIAIS
      data.cnpj = cleanInput(data.cnpj);
      data.cep = cleanInput(data.cep);
      data.telefone = cleanInput(data.telefone);


      // Se estiver atualizando, passamos o ID
      if (editingEmpresa) {
        await updateEmpresa(editingEmpresa.id!, data);
        toast.success("Empresa atualizada com sucesso!");
      } else {
        await storeEmpresa(data);
        toast.success("Empresa criada com sucesso!");
      }

      // Fecha modal, limpa form e recarrega listagem
      setModalOpen(false);
      reset();
      setEditingEmpresa(null);

      // Recarrega as empresas do backend
      const novasEmpresas = await indexEmpresas();
      setEmpresas(novasEmpresas ?? []);
    } catch (error) {
      toast.error("Erro ao salvar dados da empresa");
      console.error(error);
    }
  }

  // Ao clicar para nova empresa
  function handleNovaEmpresa() {
    setEditingEmpresa(null);
    setLogoPreview("");
    // Força o reset para os campos vazios (ou valores padrões desejados)
    reset({
      nome: "",
      razao_social: "",
      cnpj: "",
      email: "",
      telefone: "",
      cep: "",
      endereco: "",
      numero: "",
      bairro: "",
      estado_id: 0,
      cidade_id: 0,
      complemento: "",
      logo: "",
    });
    setModalOpen(true);
  }

  // Ao clicar para editar
  function handleEditEmpresa(empresa: Empresa) {
    setEditingEmpresa(empresa);
    // Ajusta valores do form
    reset(empresa);
    // Se já existir uma logo salva, exiba no preview
    setLogoPreview(empresa.logo || "");
    setModalOpen(true);
  }

  // Excluir empresa
  async function handleDeleteEmpresa(empresaId: number | undefined) {
    if (!empresaId) return;
    if (confirm("Tem certeza que deseja excluir esta empresa?")) {
      try {
        await destroyEmpresa(empresaId);
        toast.success("Empresa excluída com sucesso!");

        // Recarrega as empresas do backend
        const novasEmpresas = await indexEmpresas();
        setEmpresas(novasEmpresas ?? []);
      } catch (error) {
        toast.error("Erro ao excluir empresa");
        console.error(error);
      }
    }
  }

  // Alternar status (ABERTA <-> FECHADA)
  const handleToggleStatus = async (empresaId: number) => {
    try {
      const empresaAtual = empresas.find((p) => p.id === empresaId);
      if (!empresaAtual) return;

      const novoStatus = empresaAtual.status ===  true ? false : true;
      await changeStatus(empresaId);

      setEmpresas((prev) =>
        prev.map((p) => (p.id === empresaId ? { ...p, status: novoStatus } : p))
      );

      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  // Lógica de filtro e paginação
  // Protegemos com `Array.isArray(empresas) ? ... : []` só por segurança extra
  const filteredEmpresas = Array.isArray(empresas)
    ? empresas.filter((empresa) =>
        empresa.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmpresas = filteredEmpresas.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas</CardTitle>
        <CardDescription>Gerenciamento de empresas no sistema</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          {/* Botão de nova empresa + Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleNovaEmpresa}>
                Nova Empresa
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingEmpresa ? "Editar Empresa" : "Nova Empresa"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 bg-white p-4 rounded-md"
              >
                {/* Linha: Nome e Razão Social */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <Input
                      type="text"
                      {...register("nome", { required: "Nome é obrigatório" })}
                      className={errors.nome ? "border-red-500" : ""}
                    />
                    {errors.nome && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.nome.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Razão Social
                    </label>
                    <Input
                      type="text"
                      {...register("razao_social", {
                        required: "Razão Social é obrigatória",
                      })}
                      className={errors.razao_social ? "border-red-500" : ""}
                    />
                    {errors.razao_social && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.razao_social.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Linha: CNPJ, Telefone, Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CNPJ</label>
                    <InputMask
                      mask="99.999.999/9999-99"
                      {...register("cnpj", {
                        required: "CNPJ é obrigatório",
                      })}
                      className={`w-full border p-2 rounded-md ${
                        errors.cnpj ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cnpj && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cnpj.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefone
                    </label>
                    <InputMask
                      mask="(99) 99999-9999"
                      {...register("telefone", {
                        required: "Telefone é obrigatório",
                      })}
                      className={`w-full border p-2 rounded-md ${
                        errors.telefone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.telefone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.telefone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">E-mail</label>
                    <Input
                      type="text"
                      {...register("email", {
                        required: "E-mail é obrigatório",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "E-mail inválido",
                        },
                      })}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Linha: CEP, Endereço e Número */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">CEP</label>
                    <InputMask
                      mask="99999-999"
                      {...register("cep", {
                        required: "CEP é obrigatório",
                      })}
                      className={`w-full border p-2 rounded-md ${
                        errors.cep ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cep && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cep.message}
                      </p>
                    )}
                    {cepError && (
                      <p className="text-red-500 text-sm mt-1">{cepError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Endereço
                    </label>
                    <Input
                      type="text"
                      {...register("endereco", {
                        required: "Endereço é obrigatório",
                      })}
                      className={errors.endereco ? "border-red-500" : ""}
                    />
                    {errors.endereco && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.endereco.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Número
                    </label>
                    <Input
                      type="text"
                      {...register("numero", {
                        required: "Número é obrigatório",
                      })}
                      className={errors.numero ? "border-red-500" : ""}
                    />
                    {errors.numero && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.numero.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Linha: Bairro, Estado, Cidade */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bairro</label>
                    <Input
                      type="text"
                      {...register("bairro", {
                        required: "Bairro é obrigatório",
                      })}
                      className={errors.bairro ? "border-red-500" : ""}
                    />
                    {errors.bairro && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bairro.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estado
                    </label>
                    <select
                      {...register("estado_id", {
                        required: "Estado é obrigatório",
                      })}
                      className={`w-full border p-2 rounded-md ${
                        errors.estado_id ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Selecione um estado</option>
                      {estados.map((estado) => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nome}
                        </option>
                      ))}
                    </select>
                    {errors.estado_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.estado_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cidade
                    </label>
                    <select
                      {...register("cidade_id", {
                        required: "Cidade é obrigatória",
                      })}
                      className={`w-full border p-2 rounded-md ${
                        errors.cidade_id ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Selecione uma cidade</option>
                      {cidades.map((cidade) => (
                        <option key={cidade.id} value={cidade.id}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                    {errors.cidade_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cidade_id.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Complemento (opcional) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Complemento
                  </label>
                  <Input type="text" {...register("complemento")} />
                </div>

                {/* Campo de Logo (opcional) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Logo</label>
                  <div
                    className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
                    onClick={handleLogoClick}
                  >
                    <p className="text-gray-500 text-sm mb-2">
                      Clique para selecionar uma imagem
                    </p>
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="mt-2 border border-gray-300 rounded-md w-[250px] h-[150px] object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto px-6 py-2">
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Campo de busca */}
          <Input
            placeholder="Buscar empresa..."
            className="w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabela de empresas */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Razão Social</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentEmpresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell>{empresa.id}</TableCell>
                <TableCell>{empresa.nome}</TableCell>
                <TableCell>{empresa.razao_social}</TableCell>
                <TableCell>{empresa.telefone}</TableCell>
                <TableCell>
                  <Switch
                    checked={empresa.status == true}
                    onCheckedChange={() => empresa.id !== undefined && handleToggleStatus(empresa.id)}
                  />
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEmpresa(empresa)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEmpresa(empresa.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginação simples */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
