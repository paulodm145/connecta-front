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
import { useCargosHook } from '@/app/hooks/useCargosHook';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';

export default function Setores() {
  const { setoresAtivos} = useSetoresHook();
  const { index : cargosIndex, store, update, destroy, changeStatus } = useCargosHook();
  const { isSuperAdmin, permissoes, temPermissao } = useInformacoesUsuarioHook();

  const permissoesUsuario = {
    podeCadastrar: temPermissao('cadastros.cargos.adicionar') || false,
    podeEditar: temPermissao('cadastros.cargos.editar') || false,
    podeExcluir: temPermissao('cadastros.cargos.excluir') || false,
    podeVisualizar: true ,
  }

  const [data, setData] = useState([]);
  const [setoresOptions, setSetoresOptions] = useState([]);


  // Função para carregar a lista de setores
  const carregarCargos = async () => {
    try {
        const response = await cargosIndex();
        if (response) {
            setData(response); // Atualizar o estado do componente
        }
    } catch (error) {
        console.error('Erro ao carregar os setores:', error);
    }
  };

  const carregarSetores = async () => {
    try {
      const response = await setoresAtivos();
      console.log('Setores carregados:', response); // Verificar o retorno
      if (response) {
        const options = response.map((cargo: { id: number; descricao: string }) => ({
          value: (cargo.id).toString(),
          label: cargo.descricao,
        }));
        
        setSetoresOptions(options);
      }
    } catch (error) {
      console.error('Erro ao carregar a lista de cargos:', error);
    }
  }


  useEffect(() => {
    carregarSetores();
    carregarCargos();
  }, []);

  // Campos do formulário
  const formCargos = [
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    {
      name: 'setor_id',
      label: 'Setor',
      type: 'select',
      lookup: true,
      fetchOptions: async () => setoresOptions,
    },
    {
      name: 'status',
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
                toast.success("Cargo atualizado com sucesso.");
                await carregarCargos(); // Recarregar a lista de setores
                console.log('Atualizando registro:', id, formData);
                return { success: true };
            }
        } else {
            // Adicionar novo registro
            const response = await store(formData);
            if (response) {
                toast.success("Cargo criado com sucesso.");
                await carregarCargos(); // Recarregar a lista de setores
                console.log('Criando novo registro:', formData);
                return { success: true };
            }
        }
    } catch (error) {
        console.error('Erro ao salvar cargo:', error);
        return { success: false };
    }
  };

  const deleteData = async (id: number) => {
    try {
      // Faz a chamada para a função de exclusão
      await destroy(id);
  
      // Sem conteúdo no retorno, apenas verificamos se não houve erro
      toast.success("Cargo excluído com sucesso.");
      console.log('Registro excluído com sucesso, ID:', id);
  
      // Recarrega a lista de cargos
      await carregarCargos();
  
      return { success: true };
    } catch (error: any) {
      // Tratamento de erro considerando o formato esperado
      const errorMessage = error?.response?.data?.error || error.message || "Erro desconhecido";
  
      toast.error(`Erro ao excluir cargo: ${errorMessage}`);
      console.error('Erro ao excluir cargo:', errorMessage);
  
      return { success: false };
    }
  };

  const toggleStatus = async (id: number) => {
    const statusSetor = await changeStatus(id);

    if (statusSetor) {
      toast.success("Status do cargo alterado com sucesso.");
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
      console.error('Erro ao alterar status do cargo:', id);
      return { success: false };
    }
  };

  const columns = [
    { dataField: 'id', label: 'ID', render: (value) => value.toString().padStart(5, '0') },
    { dataField: 'descricao', label: 'Descrição' },
    { dataField: 'setor.descricao', 
      label: 'Setor',
      render: (_, item) => item.setor?.descricao || 'Não informado'
    },
    
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Cargos</CardTitle>
        <CardDescription>
          Gerenciamento de cargos da empresa.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <DynamicCrudComponent
          fields={formCargos}
          fetchData={fetchData}
          saveData={saveData}
          deleteData={deleteData}
          toggleStatus={toggleStatus}
          columns={columns}
          permissoes={permissoesUsuario}
        />
      </CardContent>
    </Card>
  );
}
