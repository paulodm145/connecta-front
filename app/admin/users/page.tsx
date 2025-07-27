"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { ehSenhaDificil } from "@/app/utils/Helpers";

// UI Components
import Link from "next/link";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Hooks
import { useEmpresaAdminHook } from "@/app/hooks/useEmpresasAdminHook";
import { useUsuariosHook } from "@/app/hooks/useUsuariosHook";
import { useNiveisPermissoesHook } from "@/app/hooks/useNiveisPermissoesHook";

// Utils
import { isValidEmail } from "@/app/utils/Helpers";

// Tipos
interface Usuarios {
  id?: number;
  name: string;
  email: string;
  identificador_empresa: string;
  password?: string;
  confirm_password?: string;
  status?: boolean; // Para demonstrar toggle de status
  empresa?: string; // Para exibir o nome da empresa
  super_administrador?: boolean; // Campo para super administrador
  nivel_acesso?: number; // Nível de acesso do usuário
}

interface EmpresaAtiva {
  id: number;
  nome: string;
  identificador: string;
  status: boolean;
}

interface Nivel {
  id: number;
  descricao: string;
  status: boolean;
}

export default function PaginaListagem() {
  // Hooks para as ações das empresas (para popular o select)
  const { getEmpresasAtivas } = useEmpresaAdminHook();
  const { indexNiveis } = useNiveisPermissoesHook();

  // Hooks para as ações do usuário
  const {
    indexUsuario,
    storeUsuario,
    updateUsuario,
    destroyUsuario,
    changeStatusUsuario,
  } = useUsuariosHook();

  // Controle de modal e de edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuarios | null>(null);

  // Listas
  const [usuarios, setUsuarios] = useState<Usuarios[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaAtiva[]>([]);
  const [niveisList, setNiveisList] = useState<Nivel[]>([]);

  // Campo de busca e paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // useForm para os campos do usuário
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Usuarios>({
    defaultValues: {
      name: "",
      email: "",
      identificador_empresa: "",
      password: "",
      confirm_password: "",
      status: true,
      super_administrador: false, // Adiciona campo para super administrador
      nivel_acesso: undefined,
    },
  });

  // Carrega dados (usuários e empresas) ao montar
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [respUsuarios, respEmpresas, respNiveis] = await Promise.all([
          indexUsuario(),
          getEmpresasAtivas(),
          indexNiveis()
        ]);

        setUsuarios(respUsuarios ?? []);
        setEmpresas(respEmpresas ?? []);
        setNiveisList((respNiveis ?? []).filter((n: { status: any; }) => n.status));
      } catch (error) {
        toast.error("Erro ao carregar dados");
        console.error(error);
      }
    };
    carregarDados();
  }, []);

  // Ao enviar o formulário (criar ou atualizar)
  async function onSubmit(data: Usuarios) {
    try {
      if (editingUsuario && editingUsuario.id) {
        // Atualiza
        await updateUsuario(editingUsuario.id, data);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        // Cria

        // Verifica se a senha é forte
        if (data.password && !ehSenhaDificil(data.password)) {
          toast.error(
            "A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos"
          );
          return;
        }

        // As senhas devem ser iguais
        if (data.password !== data.confirm_password) {
          toast.error("As senhas não conferem");
          return;
        }

        await storeUsuario(data);
        toast.success("Usuário criado com sucesso!");
      }

      // Fecha modal, limpa form, reseta estado de edição
      setModalOpen(false);
      reset();
      setEditingUsuario(null);

      // Recarrega a listagem de usuários
      const novosUsuarios = await indexUsuario();
      setUsuarios(novosUsuarios ?? []);
    } catch (error) {
      toast.error("Erro ao salvar dados do usuário");
      console.error(error);
    }
  }

  // Ao clicar para novo usuário
  function handleNovoUsuario() {
    setEditingUsuario(null);
    reset({
      name: "",
      email: "",
      identificador_empresa: "",
      password: "",
      confirm_password: "",
      status: true,
      super_administrador: false, // Reseta para não ser super administrador por padrão
      nivel_acesso: undefined,
    });
    setModalOpen(true);
  }

  // Ao clicar para editar
  function handleEditUsuario(usuario: Usuarios) {
    setEditingUsuario(usuario);
    // Ajusta valores do form
    reset({
      ...usuario,
      super_administrador: !!usuario.super_administrador,
    });
    setModalOpen(true);
  }

  // Excluir usuário
  async function handleDeleteUsuario(id?: number) {
    if (!id) return;
    if (confirm("Excluir usuário?")) {
      try {
        await destroyUsuario(id);
        toast.success("Usuário excluído");
        setUsuarios(await indexUsuario() ?? []);
      } catch {
        toast.error("Erro ao excluir");
      }
    }
  }

  // Alternar status do usuário
  const handleToggleStatus = async (id: number) => {
    try {
      await changeStatusUsuario(id);
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: !u.status } : u));
      toast.success("Status alterado");
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  // Lógica de filtro e paginação
  const filteredUsuarios = usuarios.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

