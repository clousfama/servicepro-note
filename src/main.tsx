import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { setupInitialUsers } from './lib/firebase';

// Configura os usuários iniciais (admin e user) se eles ainda não existirem
setupInitialUsers()
  .then(() => console.log('Usuários iniciais configurados com sucesso'))
  .catch(error => console.error('Erro ao configurar usuários iniciais:', error));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);