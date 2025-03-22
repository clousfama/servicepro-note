import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginForm() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset submitting state when loading state changes
  useEffect(() => {
    if (!loading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [loading]);

  // Função para preencher automaticamente as credenciais de usuário
  const fillUserCredentials = () => {
    setEmail('user@example.com');
    setPassword('USER');
    // Login automático após preencher
    handleLogin('user@example.com', 'USER');
  };

  // Função para preencher automaticamente as credenciais de admin
  const fillAdminCredentials = () => {
    setEmail('admin@example.com');
    setPassword('123ADMIN');
    // Login automático após preencher
    handleLogin('admin@example.com', '123ADMIN');
  };

  // Função centralizada para lidar com login
  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    if (isSubmitting) return;
    
    if (!loginEmail || !loginPassword) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      console.error('Erro no login:', error);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  // Determina se o botão deve estar desabilitado
  const isButtonDisabled = loading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 fixed-layout">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg no-flicker">
        <div className="text-center">
          <div className="flex justify-center">
            <PenTool className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">ServiceNote-Pro</h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isButtonDisabled}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isButtonDisabled}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={isButtonDisabled}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                type="button"
                onClick={fillUserCredentials}
                disabled={isButtonDisabled}
                className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 disabled:opacity-50"
              >
                {isSubmitting && email === 'user@example.com' ? 'Acessando...' : 'Acessar como Usuário'}
              </button>
              <button
                type="button"
                onClick={fillAdminCredentials}
                disabled={isButtonDisabled}
                className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 disabled:opacity-50"
              >
                {isSubmitting && email === 'admin@example.com' ? 'Acessando...' : 'Acessar como Admin'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
