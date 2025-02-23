import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { ehSenhaDificil } from "@/app/utils/Helpers";

interface TrocaSenhaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (novaSenha: string) => void;
}

export default function TrocaSenhaModal({ open, onClose, onSubmit }: TrocaSenhaModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!open) return null; // 🔥 O modal só existe se estiver aberto

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const senha = (event.currentTarget.senha as HTMLInputElement).value;
    const confirmarSenha = (event.currentTarget.confirmarSenha as HTMLInputElement).value;

    if (!ehSenhaDificil(senha)) {
      alert("Senha fraca!");
      return;
    }
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    onSubmit(senha);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar Senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} name="senha" placeholder="Nova Senha" />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Input type={showConfirmPassword ? "text" : "password"} name="confirmarSenha" placeholder="Confirmar Senha" />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
