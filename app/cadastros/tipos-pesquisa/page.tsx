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
import { useTiposPesquisaHook } from '@/app/hooks/useTiposPesquisaHook';
import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Setores() {
  const { setoresAtivos} = useSetoresHook();
  const { index : index, store, update, destroy, changeStatus } = useTiposPesquisaHook();
  const { isSuperAdmin, permissoes, temPermissao } = useInformacoesUsuarioHook();

  const permissoesUsuario = {
    podeCadastrar: temPermissao('pesquisas.tipo.pesquisa.adicionar') || false,
    podeEditar: temPermissao('pesquisas.tipo.pesquisa.editar') || false,
    podeExcluir: temPermissao('pesquisas.tipo.pesquisa.esxcluir.respondentes') || false,
    podeVisualizar: true ,
  }


  const [data, setData] = useState([]);
  const [setoresOptions, setSetoresOptions] = useState([]);

  // Função para carregar a lista de setores
  const carregarTiposPesquisa = async () => {
    try {
        const response = await index();
        if (response) {
            setData(response); // Atualizar o estado do componente
        }
    } catch (error) {
        console.error('Erro ao carregar os tipos pesquisa:', error);
    }
  };

  useEffect(() => {
    carregarTiposPesquisa();
  }, []);

  // Campos do formulário
  const formCargos = [
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
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
                toast.success("TIPO PESQUISA atualizado com sucesso.");
                await carregarTiposPesquisa(); // Recarregar a lista de setores
                console.log('Atualizando registro:', id, formData);
                return { success: true };
            }
        } else {
            // Adicionar novo registro
            const response = await store(formData);
            if (response) {
                toast.success("TIPO PESQUISA criado com sucesso.");
                await carregarTiposPesquisa(); // Recarregar a lista de setores
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
      toast.success("TIPO PESQUISA excluído com sucesso.");
      console.log('Registro excluído com sucesso, ID:', id);
  
      // Recarrega a lista de cargos
      await carregarTiposPesquisa();
  
      return { success: true };
    } catch (error: any) {
      // Tratamento de erro considerando o formato esperado
      const errorMessage = error?.response?.data?.error || error.message || "Erro desconhecido";
  
      toast.error(`Erro ao excluir Tipo Pesquisa: ${errorMessage}`);
      console.error('Erro ao excluir Tipo Pesquisa:', errorMessage);
  
      return { success: false };
    }
  };

  const toggleStatus = async (id: number) => {
    const statusSetor = await changeStatus(id);

    if (statusSetor) {
      toast.success("Status do Tipo Pesquisa alterado com sucesso.");
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
    { dataField: 'descricao', label: 'Descrição' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Tipo de Pesquisa</CardTitle>
        <CardDescription>
          Definição dos tipos de pesquisa disponíveis no sistema.
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
