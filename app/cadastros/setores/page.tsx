'use client';

import { useEffect, useState } from 'react';
import DynamicCrudComponent from '@/components/DynamicCrudComponent';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSetoresHook } from '@/app/hooks/useSetoresHook';
import { usePessoasHook } from '@/app/hooks/usePessoasHook';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { render } from 'react-dom';
import { Stint_Ultra_Expanded } from 'next/font/google';

export default function Setores() {
  const { index: listarSetores, changeStatus, store, update, destroy } = useSetoresHook();
  const { getResponsaveis } = usePessoasHook();

  const [data, setData] = useState([]);
  const [pessoasOptions, setPessoasOptions] = useState([]);

  // Função para carregar a lista de setores
  const carregarSetores = async () => {
    try {
        const response = await listarSetores();
        if (response) {
            setData(response); // Atualizar o estado do componente
        }
    } catch (error) {
        console.error('Erro ao carregar os setores:', error);
    }
  };

  // Função para carregar a lista de pessoas
  const carregarPessoas = async () => {
    try {
      const response = await getResponsaveis();
      console.log('Pessoas carregadas:', response); // Verificar o retorno
      if (response) {
        const options = response.map((pessoa: { id: number; nome: string }) => ({
          value: (pessoa.id).toString(),
          label: pessoa.nome,
        }));
       
        setPessoasOptions(options);
      }
    } catch (error) {
      console.error('Erro ao carregar a lista de pessoas:', error);
    }
  };

  useEffect(() => {
    carregarSetores();
    carregarPessoas();
  }, []);

  // Campos do formulário
  const formSetores = [
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    {
      name: 'pessoa_id',
      label: 'Responsável',
      type: 'select',
      lookup: true,
      fetchOptions: async () => pessoasOptions,
    },
    {
      name: 'active',
      label: 'Status',
      type: 'toggle',
      value: true,
    }
  ];


  // Função para buscar os dados
  const fetchData = async () => {
    console.log('Dados atuais:', data); // Verificar estado dos dados
    return data;
  };

  const saveData = async (id: number | null, formData: any) => {
    try {
        if (id) {
            // Atualizar registro existente
            const response = await update(id, formData);
            if (response) {
                toast.success("Setor atualizado com sucesso.");
                await carregarSetores(); // Recarregar a lista de setores
                console.log('Atualizando registro:', id, formData);
                return { success: true };
            }
        } else {
            // Adicionar novo registro
            const response = await store(formData);
            if (response) {
                toast.success("Setor criado com sucesso.");
                await carregarSetores(); // Recarregar a lista de setores
                console.log('Criando novo registro:', formData);
                return { success: true };
            }
        }
    } catch (error) {
        console.error('Erro ao salvar setor:', error);
        return { success: false };
    }
  };

  const deleteData = async (id: number) => {
    try {
      console.log(`Tentando excluir o setor com ID: ${id}`);
      
      // Chama a função destroy do hook
      await destroy(id);
      
      // Recarrega os setores após exclusão
      await carregarSetores();
      
      toast.success("Setor excluído com sucesso.");
      console.log(`Setor com ID ${id} excluído com sucesso.`);
      
      return { success: true };
    } catch (error: any) {
      // Diagnóstico de erro detalhado
      const status = error?.response?.status || 'Indefinido';
      const errorMessage = error?.response?.data?.error || error.message || "Erro desconhecido";
      
      console.error(`Erro ao excluir o setor (ID: ${id}). Status: ${status}. Erro: ${errorMessage}`);
      toast.error(`Erro ao excluir setor: ${errorMessage}`);
      
      return { success: false };
    }
  };

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

  const columns = [
    { dataField: 'id', label: 'ID', render: (value) => value.toString().padStart(5, '0') },
    { dataField: 'descricao', label: 'Descrição' },
    { dataField: 'responsavel.nome', 
      label: 'Responsável',
      render: (_, item) => item.responsavel?.nome || 'Não informado'
    },
    
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Setores</CardTitle>
        <CardDescription>
          Gerenciamento de setores e responsáveis.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <DynamicCrudComponent
          fields={formSetores}
          fetchData={fetchData}
          saveData={saveData}
          deleteData={deleteData}
          toggleStatus={toggleStatus}
          columns={columns}
        />
      </CardContent>
    </Card>
  );
}
