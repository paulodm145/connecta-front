"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Phone, CreditCard, Mail, FileText, Briefcase } from "lucide-react";
import { useLoginColaboradorHook } from "@/app/hooks/useLoginColaborador";
import { usePortalColaboradorAuth } from "@/app/store/authColabStore";

import InputMask from "react-input-mask";
import { maskBRPhone, maskCPFOrCNPJ, cleanInput } from "@/app/utils/Helpers";
import { toast } from "react-toastify";
import { setUserData } from "@/app/utils/UserData";

interface EditUserFormData {
  nome: string;
  telefone: string;
  cpf: string;
  email: string;
}
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({ isOpen, onClose }: EditUserModalProps) {
  const { usuarioLogado, editarUsuario } = useLoginColaboradorHook();
  const { user: userStore } = usePortalColaboradorAuth();

  const [loadingUser, setLoadingUser] = useState(false);
  const [dadosSistema, setDadosSistema] = useState<any>({});

  // máscara dinâmica para telefone: 10 dígitos (fixo) ou 11 dígitos (celular)
  const [phoneMask, setPhoneMask] = useState<string>("(99) 9999-9999");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    getValues,
  } = useForm<EditUserFormData>({
    defaultValues: { nome: "", telefone: "", cpf: "", email: "" },
  });

  // Carrega dados do usuário quando o modal abre
  const dadosUsuario = async () => {
    if (!isOpen) return;
    setLoadingUser(true);
    try {
      const userData = await usuarioLogado();

      if (userData) {
        const telMasked = userData.telefone ? maskBRPhone(userData.telefone) : "";
        const cpfMasked = userData.cpf ? maskCPFOrCNPJ(userData.cpf) : "";

        reset({
          nome: userData.nome || "",
          telefone: telMasked,
          cpf: cpfMasked,
          email: userData.email || "",
        });

        // ajusta máscara do telefone conforme a quantidade de dígitos
        const telDigits = cleanInput(telMasked);
        setPhoneMask(telDigits.length > 10 ? "(99) 99999-9999" : "(99) 9999-9999");

        setDadosSistema({
          descricao_cargo: userData?.descricao_cargo || "",
          registro_funcional: userData?.registro_funcional || "",
        });
      } else {
        const telMasked = userStore?.phone ? maskBRPhone(userStore.phone) : "";
        const cpfMasked = userStore?.cpf ? maskCPFOrCNPJ(userStore.cpf) : "";

        reset({
          nome: userStore?.nome || "",
          telefone: telMasked,
          cpf: cpfMasked,
          email: userStore?.email || "",
        });

        const telDigits = cleanInput(telMasked);
        setPhoneMask(telDigits.length > 10 ? "(99) 99999-9999" : "(99) 9999-9999");

        setDadosSistema({
          descricao_cargo: userStore?.descricao_cargo || "",
          registro_funcional: userStore?.registro_funcional || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      dadosUsuario();
    }
  }, [isOpen]); // só roda quando o modal abre

  const handleClose = () => {
    onClose();
  };

  const onSubmit = async (data: EditUserFormData) => {
    const dadosAtualizados = {
      nome: data.nome,
      telefone: cleanInput(data.telefone),
      cpf: cleanInput(data.cpf),
      email: data.email,
      ...dadosSistema,
    };

    const usuarioAtualizado = await editarUsuario(dadosAtualizados);

    if (usuarioAtualizado) {
      toast.success("Dados do usuário atualizados com sucesso.");
      setUserData(usuarioAtualizado); // atualiza estado global, se necessário
      console.log("Dados do usuário atualizados:", usuarioAtualizado);
    } else {
      console.error("Falha ao atualizar os dados do usuário.");
    }

    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // importante: só fechar quando open === false
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-white border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-teal-600" />
            Editar Dados do Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                Nome
              </Label>
              <Input
                id="nome"
                type="text"
                {...register("nome", {
                  required: "Nome é obrigatório",
                  minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" },
                })}
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Telefone com máscara dinâmica */}
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-600" />
                Telefone
              </Label>

              <Controller
                name="telefone"
                control={control}
                rules={{
                  required: "Telefone é obrigatório",
                  validate: (v) => cleanInput(v || "").length >= 10 || "Telefone inválido",
                }}
                render={({ field }) => (
                  <InputMask
                    mask={phoneMask}
                    maskChar={null}
                    value={field.value || ""}
                    onChange={(e) => {
                      const raw = cleanInput(e.target.value || "");
                      // troca de máscara quando digitar o 11º dígito
                      setPhoneMask(raw.length > 10 ? "(99) 99999-9999" : "(99) 9999-9999");
                      field.onChange(e);
                    }}
                    onBlur={field.onBlur}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="telefone"
                        type="tel"
                        inputMode="tel"
                        className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    )}
                  </InputMask>
                )}
              />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* CPF com máscara */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-teal-600" />
                CPF
              </Label>

              <Controller
                name="cpf"
                control={control}
                rules={{
                  required: "CPF é obrigatório",
                  validate: (v) => cleanInput(v || "").length === 11 || "CPF deve ter 11 dígitos",
                }}
                render={({ field }) => (
                  <InputMask
                    mask="999.999.999-99"
                    maskChar={null}
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="cpf"
                        type="text"
                        inputMode="numeric"
                        className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      />
                    )}
                  </InputMask>
                )}
              />
              {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-600" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                {...register("email", {
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* Informações do Sistema (somente leitura) */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Informações do Sistema</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <Label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Registro Funcional
                </Label>
                <div className="text-sm text-gray-800 font-medium">{dadosSistema.registro_funcional}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <Label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  Cargo
                </Label>
                <div className="text-sm text-gray-800 font-medium">{dadosSistema.descricao_cargo}</div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg" disabled={loadingUser}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
