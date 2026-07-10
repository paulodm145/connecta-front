"use client";

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';

interface ProtecaoPermissaoProps {
  // O acesso é liberado se o usuário tiver ao menos uma das chaves informadas
  chaves: string[];
  children: React.ReactNode;
}

const ProtecaoPermissao: React.FC<ProtecaoPermissaoProps> = ({ chaves, children }) => {
  const { user, temPermissao } = useInformacoesUsuarioHook();

  // Aguarda o carregamento do usuário (GET /me) antes de decidir
  if (!user) return null;

  if (!temPermissao(...chaves)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Acesso negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta tela. Entre em contato com o
            administrador da sua empresa caso precise deste acesso.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtecaoPermissao;
