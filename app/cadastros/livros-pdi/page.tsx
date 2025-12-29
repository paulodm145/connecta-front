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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';
import { useCompetenciasHook } from '@/app/hooks/useCompetenciasHook';
import { useLivrosPdiHook } from '@/app/hooks/useLivrosPdiHook';

interface LivroPdiData {
  id: number;
  competencia_id: number;
  titulo: string;
  link: string;
  descricao: string;
  competencia?: {
    id: number;
    descricao: string;
  };
}

export default function LivrosPdi() {
  const { index: listarCompetencias } = useCompetenciasHook();
  const { index, store, update, destroy } = useLivrosPdiHook();
  const { temPermissao } = useInformacoesUsuarioHook();

  const [data, setData] = useState<LivroPdiData[]>([]);
  const [competenciasOptions, setCompetenciasOptions] = useState<{ value: string; label: string }[]>([]);

  const permissoesUsuario = {
    podeCadastrar: temPermissao('cadastros.livros-pdi.adicionar') || false,
    podeEditar: temPermissao('cadastros.livros-pdi.editar') || false,
    podeExcluir: temPermissao('cadastros.livros-pdi.excluir') || false,
    podeVisualizar: temPermissao('cadastros.livros-pdi.visualizar') || true,
  };

  const carregarCompetencias = async () => {
    try {
      const response = await listarCompetencias();
      if (response) {
        const options = response.map((competencia) => ({
          value: competencia.id.toString(),
          label: competencia.descricao,
        }));
        setCompetenciasOptions(options);
      }
    } catch (error) {
      console.error('Erro ao carregar as competências:', error);
    }
  };

  const carregarLivros = async () => {
    try {
      const response = await index();
      if (response) {
        setData(response);
      }
    } catch (error) {
      console.error('Erro ao carregar os livros do PDI:', error);
    }
  };

  useEffect(() => {
    carregarCompetencias();
    carregarLivros();
  }, []);

  const formLivros = [
    {
      name: 'competencia_id',
      label: 'Competência',
      type: 'select',
      lookup: true,
      required: true,
      fetchOptions: async () => competenciasOptions,
    },
    { name: 'titulo', label: 'Título', type: 'text', required: true },
    { name: 'link', label: 'Link', type: 'text', required: true },
    {
      name: 'descricao',
      label: 'Descrição',
      type: 'textarea',
      required: true,
    },
  ];

  const fetchData = async () => {
    return data;
  };

  const saveData = async (id: number | null, formData: any) => {
    const payload = {
      competencia_id: Number(formData.competencia_id),
      titulo: formData.titulo,
      link: formData.link,
      descricao: formData.descricao,
    };

    try {
      if (id) {
        const response = await update(id, payload);
        if (response) {
          toast.success("Livro do PDI atualizado com sucesso.");
          await carregarLivros();
          return { success: true };
        }
      } else {
        const response = await store(payload);
        if (response) {
          toast.success("Livro do PDI criado com sucesso.");
          await carregarLivros();
          return { success: true };
        }
      }
    } catch (error) {
      console.error('Erro ao salvar livro do PDI:', error);
    }

    return { success: false };
  };

  const deleteData = async (id: number) => {
    try {
      await destroy(id);
      toast.success("Livro do PDI excluído com sucesso.");
      await carregarLivros();
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir livro do PDI:', error);
    }

    return { success: false };
  };

  const columns = [
    { dataField: 'id', label: 'ID', render: (value: number) => value.toString().padStart(5, '0') },
    { dataField: 'titulo', label: 'Título' },
    {
      dataField: 'competencia.descricao',
      label: 'Competência',
      render: (_: string, item: LivroPdiData) => item.competencia?.descricao || 'Não informado',
    },
    {
      dataField: 'link',
      label: 'Link',
      render: (value: string) => (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-amber-700 hover:underline"
        >
          {value?.length > 40 ? `${value.slice(0, 37)}...` : value}
        </a>
      ),
    },
    {
      dataField: 'descricao',
      label: 'Descrição',
      render: (value: string) => value?.length > 80 ? `${value.slice(0, 77)}...` : value,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Livros do PDI</CardTitle>
        <CardDescription>
          Gerencie os livros recomendados para o plano de desenvolvimento individual.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <DynamicCrudComponent
          fields={formLivros}
          fetchData={fetchData}
          saveData={saveData}
          deleteData={deleteData}
          toggleStatus={async () => ({ success: false })}
          columns={columns}
          permissoes={permissoesUsuario}
          exibirStatus={false}
        />
      </CardContent>
    </Card>
  );
}
