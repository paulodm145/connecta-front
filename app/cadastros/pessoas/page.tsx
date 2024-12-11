"use client";
import { useCallback, useEffect, useState, useMemo } from 'react';
import DynamicCrudComponent from '@/components/DynamicCrudComponent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCrud } from '@/app/hooks/useCRUD';
import { usePessoasHook } from '@/app/hooks/usePessoasHook';

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Pessoas() {
  const { get, post, put, del } = useCrud("", {});
  const [data, setData] = useState<any[]>([]);

  const { changeStatus } = usePessoasHook();

 // Função para carregar a lista de pessoas
 const carregarPessoas = async () => {
  try {
    const response = await get('pessoas');
    console.log('Pessoas carregadas:', response); // Verificar o retorno
    if (response) {
      setData(response); // Atualizar o estado do componente
    }
  } catch (error) {
    console.error('Erro ao carregar a lista de pessoas:', error);
  }
};

useEffect(() => {
  carregarPessoas();
}, []);

  const fields = useMemo(() => [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: 'cpf', label: 'CPF', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'telefone', label: 'Telefone', type: 'text' },
    { name: 'registro_funcional', label: 'Registro Funcional', type: 'text' },
    {
      name: 'cargo_id',
      label: 'Cargo',
      type: 'select',
      lookup: true,
      fetchOptions: async () => [
        { value: '5', label: 'Gerente' },
        { value: '5', label: 'Analista' },
        { value: '5', label: 'Assistente' }
      ]
    },
    { name: 'responsavel', label: 'Responsável', type: 'checkbox' }
  ], []);

  const columns = [
    { dataField: 'id', label: 'ID', render: (value) => value.toString().padStart(5, '0') },
    { label: "Nome", dataField: "nome" },
    { label: "CPF", dataField: "cpf" },
    { label: "Email", dataField: "email" },
    { label: "Telefone", dataField: "telefone" },
    { label: "Registro Funcional", dataField: "registro_funcional" },
    { dataField: 'cargos.descricao', 
      label: 'Cargo',
      render: (_, item) => item.cargos?.descricao || 'Não informado'
    },
    { label: "Responsável", dataField: "responsavel", render: (val: boolean) => val ? 'Sim' : 'Não' },
  ];

  // Agora fetchData apenas retorna o estado local, não chama a API
  const fetchData = useCallback(async () => {
    return data;
  }, [data]);

  const saveData = useCallback(async (id: number | null, formData: any) => {
    if (id) {
      // Atualiza registro existente
      const response = await put(`pessoas/${id}`, formData);
      if (response) {
        await carregarPessoas(); // Recarrega a lista após salvar
        return { success: true, id: response.id };
      }
    } else {
      // Cria novo registro
      const response = await post("pessoas", formData);
      if (response) {
        await carregarPessoas(); // Recarrega a lista após criar
        return { success: true, id: response.id };
      }
    }
    return { success: false };
  }, [post, put, carregarPessoas]);

  const deleteData = useCallback(async (id: number) => {
    await del(`pessoas/${id}`);
    await carregarPessoas(); // Recarrega a lista após deletar
    return { success: true };
  }, [del, carregarPessoas]);

  //muda o status
  const toggleStatus = async (id: number) => {
    const statusSetor = await changeStatus(id);

    if (statusSetor) {
      toast.success("Status do setor alterado com sucesso.");
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, status: !item.status } : item
        )
      );
      console.log(
        `Alterando status do registro com id ${id} para ${
          statusSetor ? 'Ativo' : 'Inativo'
        }`
      );
      return { success: true };
    } else {
      console.error('Erro ao alterar status do setor:', id);
      return { success: false };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Pessoas</CardTitle>
        <CardDescription>Gerenciamento de pessoas ... adicionar explicação depois</CardDescription>
      </CardHeader>

      <CardContent>
        <DynamicCrudComponent
          fields={fields}
          columns={columns}
          fetchData={fetchData}
          saveData={saveData}
          deleteData={deleteData}
          toggleStatus={toggleStatus}
        />
      </CardContent>
    </Card>
  );
}
