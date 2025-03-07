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
import { useCargosHook } from '@/app/hooks/useCargosHook';

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { maskBRPhone, maskCPFOrCNPJ } from '@/app/utils/Helpers';

export default function Pessoas() {
  const { get, post, put, del } = useCrud("", {});
  const [data, setData] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);

  const { changeStatus, pessoasIndex, getPessoasAtivas, getResponsaveis } = usePessoasHook();
  const { index } = useCargosHook();

 // Função para carregar a lista de pessoas
const carregarPessoas = async () => {
  try {
    const response = await get('pessoas');

    console.log('Pessoas carregadas:', response); // Verificar o retorno
    if (response) {
      // Usar map em vez de forEach para transformar os dados e retornar um novo array
      const pessoasLista = response.map((pessoa: any) => {
        return {
          ...pessoa, // Copiar todas as propriedades existentes
          cpf: maskCPFOrCNPJ(pessoa.cpf), // Aplicar máscara ao CPF
          telefone: maskBRPhone(pessoa.telefone), // Aplicar máscara ao telefone
        };
      });
      setData(pessoasLista); // Atualizar o estado do componente com o novo array
    }
  } catch (error) {
    console.error('Erro ao carregar a lista de pessoas:', error);
  }
};

// Função para carregar a lista de responsaveis
const carregarCargos = async () => {
  try {
    const response = await index();
    if (response) {
      const options = response.map((cargo: { id: number; descricao: string }) => ({
        value: cargo.id.toString(),
        label: cargo.descricao,
      }));
      setCargos(options); // Atualizar o estado do componente
    }
  } catch (error) {
    console.error('Erro ao carregar a lista de responsaveis:', error);
  }
};


useEffect(() => {
  carregarPessoas();
  carregarCargos();
}, []);

  const fields = [
    { name: 'nome', label: 'Nome', type: 'text', required: true },
    { name: "cpf", label: "CPF", type: "mask", required: true, maskPattern: "999.999.999-99" },
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'telefone', label: 'Telefone', type: 'text' },
    { name: 'registro_funcional', label: 'Registro Funcional', type: 'text' },
    
    {
      name: 'cargo_id',
      label: 'Cargo',
      type: 'select',
      lookup: true,
      fetchOptions: async () => cargos
    },
    {
      name: 'responsavel',
      label: 'Responsável',
      type: 'toggle',
      value: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'toggle',
      value: true,
    }
  ];

  const columns = [
    { dataField: 'id', label: 'ID', render: (value: { toString: () => string; }) => value.toString().padStart(5, '0') },
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
      //apenas numeros para cpf e telefone
      formData.cpf = formData.cpf.replace(/\D/g, '');
      formData.telefone = formData.telefone.replace(/\D/g, '');
      const response = await post("pessoas", formData);
      if (response) {
        await carregarPessoas(); // Recarrega a lista após criar
        return { success: true, id: response.id };
      } else {
        toast.error("Erro ao salvar pessoa.");
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
      toast.success("Status da Pessoa alterado com sucesso.");
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
        <CardDescription>Gerenciamento de pessoas</CardDescription>
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
