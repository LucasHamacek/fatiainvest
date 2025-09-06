"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    setIsLoading(true);

    // Validações
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      showAlert('Please fill in all fields.', 'error');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      showAlert('Please enter a valid email.', 'error');
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      showAlert('Passwords do not match.', 'error');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(registerData.password)) {
      showAlert('Password must be at least 8 characters long, including uppercase, lowercase, and number.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Simulação de chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Aqui você faria a chamada real para sua API
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password
        })
      });

      if (response.ok) {
        const data = await response.json();

        showAlert('Account created successfully!', 'success');

        // Clear form
        setRegisterData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);

      } else {
        const errorData = await response.json();
        showAlert(errorData.message || 'Error creating account.', 'error');
      }

    } catch (error) {
      showAlert('Error creating account. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="font-[inter] flex-1 h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md shadow-none border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Junte-se ao Fatia Invest</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
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
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  8+ caracteres, maiúscula, minúscula e número
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button onClick={handleRegister} className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Button
                variant={"link"}
                onClick={() => router.push('/login')}
                disabled={isLoading}
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;