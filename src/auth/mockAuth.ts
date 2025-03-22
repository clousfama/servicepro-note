import { User, IdTokenResult } from 'firebase/auth';

// Interface para usuário simulado
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  emailVerified: boolean;
}

// Converte um objeto MockUser para o tipo User do Firebase
export function convertToFirebaseUser(mockUser: MockUser): User {
  // Criamos um objeto que satisfaz a interface User do Firebase com cast para unknown primeiro
  const mockFirebaseUser = {
    uid: mockUser.uid,
    email: mockUser.email,
    displayName: mockUser.displayName,
    emailVerified: mockUser.emailVerified,
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerData: [],
    tenantId: null,
    metadata: {
      creationTime: new Date().toString(),
      lastSignInTime: new Date().toString()
    },
    delete: () => Promise.resolve(),
    getIdToken: () => Promise.resolve('mock-token'),
    getIdTokenResult: () => {
      const result: IdTokenResult = {
        token: 'mock-token',
        signInProvider: 'password',
        expirationTime: new Date(Date.now() + 3600000).toString(),
        issuedAtTime: new Date().toString(),
        authTime: new Date().toString(),
        claims: { admin: mockUser.isAdmin },
        signInSecondFactor: null
      };
      return Promise.resolve(result);
    },
    reload: () => Promise.resolve(),
    toJSON: () => ({ uid: mockUser.uid }),
    refreshToken: 'mock-refresh-token',
    providerId: 'password'
  };
  
  // Convertendo para unknown primeiro e depois para User para evitar erro de tipo
  return mockFirebaseUser as unknown as User;
}

// Usuários predefinidos para desenvolvimento
export const mockUsers = {
  admin: {
    uid: 'admin-mock-id',
    email: 'admin@example.com',
    password: '123ADMIN',
    displayName: 'Administrador',
    isAdmin: true,
    emailVerified: true
  },
  user: {
    uid: 'user-mock-id',
    email: 'user@example.com',
    password: 'USER',
    displayName: 'Usuário',
    isAdmin: false,
    emailVerified: true
  }
};

// Autenticação simulada para desenvolvimento
export async function mockSignIn(email: string, password: string): Promise<User> {
  // Simulação de latência de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Verificar admin
  if (email === mockUsers.admin.email && password === mockUsers.admin.password) {
    return convertToFirebaseUser(mockUsers.admin);
  }
  
  // Verificar usuário comum
  if (email === mockUsers.user.email && password === mockUsers.user.password) {
    return convertToFirebaseUser(mockUsers.user);
  }
  
  // Se nenhum usuário corresponder, lance um erro
  throw new Error('Email ou senha inválidos');
}

// Logout simulado
export async function mockSignOut(): Promise<void> {
  // Simulação de latência de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve();
}