// Filtro e paginação
  const filtered = usuarios.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
        <CardDescription>
          Gerenciamento de usuários das contas de empresas. Esses usuários
          acessam seus respectivos ambientes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          {/* Botão de novo usuário + Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleNovoUsuario}>
                Novo Usuário
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 bg-white p-4 rounded-md"
              >
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    type="text"
                    {...register("name", { required: "Nome é obrigatório" })}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "E-mail é obrigatório",
                      validate: (value) =>
                        isValidEmail(value) || "E-mail inválido",
                    })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-sm font-medium mb-2">Empresa</label>
                  <select
                    {...register("identificador_empresa", {
                      required: "Empresa é obrigatória",
                    })}
                    className={`w-full border p-2 rounded-md ${
                      errors.identificador_empresa
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecione uma Empresa</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.identificador}>
                        {empresa.nome}
                      </option>
                    ))}
                  </select>
                  {errors.identificador_empresa && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.identificador_empresa.message}
                    </p>
                  )}
                </div>

                {/* Senha (apenas se desejar criar ou atualizar a senha) */}
                {!editingUsuario && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Senha
                      </label>
                      <Input
                        type="password"
                        {...register("password", {
                          required: "Senha é obrigatória",
                          minLength: {
                            value: 6,
                            message: "A senha deve ter no mínimo 6 caracteres",
                          },
                          validate: (value) =>
                            ehSenhaDificil(value || "") ||
                            "A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos",
                        })}
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirmar Senha
                      </label>
                      <Input
                        type="password"
                        {...register("confirm_password", {
                          required: "Confirmação de senha é obrigatória",
                          validate: (value, formValues) =>
                            value === formValues.password ||
                            "As senhas não conferem",
                        })}
                        className={
                          errors.confirm_password ? "border-red-500" : ""
                        }
                      />
                      {errors.confirm_password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.confirm_password.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Super Administrador */}
                <Controller
                  control={control}
                  name="super_administrador"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center space-x-2">
                      <Switch id="super_administrador" checked={value} onCheckedChange={onChange} />
                      <label htmlFor="super_administrador">Super Administrador</label>
                    </div>
                  )}
                />

                {/* Nível de Acesso */}
                <div>
                  <label className="block mb-1">Nível de Acesso</label>
                  <select
                    {...register("nivel_acesso", {
                      required: "Nível de acesso é obrigatório",
                      valueAsNumber: true,
                    })}
                    className={`w-full border p-2 rounded ${errors.nivel_acesso ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Selecione um nível</option>
                    {niveisList.map(n => (
                      <option key={n.id} value={n.id}>{n.descricao}</option>
                    ))}
                  </select>
                  {errors.nivel_acesso && <p className="text-red-500 text-sm">{errors.nivel_acesso.message}</p>}
                </div>



                <Button type="submit" className="w-full md:w-auto px-6 py-2">
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Campo de busca */}
          <Input
            placeholder="Buscar usuário por nome..."
            className="w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabela de Usuários */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Super Administrador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {current.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}

            {current.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{usuario.name}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.empresa}</TableCell>
                <TableCell>{usuario.super_administrador ? "Sim" : "Não"}</TableCell>
                <TableCell>
                  <Switch
                    checked={usuario.status === true}
                    onCheckedChange={() =>
                      usuario.id && handleToggleStatus(usuario.id)
                    }
                  />
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUsuario(usuario)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUsuario(usuario.id)}
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
