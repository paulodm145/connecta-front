'use client'

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import InputMask from "react-input-mask";
import { useEstadosCidadesHook } from "@/app/hooks/useEstadosCidadesHook";
import axios from "axios";
import { isValidCNPJ, isValidEmail, maskCep } from '@/app/utils/Helpers';
import { Button } from '@/components/ui/button';

import { useEmpresaClienteHook } from "@/app/hooks/useEmpresaClienteHook";
import { toast } from "react-toastify";

import { useUserStore } from "@/app/store/userStore";
import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';


const EmpresaForm: React.FC = () => {
const {
    register,
    handleSubmit,
    setValue,
    reset, // Adicionado para redefinir o formulário com os dados da empresa
    watch,
    formState: { errors },
    } = useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Referência para o input de arquivo
  const { getEstados, getCidades } = useEstadosCidadesHook();
  const { dadosEmpresa, updateEmpresaCliente } = useEmpresaClienteHook();

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);

  const estadoId = watch("estado_id");
  const cep = watch("cep");

  const isInitialLoad = useRef(true); // Flag para evitar loops no carregamento inicial
  const isManualCepChange = useRef(false); // Rastrea se a alteração do CEP foi manual

  const { user, updateEmpresa } = useUserStore(); // Pega o usuário e a ação do store
  const { isSuperAdmin, permissoes, temPermissao } = useInformacoesUsuarioHook();

  const permissoesUsuario = {
    podeEditar: temPermissao('minha.empresa.editar') || false,
  }

 // Carregar estados ao montar
  useEffect(() => {
    const fetchEstados = async () => {
      const data = await getEstados();
      setEstados(data || []);
    };
    fetchEstados();
  }, []);
  
  // Preencher o formulário com os dados da empresa ao carregar
  useEffect(() => {
    const fetchDadosEmpresa = async () => {
      try {
        const dados = await dadosEmpresa(); // Busca os dados da empresa
        if (dados && dados.length > 0) {
          const empresa = dados[0];
  
          // Formatar valores conforme necessário
          const formattedData = {
            ...empresa,
            cnpj: empresa.cnpj.replace(
              /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
              "$1.$2.$3/$4-$5"
            ),
            telefone: empresa.telefone.replace(
              /^(\d{2})(\d{4,5})(\d{4})$/,
              "($1) $2-$3"
            ),
           //cep: empresa.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2"),
          };
  
          // Atualizar os valores no formulário
          reset(formattedData);

          // Atualizar o preview da logo, se existir
        if (empresa.logo) {
            setLogoPreview(empresa.logo); // Atualiza o preview com a logo existente
        }
  
          // Atualizar cidades se necessário
          if (empresa.estado_id) {
            const estadoSigla = estados.find(
              (e: any) => e.id === empresa.estado_id
            )?.sigla;
            if (estadoSigla) {
              const cidadesData = await getCidades(estadoSigla);
              setCidades(cidadesData);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
      } finally {
        isInitialLoad.current = false; // Marca o carregamento inicial como concluído
      }
    };
  
    // Executa apenas na primeira vez
    if (isInitialLoad.current) {
      fetchDadosEmpresa();
    }
  }, [reset, getCidades, dadosEmpresa, estados]);
  
  // Buscar endereço pelo CEP
  useEffect(() => {
    const fetchAddressByCep = async (cep: string) => {
      try {
        setCepError(null);
        const formattedCep = cep.replace(/\D/g, "");
        if (formattedCep.length !== 8) {
          throw new Error("Formato de CEP inválido.");
        }

        const response = await axios.get(
          `https://brasilapi.com.br/api/cep/v1/${formattedCep}`
        );
        const { street, neighborhood, city, state } = response.data;
  
        // Preenche os campos do formulário
        setValue("endereco", street);
        setValue("bairro", neighborhood);
  
        // Atualiza estado e cidade
        const estado = estados.find((e: any) => e.sigla === state);
        if (estado) {
          setValue("estado_id", estado.id);
  
          const cidadesData = await getCidades(state);
          setCidades(cidadesData);
  
          const cidade = cidadesData.find(
            (c: any) => c.nome.toLowerCase() === city.toLowerCase()
          );
          if (cidade) {
            setValue("cidade_id", cidade.id);
          }
        }
      } catch (error) {
        console.error("Erro na consulta do CEP:", error);
        setCepError("CEP inválido ou não encontrado.");
      }
    };
  
    if (
      cep &&
      cep.replace(/\D/g, "").length === 8 &&
      estados.length > 0 &&
      isManualCepChange.current
    ) {
      isManualCepChange.current = false; // Reseta após o uso
      fetchAddressByCep(cep);
    }
  }, [cep, estados, setValue, getCidades]);
  
  // Detectar alterações manuais no CEP
  useEffect(() => {
    const unwatchCep = watch((value, { name }) => {
      if (name === "cep") {
        isManualCepChange.current = true;
      }
    });
    return () => unwatchCep.unsubscribe(); // Limpa o listener quando o componente desmonta
  }, [watch]);

  const handleLogoClick = () => {
    // Abre o seletor de arquivos programaticamente
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("O arquivo deve ser uma imagem.");
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert("O arquivo deve ter no máximo 25MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setLogoPreview(base64Image); // Define a pré-visualização
        setValue("logo", base64Image); // Define o valor no formulário
      };
      reader.readAsDataURL(file);
    }
  };

    const onSubmit = async (data: any) => {
    try {
        const dataToSend = {
        ...data,
        cnpj: data.cnpj.replace(/\D/g, ""),
        telefone: data.telefone.replace(/\D/g, ""),
        cep: data.cep.replace(/\D/g, ""),
        };

        console.log("Payload enviado:", dataToSend); // Verifique se o logo está no payload

        const response = await updateEmpresaCliente(dataToSend);

        if (response) {
        toast.success("Empresa salva com sucesso.");

         // Atualizar o estado global com os novos dados
         updateEmpresa(dataToSend);

        } else {
        toast.error("Erro ao salvar empresa. Resposta inválida.");
        }
    } catch (error) {
        toast.error("Erro ao salvar empresa. Tente novamente.");
        console.error("Erro ao salvar empresa:", error);
    }
    };



  return (
<form
  onSubmit={handleSubmit(onSubmit)}
  className="space-y-6 bg-white p-6 shadow-lg rounded-lg"
>
  {/* Linha: Nome e Razão Social */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium mb-2">Nome</label>
      <input
        type="text"
        {...register("nome", { required: "Nome é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.nome ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.nome && (
        <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Razão Social</label>
      <input
        type="text"
        {...register("razao_social", { required: "Razão Social é obrigatória" })}
        className={`w-full border p-2 rounded-lg ${
          errors.razao_social ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.razao_social && (
        <p className="text-red-500 text-sm mt-1">
          {errors.razao_social.message}
        </p>
      )}
    </div>
  </div>

  {/* Linha: CNPJ e Telefone */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium mb-2">CNPJ</label>
      <InputMask
        mask="99.999.999/9999-99"
        {...register("cnpj", {
          required: "CNPJ é obrigatório",
          validate: (value) => isValidCNPJ(value) || "CNPJ inválido",
        })}
        className={`w-full border p-2 rounded-lg ${
          errors.cnpj ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.cnpj && (
        <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Telefone</label>
      <InputMask
        mask="(99) 99999-9999"
        {...register("telefone", { required: "Telefone é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.telefone ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.telefone && (
        <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">E-mail</label>
      <input
        type="text"
        {...register("email", {
          required: "E-mail é obrigatório",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
            message: "E-mail inválido",
          },
        })}
        className={`w-full border p-2 rounded-lg ${
          errors.email ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
      )}
    </div>
  </div>

  {/* Linha: CEP, Endereço e Número */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium mb-2">CEP</label>
      <InputMask
        mask="99999-999"
        {...register("cep", { required: "CEP é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.cep || cepError ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.cep && (
        <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>
      )}
      {cepError && <p className="text-red-500 text-sm mt-1">{cepError}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Endereço</label>
      <input
        type="text"
        {...register("endereco", { required: "Endereço é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.endereco ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.endereco && (
        <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Número</label>
      <input
        type="text"
        {...register("numero", { required: "Número é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.numero ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.numero && (
        <p className="text-red-500 text-sm mt-1">{errors.numero.message}</p>
      )}
    </div>
  </div>

  {/* Linha: Bairro, Estado e Cidade */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium mb-2">Bairro</label>
      <input
        type="text"
        {...register("bairro", { required: "Bairro é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.bairro ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.bairro && (
        <p className="text-red-500 text-sm mt-1">{errors.bairro.message}</p>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Estado</label>
      <select
        {...register("estado_id", { required: "Estado é obrigatório" })}
        className={`w-full border p-2 rounded-lg ${
          errors.estado_id ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Selecione um estado</option>
        {estados.map((estado: any) => (
          <option key={estado.id} value={estado.id}>
            {estado.nome}
          </option>
        ))}
      </select>
      {errors.estado_id && (
        <p className="text-red-500 text-sm mt-1">{errors.estado_id.message}</p>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Cidade</label>
      <select
        {...register("cidade_id", { required: "Cidade é obrigatória" })}
        className={`w-full border p-2 rounded-lg ${
          errors.cidade_id ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Selecione uma cidade</option>
        {cidades.map((cidade: any) => (
          <option key={cidade.id} value={cidade.id}>
            {cidade.nome}
          </option>
        ))}
      </select>
      {errors.cidade_id && (
        <p className="text-red-500 text-sm mt-1">{errors.cidade_id.message}</p>
      )}
    </div>
  </div>

  {/* Campo de Logo */}
    <div>
        <label className="block text-sm font-medium mb-2">Logo</label>
        <div
          className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition"
          onClick={handleLogoClick} // Chama a função para abrir o seletor de arquivos
        >
          <p className="text-gray-500 text-sm mb-2">Clique para enviar uma imagem</p>
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="mt-2 border border-gray-300 rounded-lg w-[250px] h-[150px] object-cover"
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef} // Referência do input
          onChange={handleLogoChange} // Captura o evento de mudança
          className="hidden" // Oculta o input
        />
    </div>

  {/* Botão de envio */}
  {permissoesUsuario.podeEditar && (<Button type="submit" className="w-full md:w-100 px-6 py-2">
    Salvar Dados
  </Button>)}
</form>
  );
};

export default EmpresaForm;
