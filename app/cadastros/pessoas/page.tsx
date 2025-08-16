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
import ExcelImportModal, { type SpreadsheetTemplate } from '@/components/ExcelImport';
import DetalharErrosImportacaoExcel, {type ResultadoImportacao} from '@/components/DetalharErrosImportacaoExcel'
import { Badge } from "@/components/ui/badge"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';

// Modelos de planilha de exemplo
const exampleTemplates: SpreadsheetTemplate[] = [
  {
    name: "Planilha Modelo",
    description: "Planilha para importação de Pessoas",
    url: "/importacao_pessoas.xlsx", // Substitua por URLs reais
  }
]


export default function Pessoas() {
  const { get, post, put, del } = useCrud("", {});
  const [data, setData] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [lastImportedFile, setLastImportedFile] = useState<File | null>(null)
  const [showImportMessage, setShowImportMessage] = useState(true)
  const [messageSuccessImport, setMessageSuccessImport] = useState<string>("Sucesso na importação.")
  const [messageErrorImport, setMessageErrorImport] = useState<string>("Não foram importados: 0 registros")

  const [resultadoImportacao, setResultadoImportacao] = useState<ResultadoImportacao | null>(null)
  const [errosModalAberto, setErrosModalAberto] = useState(false)

  const { changeStatus, importar } = usePessoasHook();
  const { index } = useCargosHook();

  const { isSuperAdmin, permissoes, temPermissao } = useInformacoesUsuarioHook();

  const permissoesUsuario = {
    podeCadastrar: temPermissao('cadastros.pessoas.adicionar') || false,
    podeEditar: temPermissao('cadastros.pessoas.editar') || false,
    podeExcluir: temPermissao('cadastros.pessoas.excluir') || false,
    podeVisualizar: true ,
  }

  const permissaoImportarPessoas = temPermissao('cadastros.pessoas.importar') || false;

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

  // Função que simula uma chamada ao backend
  const handleImport = async (file: File) => {
    setLastImportedFile(file)
    // Inicia a importacao para o backend
    const response = await importar(file);
    if (response) {
      toast.success("Planilha importada com sucesso.");
      setResultadoImportacao(response)
      setShowImportMessage(true)
      //Esvazia a listagem de pessoas
      setData([]);
      // Exibe mensagem de sucesso
      setMessageSuccessImport(`Foram importados: ${response?.sucesso} registros`);

      if (response?.erros_detalhados.length > 0) {
        setMessageErrorImport(`Não foram importados: ${response.erros_detalhados.length} registros`);
      } 
      // Recarrega a lista de pessoas
      await carregarPessoas();


      return true;
      
    } else {
      toast.error("Erro ao importar planilha.");
      setShowImportMessage(false)
      return false;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Pessoas</CardTitle>
        <CardDescription>Gerenciamento de pessoas</CardDescription>
      </CardHeader>

      <CardContent>

        <div className="flex justify-between items-center mb-4">
       

        {permissaoImportarPessoas && (<ExcelImportModal
            buttonText="Importar"
            title="Importação de Pessoas"
            description="Selecione uma planilha Excel para importar dados para o sistema"
            maxSizeInMB={15}
            templates={exampleTemplates}
            messages={{
              dropzoneText: "Arraste sua planilha Excel aqui ou clique para selecionar",
              dropzoneActiveText: "Solte a planilha aqui",
              invalidTypeError: "Apenas arquivos Excel (.xlsx, .xls) são permitidos",
              invalidSizeError: "O arquivo excede o limite de 15MB",
              successMessage: "Planilha pronta para importação",
              uploadButtonText: "Importar dados",
              uploadingText: "Importando dados...",
              successUploadText: "Dados importados!",
              templatesTabLabel: "Modelos de Planilha",
              importTabLabel: "Importar Dados",
              noTemplatesMessage: "Nenhum modelo de planilha disponível no momento",
            }}
            onImportConfirm={handleImport}
          />)}


          </div>


          {lastImportedFile && showImportMessage && (
            <div className="mt-6 p-4 border rounded-md w-full relative">
              <button
                onClick={() => setShowImportMessage(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
                aria-label="Fechar mensagem"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <h3 className="font-medium mb-2">Última planilha importada:</h3>
              <p className="text-sm">
                <strong>Nome:</strong> {lastImportedFile.name}
              </p>
              <p className="text-sm">
                <strong>Tipo:</strong> {lastImportedFile.type || getFileExtensionFromName(lastImportedFile.name)}
              </p>
              <p className="text-sm">
                <strong>Tamanho:</strong> {(lastImportedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="mt-2 flex place-content-between">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                   {messageSuccessImport}
                </Badge>

                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                   {messageErrorImport}
                </Badge>

                {(resultadoImportacao?.erros ?? 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-fit"
                      onClick={() => setErrosModalAberto(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Relatório detalhado de erros
                    </Button>
                  )}

                {resultadoImportacao !== null && (
                    <DetalharErrosImportacaoExcel
                    resultado={resultadoImportacao}
                    open={errosModalAberto}
                    onOpenChange={setErrosModalAberto}
                  />
                )}
              </div>
            </div>
          )}

        <DynamicCrudComponent
          fields={fields}
          columns={columns}
          fetchData={fetchData}
          saveData={saveData}
          deleteData={deleteData}
          toggleStatus={toggleStatus}
          permissoes={permissoesUsuario}
        />
      </CardContent>
    </Card>




    
  );
}

// Função auxiliar para obter a extensão do arquivo pelo nome
function getFileExtensionFromName(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "Desconhecido"
}
