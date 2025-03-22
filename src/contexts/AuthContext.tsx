import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';
import { mockSignIn, mockSignOut } from '../auth/mockAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authReady: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Timeout para detecção de erros de configuração
const AUTH_TIMEOUT = 2000; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usingMockAuth, setUsingMockAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Efeito para lidar com o unmount do componente
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    let unsubscribe = () => {};
    let timeoutId: NodeJS.Timeout;
    
    try {
      // Configurar listener de auth state
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!isMounted) return;
        
        if (user) {
          console.log('Auth state changed: User logged in', user.email);
          setUser(user);
          setIsAdmin(user.email === 'admin@example.com');
          setLoading(false);
          setAuthReady(true);
        } else {
          console.log('Auth state changed: No user');
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          setAuthReady(true);
        }
      }, (error) => {
        console.error('Auth state observer error:', error);
        setLoading(false);
        setAuthReady(true);
      });

      // Configurar timeout para garantir resposta mesmo se o Firebase falhar
      timeoutId = setTimeout(() => {
        if (isMounted && loading) {
          console.log('Auth timeout reached, setting authReady');
          setLoading(false);
          setAuthReady(true);
        }
      }, AUTH_TIMEOUT);
    } catch (error) {
      console.error('Error setting up auth state observer:', error);
      if (isMounted) {
        setLoading(false);
        setAuthReady(true);
      }
    }

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (user) return;
    
    console.log('Attempting to sign in with:', email);
    setLoading(true);
    
    try {
      // Tentar autenticação usando mockAuth diretamente se as credenciais são conhecidas
      if ((email === 'admin@example.com' && password === '123ADMIN') || 
          (email === 'user@example.com' && password === 'USER')) {
        try {
          // Primeiro tenta autenticação real por um tempo limitado
          const authPromise = signInWithEmailAndPassword(auth, email, password);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('auth/timeout')), 2000);
          });
          
          const userCredential = await Promise.race([authPromise, timeoutPromise]) as any;
          if (userCredential?.user) {
            console.log('Firebase auth succeeded');
            setUser(userCredential.user);
            setIsAdmin(userCredential.user.email === 'admin@example.com');
            setUsingMockAuth(false);
            toast.success('Login realizado com sucesso!');
            return;
          }
        } catch (firebaseError: any) {
          console.log('Firebase auth failed, falling back to mock auth', firebaseError);
          // Falhou, usa autenticação simulada
          try {
            const mockUser = await mockSignIn(email, password);
            console.log('Mock auth succeeded');
            setUser(mockUser);
            setIsAdmin(email === 'admin@example.com');
            setUsingMockAuth(true);
            toast.success('Login realizado com sucesso (Modo simulado)');
            return;
          } catch (mockError) {
            console.error('Mock auth failed', mockError);
            toast.error('Erro ao fazer login. Verifique suas credenciais.');
          }
        }
      } else {
        // Para outras credenciais, tenta apenas firebase normal
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('Firebase auth succeeded for non-standard user');
          setUser(userCredential.user);
          setIsAdmin(userCredential.user.email === 'admin@example.com');
          setUsingMockAuth(false);
          toast.success('Login realizado com sucesso!');
        } catch (err: any) {
          console.error('Login error:', err);
          let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
          
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            errorMessage = 'Email ou senha incorretos.';
          } else if (err.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
          }
          
          toast.error(errorMessage);
          throw err;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting to log out, usingMockAuth:', usingMockAuth);
      
      if (usingMockAuth) {
        await mockSignOut();
      } else if (auth) {
        await signOut(auth);
      }
      
      setUser(null);
      setIsAdmin(false);
      setUsingMockAuth(false);
      toast.success('Logout realizado com sucesso!');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Erro ao fazer logout.');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    logout,
    authReady,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}