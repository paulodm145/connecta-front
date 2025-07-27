import { create } from 'zustand';

interface Empresa {
  id: number;
  nome: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade_id: number;
  estado_id: number;
  logo: string | null;
  site: string | null;
  identificador: string;
  status: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  informacoes_usuario: {
    id: number;
    user_id: number;
    identificador_empresa: string;
    status: boolean;
    empresa: Empresa;
    nivel_id: number;
  },
  permissoes : string[],
  super_administrador: boolean;
}

interface UserStore {
  user: UserData | null;
  setUser: (user: UserData) => void;
  clearUser: () => void;
  updateEmpresa: (empresa: Empresa) => void; // Adicionada a função updateEmpresa
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  updateEmpresa: (empresa) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            informacoes_usuario: {
              ...state.user.informacoes_usuario,
              empresa,
            },
          }
        : state.user, // Não atualiza se o usuário for nulo
    })),
}));
