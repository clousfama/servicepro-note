import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Variável de ambiente obrigatória não encontrada: ${envVar}`);
    throw new Error(`Variável de ambiente obrigatória não encontrada: ${envVar}`);
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
  throw error;
}

// Inicializa o Auth
const auth = getAuth(app);

// Configura persistência
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('Persistência de autenticação configurada com sucesso'))
  .catch((error) => console.error('Erro ao configurar persistência de autenticação:', error));

// Inicializa o Firestore
const db = getFirestore(app);

// Habilita persistência offline para o Firestore apenas se não estiver em modo de desenvolvimento
// com múltiplas abas abertas (causa problemas em ambiente de desenvolvimento)
if (import.meta.env.MODE !== 'development' || document.visibilityState === 'visible') {
  enableIndexedDbPersistence(db)
    .then(() => console.log('Persistência offline do Firestore habilitada com sucesso'))
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Múltiplas abas abertas, persistência offline disponível em apenas uma aba');
      } else if (err.code === 'unimplemented') {
        console.warn('Navegador não suporta persistência offline');
      } else {
        console.error('Erro ao habilitar persistência offline:', err);
      }
    });
}

// Conectar ao emulador local se estiver em ambiente de desenvolvimento
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Conectado ao emulador local do Firestore');
  } catch (error) {
    console.error('Erro ao conectar ao emulador do Firestore:', error);
  }
}

// Inicializa o Storage
const storage = getStorage(app);

// Função para criar usuários (usada apenas uma vez para configuração inicial)
export const setupInitialUsers = async () => {
  try {
    // Criar usuário admin
    await createUserWithEmailAndPassword(auth, 'admin@example.com', '123ADMIN');
    console.log('Usuário admin criado com sucesso');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Usuário admin já existe');
    } else {
      console.error('Erro ao criar usuário admin:', error);
    }
  }

  try {
    // Criar usuário comum
    await createUserWithEmailAndPassword(auth, 'user@example.com', 'USER');
    console.log('Usuário comum criado com sucesso');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Usuário comum já existe');
    } else {
      console.error('Erro ao criar usuário comum:', error);
    }
  }
};

export { app, auth, db, storage };