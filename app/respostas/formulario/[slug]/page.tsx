"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import InputMask from "react-input-mask";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@radix-ui/react-switch";
import { useFormulariosHook } from "@/app/hooks/useFormulariosHook";
import { usePesquisasHook } from "@/app/hooks/usePesquisasHook";
import { useRespostasHook } from "@/app/hooks/useRespostasHook";
import { toast } from "react-toastify";

// Tipos para o formulário e perguntas
type Formulario = {
  id: number;
  titulo: string;
  descricao: string;
  embed_youtube?: string;
  mostrar_embed_youtube?: boolean;
  ajuda?: string;
  mostrar_ajuda?: boolean;
  perguntas: Pergunta[];
};

type Pergunta = {
  id: number;
  pergunta_texto: string;
  tipo_pergunta: "TEXT" | "TEXT_MASKED" | "TEXTAREA" | "TOGGLE" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SELECT";
  obrigatoria: boolean;
  mascara?: string;
  opcoes: Opcao[];
  embed_youtube?: string;
  mostrar_embed_youtube?: boolean;
  ajuda?: string;
  mostrar_ajuda?: boolean;
};

type Pesquisa = {
  id: number;
  formulario_id: number;
  status: string;
  titulo:  string;
  slug:  string;
  observacao:  string;
  data_inicio:  string;
  data_fim:  string;
  autenticacao: boolean,
  usuario_id: number,
  tipo_pesquisa_id: number;
  created_at:  string;
  updated_at:  string;
  deleted_at:  string;
  formulario_slug: string;
  data_fim_formatada: string;
  data_inicio_formatada: string;
}

type Opcao = {
  id: number;
  texto_opcao: string;
};

