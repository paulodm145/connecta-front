import { useUserStore } from '@/app/store/userStore'; 
import { useMemo } from 'react';

export function useInformacoesUsuarioHook() {
  const { user, setUser, clearUser, updateEmpresa } = useUserStore();

  const empresa = useMemo(() => user?.informacoes_usuario?.empresa ?? null, [user]);
  const nomeUsuario = useMemo(() => user?.name ?? '', [user]);
  const emailUsuario = useMemo(() => user?.email ?? '', [user]);
  const permissoes = useMemo(() => user?.permissoes ?? [], [user]);
  const isSuperAdmin = useMemo(() => user?.super_administrador ?? false, [user]);
  const nivelId = useMemo(() => user?.informacoes_usuario?.nivel_id ?? null, [user]);
  const identificadorEmpresa = useMemo(() => user?.informacoes_usuario?.identificador_empresa ?? '', [user]);

  console.log('Usuario', user)

   const temPermissao = (chave: string): boolean => {
    if (isSuperAdmin) return true;
    return permissoes.includes(chave);
  };

  return {
    user,
    setUser,
    clearUser,
    updateEmpresa,
    empresa,
    nomeUsuario,
    emailUsuario,
    permissoes,
    isSuperAdmin,
    nivelId,
    identificadorEmpresa,
    temPermissao,
  };
}
