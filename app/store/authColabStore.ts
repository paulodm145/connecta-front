import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColabUser = {
  id: number;
  nome: string;
  email: string;
};

export type AuthPayload = {
  access_token: string;
  token_type: 'Bearer';
  expires_at: string; // ISO
  user: ColabUser;
};

type PortalAuthState = {
  token: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  user: ColabUser | null;
  cnpj: string | null;

  setAuth: (data: AuthPayload, cnpj?: string) => void;
  clearAuth: () => void;
  isExpired: () => boolean;
};

export const usePortalColaboradorAuth = create<PortalAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tokenType: null,
      expiresAt: null,
      user: null,
      cnpj: null,

      setAuth: (data, cnpj) =>
        set({
          token: data.access_token,
          tokenType: data.token_type,
          expiresAt: data.expires_at,
          user: data.user,
          cnpj: cnpj ?? get().cnpj,
        }),

      clearAuth: () => set({ token: null, tokenType: null, expiresAt: null, user: null, cnpj: null }),

      isExpired: () => {
        const exp = get().expiresAt;
        if (!exp) return true;
        // margem de segurança de 60s
        return new Date(exp).getTime() - Date.now() <= 60_000;
      },
    }),
    {
      name: 'portal-colab-auth', // chave no localStorage
      partialize: (s) => ({
        token: s.token,
        tokenType: s.tokenType,
        expiresAt: s.expiresAt,
        user: s.user,
        cnpj: s.cnpj,
      }),
    }
  )
);