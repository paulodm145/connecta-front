'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface PropriedadesBotoesImportacaoExportacao {
  textoBotaoExportar: string;
  textoBotaoImportar: string;
  nomeArquivoExportacao: string;
  exportarArquivo: () => Promise<Blob | null>;
  importarArquivo: (arquivo: File) => Promise<any | null>;
  aoImportarComSucesso: (resultado: any) => Promise<void> | void;
  podeExportar: boolean;
  podeImportar: boolean;
}

export default function BotoesImportacaoExportacao({
  textoBotaoExportar,
  textoBotaoImportar,
  nomeArquivoExportacao,
  exportarArquivo,
  importarArquivo,
  aoImportarComSucesso,
  podeExportar,
  podeImportar,
}: PropriedadesBotoesImportacaoExportacao) {
  const inputArquivoImportacao = useRef<HTMLInputElement>(null);
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);

  async function handleExportar() {
    setExportando(true);
    const arquivo = await exportarArquivo();
    setExportando(false);

    if (arquivo) {
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivoExportacao;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Arquivo exportado com sucesso!');
    }
  }

  async function handleImportar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setImportando(true);
    const resultado = await importarArquivo(arquivo);
    setImportando(false);

    // Limpa o input para permitir importar o mesmo arquivo novamente
    if (inputArquivoImportacao.current) inputArquivoImportacao.current.value = '';

    if (resultado) {
      await aoImportarComSucesso(resultado);
    }
  }

  if (!podeExportar && !podeImportar) return null;

  return (
    <div className="flex items-center gap-2">
      {podeExportar && (
        <Button variant="outline" disabled={exportando} onClick={handleExportar}>
          {exportando ? 'Exportando...' : textoBotaoExportar}
        </Button>
      )}

      {podeImportar && (
        <>
          <input
            ref={inputArquivoImportacao}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportar}
          />
          <Button
            variant="outline"
            disabled={importando}
            onClick={() => inputArquivoImportacao.current?.click()}
          >
            {importando ? 'Importando...' : textoBotaoImportar}
          </Button>
        </>
      )}
    </div>
  );
}
