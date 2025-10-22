'use client'

import React from "react";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalColaboradorAuth } from '@/app/store/authColabStore';
import { Button } from '@/components/ui/button';

import { Header } from "../components/header";
import { DashboardStats } from "../components/dashboard-stats";
import { DataGridPlaceholder } from "../components/data-grid-placeholder";
import { Footer } from "../components/footer";


export default function DashboardPage() {
    const router = useRouter();
    const { token, isExpired , clearAuth} = usePortalColaboradorAuth();

    useEffect(() => {
      if (!token || isExpired()) {
        router.push('/portal-colaborador/login');
      }
    }, [token, isExpired, router]);

    const handleLogout = () => {
        clearAuth();                // limpa Zustand + localStorage
        router.replace('/portal-colaborador/login'); // redireciona pro login
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Painel do Colaborador</h1>
            <DashboardStats />
            <DataGridPlaceholder />
            </div>
        </main>
        <Footer />
        </div>
    );
}