export default function FormularioCompletoPage() {
  const [enviado, setEnviado] = useState(false);
  const [videoHtml, setVideoHtml] = useState<string | null>(null);
  const [textoAjuda, setTextoAjuda] = useState<string | null>(null);
  const [openDialogVideo, setOpenDialogVideo] = useState(false);
  const [openDialogAjuda, setOpenDialogAjuda] = useState(false);
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [pesquisa, setPesquisa] = useState<Pesquisa | null>(null);
  const [loading, setLoading] = useState(true);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const respondente = searchParams.get("t");
  const pesquisaSlug = searchParams.get("p");
  const identificador_empresa = searchParams.get("e");
  const tipoResposta = searchParams.get("tpo"); // novo parâmetro para tipo de resposta

  const { formularioExternoBySlug  } = useFormulariosHook();
  const { pesquisaexternaBySlug } = usePesquisasHook();
  const { responderExterno } = useRespostasHook();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!slug) return;

    const fetchFormulario = async () => {
      try {
        setLoading(true);
        const data = await formularioExternoBySlug(slug, respondente!, identificador_empresa!);
        const pesquisaData = await pesquisaexternaBySlug(pesquisaSlug!, respondente!, identificador_empresa!);
        console.log(pesquisaData);
        setPesquisa(pesquisaData);
        setFormulario(data);
      } catch (error) {
        console.error("Erro ao carregar o formulário:", error);
        setFormulario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFormulario();
  }, [slug]);

  const obterStatusPeriodo = (dadosPesquisa: Pesquisa | null) => {
    if (!dadosPesquisa?.data_inicio && !dadosPesquisa?.data_fim) {
      return { valido: true, mensagem: "" };
    }

    const agora = new Date();
    const converterData = (data: string) => {
      if (!data) return null;
      const dataIso = data.includes("T") ? data : data.replace(" ", "T");
      const convertida = new Date(dataIso);
      return Number.isNaN(convertida.getTime()) ? null : convertida;
    };

    const inicio = converterData(dadosPesquisa.data_inicio);
    const fim = converterData(dadosPesquisa.data_fim);

    if (inicio && agora < inicio) {
      return { valido: false, mensagem: "O período de respostas ainda não foi iniciado." };
    }

    if (fim && agora > fim) {
      return { valido: false, mensagem: "O período de respostas já foi encerrado." };
    }

    return { valido: true, mensagem: "" };
  };

  const onSubmit = async (data: any) => {
    console.log("Respostas brutas:", data);
    setErroEnvio(null);

    const statusPeriodo = obterStatusPeriodo(pesquisa);
    if (!statusPeriodo.valido) {
      toast.error(statusPeriodo.mensagem);
      return;
    }

    const tpoResposta = tipoResposta == '1' ? 'COLABORADOR' : 'LIDER';

    const payload = {
      pesquisa_id: pesquisa?.id,
      formulario_id: formulario?.id,
      tipo_envio: tpoResposta,
      respondente : respondente,
      envio_id: Math.random().toString(36).substr(2, 9),
      respostas: formulario?.perguntas.map((pergunta) => {
        const valor = data[pergunta.id.toString()];
        let resposta_texto: string | null = null;
        let opcoesSelecionadas: number[] = [];

        switch (pergunta.tipo_pergunta) {
          case "TEXT":
          case "TEXT_MASKED":
          case "TEXTAREA":
            resposta_texto = valor ? String(valor) : null;
            break;
          case "TOGGLE":
            resposta_texto = valor ? "Sim" : "Não";
            break;
          case "SINGLE_CHOICE":
          case "SELECT":
            const opcao = pergunta.opcoes.find((op) => op.texto_opcao === valor);
            if (opcao) opcoesSelecionadas = [opcao.id];
            resposta_texto = opcao ? opcao.texto_opcao : null;
            break;
          case "MULTIPLE_CHOICE":
            if (Array.isArray(valor)) {
              opcoesSelecionadas = valor
                .map((texto: string) => {
                  const op = pergunta.opcoes.find((o) => o.texto_opcao === texto);
                  return op ? op.id : null;
                })
                .filter((x) => x !== null) as number[];
              resposta_texto = opcoesSelecionadas.map((opId) => {
                const op = pergunta.opcoes.find((o) => o.id === opId);
                return op ? op.texto_opcao : null;
              }).join(", ");
            }
            break;
        }

        return {
          pergunta_id: pergunta.id,
          tipo_pergunta: pergunta.tipo_pergunta,
          resposta_texto,
          opcoes: opcoesSelecionadas,
          tipo_resposta: tpoResposta,
        };
      }),
    };

    console.log("Payload final:", payload);
    const { data: response, error } = await responderExterno(payload, respondente!, identificador_empresa!);
   
    if (error) {
      setErroEnvio(error);
      toast.error(error);
      return;
    }

    if (response) {
      toast.success("Respostas enviadas com sucesso!");
      setEnviado(true);
    }


    
  };

  const handleOpenVideo = (html: string) => {
    setVideoHtml(html);
    setOpenDialogVideo(true);
  };

  const handleOpenAjuda = (texto: string) => {
    setTextoAjuda(texto);
    setOpenDialogAjuda(true);
  };

  if (loading) return <p className="text-center text-gray-700 mt-10">Carregando formulário...</p>;
  if (!formulario) return <p className="text-center text-red-500 mt-10">Erro ao carregar formulário.</p>;

  const statusPeriodo = obterStatusPeriodo(pesquisa);

  return (
    <>
      {/* Modal para Vídeo do YouTube */}
      <Dialog open={openDialogVideo} onOpenChange={setOpenDialogVideo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vídeo de Ajuda</DialogTitle>
            <DialogDescription>Aperte play para assistir.</DialogDescription>
          </DialogHeader>
          {videoHtml && <div className="mt-4 w-full" dangerouslySetInnerHTML={{ __html: videoHtml }} />}
          <DialogFooter>
            <Button onClick={() => setOpenDialogVideo(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Texto de Ajuda */}
      <Dialog open={openDialogAjuda} onOpenChange={setOpenDialogAjuda}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Texto de Ajuda</DialogTitle>
          </DialogHeader>
          {textoAjuda && <p className="mt-4 text-gray-700">{textoAjuda}</p>}
          <DialogFooter>
            <Button onClick={() => setOpenDialogAjuda(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pesquisa</p>
                <h1 className="text-2xl font-bold text-slate-900">
                  {pesquisa?.titulo || "Título não disponível"}
                </h1>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {tipoResposta === "1" ? "Formulário para Colaboradores" : "Formulário para Líderes"}
              </span>
            </div>
            {pesquisa?.observacao && (
              <p className="mt-3 text-sm text-slate-600">{pesquisa.observacao}</p>
            )}
          </header>

          {enviado ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-700">Obrigado por sua resposta!</h2>
              <p className="mt-2 text-sm text-emerald-700">Seus dados foram enviados com sucesso.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
              {statusPeriodo.mensagem && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {statusPeriodo.mensagem}
                </div>
              )}

              {erroEnvio && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <p className="font-semibold">Não foi possível enviar sua resposta.</p>
                  <p className="mt-1">{erroEnvio}</p>
                  {erroEnvio.toLowerCase().includes("uma resposta") && (
                    <p className="mt-2 text-xs text-rose-600">
                      Se você acredita que isso é um engano, entre em contato com o RH ou com o responsável pela pesquisa.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Formulário</h2>
                  <p className="text-sm text-slate-500">Preencha as perguntas abaixo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formulario.mostrar_embed_youtube && formulario.embed_youtube && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenVideo(formulario.embed_youtube!)}
                    >
                      ▶ Assistir Vídeo do Formulário
                    </Button>
                  )}
                  {formulario.mostrar_ajuda && formulario.ajuda && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAjuda(formulario.ajuda!)}
                    >
                      ℹ️ Ajuda do Formulário
                    </Button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                {formulario.perguntas.map((pergunta) => (
                  <div
                    key={pergunta.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <label className="text-sm font-semibold text-slate-900">
                        {pergunta.pergunta_texto}{" "}
                        {pergunta.obrigatoria && <span className="text-red-600">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {pergunta.mostrar_embed_youtube && pergunta.embed_youtube && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenVideo(pergunta.embed_youtube!)}
                          >
                            ▶ Ver Vídeo da Pergunta
                          </Button>
                        )}
                        {pergunta.mostrar_ajuda && pergunta.ajuda && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAjuda(pergunta.ajuda!)}
                          >
                            ℹ️ Ajuda da Pergunta
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      {renderizarPerguntaHookForm(pergunta, register, control, errors)}
                      {errors[pergunta.id.toString()] && (
                        <p className="mt-2 text-sm text-red-500">Campo obrigatório.</p>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-500"
                  disabled={!statusPeriodo.valido}
                >
                  Enviar
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function renderizarPerguntaHookForm(
  pergunta: Pergunta,
  register: any,
  control: any,
  errors: any
) {
  const fieldName = pergunta.id.toString();
  const isRequired = pergunta.obrigatoria;

  switch (pergunta.tipo_pergunta) {
    case "TEXT":
      return (
        <input
          type="text"
          {...register(fieldName, { required: isRequired })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      );
    case "TEXT_MASKED":
      return (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: isRequired }}
          render={({ field }) => (
            <InputMask
              mask={pergunta.mascara || "(99) 99999-9999"}
              {...field}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          )}
        />
      );
    case "TEXTAREA":
      return (
        <textarea
          {...register(fieldName, { required: isRequired })}
          className="min-h-[120px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      );
    case "TOGGLE":
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                field.value ? "bg-teal-500" : "bg-gray-300"
              }`}
            >
              <span className="sr-only">Toggle</span>
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                  field.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </Switch>
          )}
        />
      );
    case "SINGLE_CHOICE":
      return (
        <div className="space-y-2">
          {pergunta.opcoes.map((op) => (
            <label key={op.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                {...register(fieldName, { required: isRequired })}
                value={op.texto_opcao}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              {op.texto_opcao}
            </label>
          ))}
        </div>
      );
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-2">
          {pergunta.opcoes.map((op) => (
            <label key={op.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                {...register(fieldName, { required: isRequired })}
                value={op.texto_opcao}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {op.texto_opcao}
            </label>
          ))}
        </div>
      );
    case "SELECT":
      return (
        <select
          {...register(fieldName, { required: isRequired })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Selecione uma opção</option>
          {pergunta.opcoes.map((op) => (
            <option key={op.id} value={op.texto_opcao}>
              {op.texto_opcao}
            </option>
          ))}
        </select>
      );
    default:
      return null;
  }
}
