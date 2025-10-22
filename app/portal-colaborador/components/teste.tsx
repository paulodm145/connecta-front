'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalColaboradorAuth } from '@/app/store/authColabStore';

export default function Teste() {

  const router = useRouter();
  const { token, isExpired } = usePortalColaboradorAuth();

  useEffect(() => {
    if (!token || isExpired()) {
      router.push('/portal-colaborador/login');
    }
  }, [token, isExpired, router]);

  console.log("Render Teste");
  return <div className="p-4 rounded border">Teste visível</div>;
}
