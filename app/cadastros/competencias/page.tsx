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

interface ResultadoImportacaoCompetencias {
  message: string;
  criadas: number;
  ignoradas: number;
  detalhes: {
    criadas: string[];
    ignoradas: string[];
  };
}

interface CompetenciaData {
  id: number;
  descricao: string;
  prompt_pdi: string;
  ativo: boolean;
  status: boolean;
}

export default function Competencias() {
  const { index, store, update, destroy, changeStatus, exportarCompetencias, importarCompetencias } = useCompetenciasHook();
  const { temPermissao } = useInformacoesUsuarioHook();

  const [data, setData] = useState<CompetenciaData[]>([]);
  const [resultadoImportacao, setResultadoImportacao] = useState<ResultadoImportacaoCompetencias | null>(null);

  const permissoesUsuario = {
    podeCadastrar: temPermissao('cadastros.competencias.adicionar') || false,
    podeEditar: temPermissao('cadastros.competencias.editar') || false,
    podeExcluir: temPermissao('cadastros.competencias.excluir') || false,
    podeVisualizar: temPermissao('cadastros.competencias.visualizar') || true,
    podeExportar: temPermissao('competencias.competencias.exportar') || false,
    podeImportar: temPermissao('competencias.competencias.importar') || false,
  };

  const carregarCompetencias = async () => {
    try {
      const response = await index();
      if (response) {
        const normalized = response.map((competencia) => ({
          ...competencia,
          status: competencia.ativo,
        }));
        setData(normalized);
      }
    } catch (error) {
      console.error('Erro ao carregar as competências:', error);
    }
  };

  useEffect(() => {
    carregarCompetencias();
  }, []);

  const formCompetencias = [
    { name: 'descricao', label: 'Descrição', type: 'text', required: true },
    {
      name: 'prompt_pdi',
      label: 'Prompt PDI',
      type: 'textarea',
      required: true,
    },
    {
      name: 'ativo',
      label: 'Status',
      type: 'toggle',
      value: true,
    }
  ];

  const fetchData = async () => {
    return data;
  };

  const saveData = async (id: number | null, formData: any) => {
    const payload = {
      descricao: formData.descricao,
      prompt_pdi: formData.prompt_pdi,
      ativo: formData.ativo ?? formData.status ?? true,
    };

    try {
      if (id) {
        const response = await update(id, payload);
        if (response) {
          toast.success("Competência atualizada com sucesso.");
          await carregarCompetencias();
          return { success: true };
        }
      } else {
        const response = await store(payload);
        if (response) {
          toast.success("Competência criada com sucesso.");
          await carregarCompetencias();
          return { success: true };
        }
      }
    } catch (error) {
      console.error('Erro ao salvar competência:', error);
    }

    return { success: false };
  };

  const deleteData = async (id: number) => {
    try {
      const response = await destroy(id);
      if (response !== null) {
        toast.success("Competência excluída com sucesso.");
        await carregarCompetencias();
        return { success: true };
      }
    } catch (error) {
      console.error('Erro ao excluir competência:', error);
    }

    return { success: false };
  };

  const toggleStatus = async (id: number, _currentStatus?: boolean) => {
    const statusAlterado = await changeStatus(id);

    if (statusAlterado) {
      toast.success("Status da competência alterado com sucesso.");
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, status: !item.status, ativo: !item.ativo } : item
        )
      );
      return { success: true };
    }

    toast.error("Erro ao alterar status da competência.");
    return { success: false };
  };

  const aoImportarCompetencias = async (resultado: ResultadoImportacaoCompetencias) => {
    toast.success(`Importação concluída: ${resultado.criadas} criadas, ${resultado.ignoradas} ignoradas.`);
    setResultadoImportacao(resultado);
    await carregarCompetencias();
  };

  const columns = [
    { dataField: 'id', label: 'ID', render: (value: number) => value.toString().padStart(5, '0') },
    { dataField: 'descricao', label: 'Descrição' },
    {
      dataField: 'prompt_pdi',
      label: 'Prompt PDI',
      render: (value: string) => value?.length > 60 ? `${value.slice(0, 57)}...` : value,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Competências</CardTitle>
        <CardDescription>
          Gerencie as competências utilizadas nas avaliações e geração de PDI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <BotoesImportacaoExportacao
            textoBotaoExportar="Exportar Competências"
            textoBotaoImportar="Importar Competências"
            nomeArquivoExportacao="competencias.json"
            exportarArquivo={exportarCompetencias}
            importarArquivo={importarCompetencias}
            aoImportarComSucesso={aoImportarCompetencias}
            podeExportar={permissoesUsuario.podeExportar}
            podeImportar={permissoesUsuario.podeImportar}
          />
        </div>

        {resultadoImportacao && (
          <Alert>
            <AlertTitle>Resultado da importação</AlertTitle>
            <AlertDescription>
              <p>{resultadoImportacao.criadas} competência(s) criada(s), {resultadoImportacao.ignoradas} ignorada(s) por já existirem.</p>
              {resultadoImportacao.detalhes?.criadas?.length > 0 && (
                <p>Criadas: {resultadoImportacao.detalhes.criadas.join(', ')}.</p>
              )}
              {resultadoImportacao.detalhes?.ignoradas?.length > 0 && (
                <p>Ignoradas: {resultadoImportacao.detalhes.ignoradas.join(', ')}.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <DynamicCrudComponent
          fields={formCompetencias}
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
