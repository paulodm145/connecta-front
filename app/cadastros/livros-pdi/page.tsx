'use client';

import { useEffect, useState } from 'react';
import DynamicCrudComponent from '@/components/DynamicCrudComponent';
import BotoesImportacaoExportacao from '@/components/BotoesImportacaoExportacao';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';
import { useCompetenciasHook } from '@/app/hooks/useCompetenciasHook';
import { useLivrosPdiHook } from '@/app/hooks/useLivrosPdiHook';
import ProtecaoPermissao from '@/components/ProtecaoPermissao';

interface ResultadoImportacaoRecursosPdi {
  message: string;
  criados: number;
  ignorados: number;
  nao_encontradas: string[];
  detalhes: {
    criados: string[];
    ignorados: string[];
  };
}

interface LivroPdiData {
  id: number;
  competencia_id: number;
  titulo: string;
  link?: string | null;
  descricao: string;
  competencia?: {
    id: number;
    descricao: string;
  };
}

export default function LivrosPdi() {
  const { index: listarCompetencias } = useCompetenciasHook();
  const { index, store, update, destroy, exportarLivros, importarLivros } = useLivrosPdiHook();
  const { temPermissao } = useInformacoesUsuarioHook();

  const [data, setData] = useState<LivroPdiData[]>([]);
  const [resultadoImportacao, setResultadoImportacao] = useState<ResultadoImportacaoRecursosPdi | null>(null);
  const [competenciasOptions, setCompetenciasOptions] = useState<{ value: string; label: string }[]>([]);

  const permissoesUsuario = {
    podeCadastrar: temPermissao('competencias.livros.adicionar') || false,
    podeEditar: temPermissao('competencias.livros.editar') || false,
    podeExcluir: temPermissao('competencias.livros.excluir') || false,
    podeVisualizar: true,
    podeExportar: temPermissao('competencias.livros.exportar') || false,
    podeImportar: temPermissao('competencias.livros.importar') || false,
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
    { name: 'link', label: 'Link', type: 'text', required: false },
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
      ...(formData.link?.trim() ? { link: formData.link.trim() } : {}),
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

  const aoImportarLivros = async (resultado: ResultadoImportacaoRecursosPdi) => {
    toast.success(`Importação concluída: ${resultado.criados} criado(s), ${resultado.ignorados} ignorado(s).`);
    setResultadoImportacao(resultado);
    await carregarLivros();
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
      render: (value: string | null) => {
        if (!value) {
          return 'Não informado';
        }

        return (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 hover:underline"
          >
            {value.length > 40 ? `${value.slice(0, 37)}...` : value}
          </a>
        );
      },
    },
    {
      dataField: 'descricao',
      label: 'Descrição',
      render: (value: string) => value?.length > 80 ? `${value.slice(0, 77)}...` : value,
    },
  ];

  return (
    <ProtecaoPermissao chaves={['competencias.livros.exibir.menu']}>
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Livros do PDI</CardTitle>
        <CardDescription>
          Gerencie os livros recomendados para o plano de desenvolvimento individual.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <BotoesImportacaoExportacao
            textoBotaoExportar="Exportar Livros"
            textoBotaoImportar="Importar Livros"
            nomeArquivoExportacao="livros-pdi.json"
            exportarArquivo={exportarLivros}
            importarArquivo={importarLivros}
            aoImportarComSucesso={aoImportarLivros}
            podeExportar={permissoesUsuario.podeExportar}
            podeImportar={permissoesUsuario.podeImportar}
          />
        </div>

        {resultadoImportacao && (
          <Alert variant={resultadoImportacao.nao_encontradas?.length > 0 ? 'destructive' : 'default'}>
            <AlertTitle>Resultado da importação</AlertTitle>
            <AlertDescription>
              <p>{resultadoImportacao.criados} livro(s) criado(s), {resultadoImportacao.ignorados} ignorado(s) por já existirem.</p>
              {resultadoImportacao.nao_encontradas?.length > 0 && (
                <p>
                  As seguintes competências não foram encontradas: {resultadoImportacao.nao_encontradas.join(', ')}.
                  Importe as competências antes de importar os livros.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

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
    </ProtecaoPermissao>
  );
}
