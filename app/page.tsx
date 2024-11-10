"use client"; // Adicione isso no início do arquivo

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
const LoginPage = () => {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/admin');
    console.log('Login submetido');
  };

  const numberBackground = Math.floor(Math.random() * 6) + 1;

  return (
    <div className="flex h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-left"
        style={{
          backgroundImage: `url('/images/bg-${numberBackground}.jpg')`,
          filter: 'brightness(1.1) contrast(1.05) opacity(0.5)',
        }}
      />
      <div className="w-full flex justify-star items-center z-10">
        <div className="w-full max-w-md ml-16 p-8 backdrop-blur-xl bg-white/30 rounded-xl shadow-2xl border border-white/50">
          {/* <h1 className="text-4xl font-bold text-gray-800 text-center mb-2">Login</h1> */}
          <img src={`/images/logo.png`} alt="Logo" className="w-200 h-20 mx-auto mb-4" />
          <p className="text-gray-600 text-center mb-8">Entre com suas credenciais</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input id="email" placeholder="carole.carroll@gmail.com" type="email" required 
                     className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500" />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Senha</Label>
              <Input id="password" placeholder="••••••••" type="password" required 
                     className="mt-1 bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Checkbox id="remember" className="text-red-500 border-gray-400" />
                <label htmlFor="remember" className="ml-2 text-gray-700">Lembrar-me</label>
              </div>
              <Button variant="link" className="text-blue-600 hover:text-blue-800">
                Esqueci minha senha
              </Button>
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300" type="submit">
              Entrar
            </Button>
            <Button variant="outline" className="w-full border-gray-400 text-gray-700 hover:bg-white/50 transition-colors duration-300" type="button">
              Cancelar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
