"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const router = useRouter();
  const [showPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogin = async () => {
    setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      showAlert('Por favor, preencha todos os campos.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        showAlert('Credenciais inválidas.', 'error');
      } else {
        showAlert('Login realizado com sucesso!', 'success');
        setTimeout(() => {
          router.push('/home'); // Redireciona para a home após login bem-sucedido
        }, 1000);
      }
    } catch {
      showAlert('Erro ao fazer login. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className='flex-1 h-[calc(100vh-4rem)]'>
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Bem vindo(a) de volta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alert.show && (
              <Alert className={alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-2"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Button
                onClick={() => router.push('/register')}
                variant="link"
                disabled={isLoading}
              >
                Criar conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;