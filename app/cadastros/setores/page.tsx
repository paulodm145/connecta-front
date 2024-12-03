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

export default function Setores() {
  const { index: listarSetores, changeStatus, store, update } = useSetoresHook();
  const { index: listarPessoas } = usePessoasHook();

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
      const response = await listarPessoas();
      console.log('Pessoas carregadas:', response); // Verificar o retorno
      if (response) {
        const options = response.map((pessoa: { id: number; nome: string }) => ({
          value: pessoa.id,
          label: pessoa.nome,
        }));
        if (Array.isArray(options) && options.length) {
          options.unshift({ value: '00', label: 'Selecione...' });
        }
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
    { name: 'responsavel.nome', label: 'Nome do Responsável', type: 'text' },
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
    setData((prevData) => prevData.filter((item) => item.id !== id));
    console.log('Excluindo registro com id:', id);
    return { success: true };
  };

  const toggleStatus = async (id: number) => {
    const statusSetor = await changeStatus(id);

    if (statusSetor) {
      toast.success("Status do setor alterado com sucesso.");
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item
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
        />
      </CardContent>
    </Card>
  );
}
