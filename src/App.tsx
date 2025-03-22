import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NewServiceForm } from './components/NewServiceForm';
import { LoginForm } from './components/LoginForm';
import { ServicesList } from './components/ServicesList';
import { db } from './lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Service } from './types/database';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import toast from 'react-hot-toast';

function App() {
  const { user, authReady, isAdmin } = useAuth();
  const [view, setView] = useState<'dashboard' | 'calendar' | 'stats' | 'search' | 'new'>('dashboard');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showServicesListModal, setShowServicesListModal] = useState(false);
  const [currentServiceStatus, setCurrentServiceStatus] = useState<Service['status'] | undefined>(undefined);
  const [currentBudgetStatus, setCurrentBudgetStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined);
  const [stats, setStats] = useState({
    activeServices: 0,
    completedToday: 0,
    pendingServices: 0,
    pendingBudgetServices: 0,
    approvedBudgetServices: 0,
    rejectedBudgetServices: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Service[]>([]);

  // Função para carregar estatísticas simuladas do localStorage
  const loadSimulatedStats = () => {
    try {
      const simulatedServicesJson = localStorage.getItem('simulatedServices');
      if (!simulatedServicesJson) return null;
      
      const allSimulatedServices = JSON.parse(simulatedServicesJson);
      
      // Não filtrar por userId para o admin, pois queremos que veja todos os serviços
      const userServices = isAdmin 
        ? allSimulatedServices 
        : allSimulatedServices.filter((service: Service) => service.user_id === user?.uid);
      
      if (!userServices.length) return null;
      
      // Calcular estatísticas a partir dos dados simulados
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeServices = userServices.filter(
        (service: Service) => service.status === 'active'
      ).length;
      
      const completedToday = userServices.filter((service: Service) => {
        const updatedDate = new Date(service.updated_at);
        return service.status === 'completed' && updatedDate >= today;
      }).length;
      
      const pendingServices = userServices.filter(
        (service: Service) => service.status === 'pending'
      ).length;
      
      const pendingBudgetServices = userServices.filter(
        (service: Service) => service.budget_status === 'pending'
      ).length;
      
      const approvedBudgetServices = userServices.filter(
        (service: Service) => service.budget_status === 'approved'
      ).length;
      
      const rejectedBudgetServices = userServices.filter(
        (service: Service) => service.budget_status === 'rejected'
      ).length;
      
      return {
        activeServices,
        completedToday,
        pendingServices,
        pendingBudgetServices,
        approvedBudgetServices,
        rejectedBudgetServices
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas simuladas:', error);
      return null;
    }
  };

  // Gerar dados fixos para demonstração se não houver dados salvos
  const generateDemoStats = () => {
    if (!user) return null;
    
    // Valores zerados para começar com dados limpos
    return {
      activeServices: 0,
      completedToday: 0,
      pendingServices: 0,
      pendingBudgetServices: 0,
      approvedBudgetServices: 0,
      rejectedBudgetServices: 0
    };
  };

  // Usa useCallback para evitar re-renderizações desnecessárias
  const loadDashboardStats = useCallback(async () => {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Queries por status do serviço
      const activeQuery = query(
        collection(db, 'services'),
        where('status', '==', 'active')
      );
      const completedQuery = query(
        collection(db, 'services'),
        where('status', '==', 'completed'),
        where('updated_at', '>=', Timestamp.fromDate(today))
      );
      const pendingQuery = query(
        collection(db, 'services'),
        where('status', '==', 'pending')
      );

      // Queries por status do orçamento
      const pendingBudgetQuery = query(
        collection(db, 'services'),
        where('budget_status', '==', 'pending')
      );
      const approvedBudgetQuery = query(
        collection(db, 'services'),
        where('budget_status', '==', 'approved')
      );
      const rejectedBudgetQuery = query(
        collection(db, 'services'),
        where('budget_status', '==', 'rejected')
      );

      try {
        // Tentar buscar do Firebase primeiro
        const [
          activeSnapshot, 
          completedSnapshot, 
          pendingSnapshot,
          pendingBudgetSnapshot,
          approvedBudgetSnapshot,
          rejectedBudgetSnapshot
        ] = await Promise.all([
          getDocs(activeQuery),
          getDocs(completedQuery),
          getDocs(pendingQuery),
          getDocs(pendingBudgetQuery),
          getDocs(approvedBudgetQuery),
          getDocs(rejectedBudgetQuery)
        ]);

        setStats({
          activeServices: activeSnapshot.size,
          completedToday: completedSnapshot.size,
          pendingServices: pendingSnapshot.size,
          pendingBudgetServices: pendingBudgetSnapshot.size,
          approvedBudgetServices: approvedBudgetSnapshot.size,
          rejectedBudgetServices: rejectedBudgetSnapshot.size
        });

        console.log('Dashboard stats loaded from Firestore:', {
          activeServices: activeSnapshot.size,
          completedToday: completedSnapshot.size,
          pendingServices: pendingSnapshot.size,
          pendingBudgetServices: pendingBudgetSnapshot.size,
          approvedBudgetServices: approvedBudgetSnapshot.size,
          rejectedBudgetServices: rejectedBudgetSnapshot.size
        });
      } catch (error) {
        console.warn('Erro ao buscar estatísticas do Firestore, usando dados simulados', error);
        
        // Se falhar ao tentar buscar do Firestore, carregar dados simulados
        let simulatedStats = loadSimulatedStats();
        
        // Se não houver dados simulados, gerar dados de demonstração fixos
        if (!simulatedStats) {
          simulatedStats = generateDemoStats();
        }
        
        if (simulatedStats) {
          setStats(simulatedStats);
          console.log('Dashboard stats loaded from simulation:', simulatedStats);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      
      // Tentar usar o fallback de simulação mesmo em caso de erro geral
      try {
        let simulatedStats = loadSimulatedStats();
        if (!simulatedStats) {
          simulatedStats = generateDemoStats();
        }
        
        if (simulatedStats) {
          setStats(simulatedStats);
          console.log('Dashboard stats loaded from fallback:', simulatedStats);
        }
      } catch (fallbackError) {
        console.error('Erro crítico ao carregar estatísticas:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  // Apenas recarregar dados quando o usuário mudar ou quando authReady mudar
  useEffect(() => {
    if (authReady && user) {
      loadDashboardStats();
    }
  }, [authReady, user, loadDashboardStats]);

  // Limpar o localStorage ao iniciar o aplicativo
  useEffect(() => {
    localStorage.removeItem('simulatedServices');
    localStorage.removeItem('serviceStats');
    console.log('localStorage limpo para iniciar com dados zerados');
  }, []);

  // Implementação da função para mostrar a lista de serviços por status
  const handleShowServicesList = (status: Service['status']) => {
    // Verificar se o usuário tem permissão (apenas admin pode acessar as listas)
    if (!isAdmin) {
      toast.error('Acesso permitido apenas para administradores.');
      return;
    }
    
    console.log('Show services list for status:', status);
    setCurrentServiceStatus(status);
    setCurrentBudgetStatus(undefined);
    setShowServicesListModal(true);
  };

  // Implementação da função para mostrar a lista de serviços por status de orçamento
  const handleShowBudgetServicesList = (budgetStatus: 'pending' | 'approved' | 'rejected') => {
    // Verificar se o usuário tem permissão (apenas admin pode acessar as listas)
    if (!isAdmin) {
      toast.error('Acesso permitido apenas para administradores.');
      return;
    }
    
    console.log('Show services list for budget status:', budgetStatus);
    setCurrentServiceStatus(undefined);
    setCurrentBudgetStatus(budgetStatus);
    setShowServicesListModal(true);
  };

  // Função para atualizar as estatísticas a partir do localStorage quando mudanças são feitas
  const handleUpdateStats = () => {
    console.log('Atualizando estatísticas...');
    loadDashboardStats();
  };

  // Função para fechar o modal de serviços
  const handleCloseServicesList = () => {
    setShowServicesListModal(false);
    setCurrentServiceStatus(undefined);
    setCurrentBudgetStatus(undefined);
    // Recarregar estatísticas ao fechar o modal
    loadDashboardStats();
  };

  // Função para realizar a busca avançada
  const handleAdvancedSearch = (clientName: string, serviceType: string, status: string) => {
    try {
      // Buscar os serviços no localStorage
      const simulatedServicesJson = localStorage.getItem('simulatedServices');
      if (!simulatedServicesJson) {
        setSearchResults([]);
        return;
      }
      
      const allServices: Service[] = JSON.parse(simulatedServicesJson);
      
      // Filtrar os resultados com base nos critérios fornecidos
      let filteredServices = allServices;
      
      if (clientName.trim()) {
        filteredServices = filteredServices.filter(
          service => service.client_name.toLowerCase().includes(clientName.toLowerCase())
        );
      }
      
      if (serviceType) {
        filteredServices = filteredServices.filter(
          service => service.service_type === serviceType
        );
      }
      
      if (status) {
        filteredServices = filteredServices.filter(
          service => service.status === status
        );
      }
      
      console.log('Resultados da busca:', filteredServices);
      setSearchResults(filteredServices);
      
    } catch (error) {
      console.error('Erro ao realizar busca avançada:', error);
      toast.error('Erro ao realizar a busca. Tente novamente.');
      setSearchResults([]);
    }
  };

  // Tela de loading estática
  if (!authReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 fixed-layout" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="bg-white p-8 rounded-lg shadow-md w-96 h-48 flex flex-col items-center justify-center no-flicker">
          <h2 className="text-2xl font-semibold mb-4">Carregando...</h2>
          <p className="text-gray-600">Por favor, aguarde enquanto preparamos tudo.</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, mostrar o formulário de login
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 fixed-layout" style={{ overflow: 'hidden' }}>
      <Header
        onShowDashboard={() => setView('dashboard')}
        onShowCalendar={() => setView('calendar')}
        onShowStats={() => setView('stats')}
        onShowSearch={() => setView('search')}
        onNewService={() => setShowNewServiceModal(true)}
        isAdmin={isAdmin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 stable-height no-flicker" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {view === 'dashboard' && (
          <Dashboard
            activeServices={stats.activeServices}
            completedToday={stats.completedToday}
            pendingServices={stats.pendingServices}
            pendingBudgetServices={stats.pendingBudgetServices}
            approvedBudgetServices={stats.approvedBudgetServices}
            rejectedBudgetServices={stats.rejectedBudgetServices}
            onShowServicesList={handleShowServicesList}
            onShowBudgetServicesList={handleShowBudgetServicesList}
            isAdmin={isAdmin}
          />
        )}
        {view === 'calendar' && (
          <div className="bg-white p-6 rounded-lg shadow h-full fixed-layout">
            <h2 className="text-2xl font-bold mb-4">Calendário de Entregas</h2>
            {!isAdmin && (
              <p className="text-red-500 font-medium mb-4">Esta funcionalidade está disponível apenas para administradores.</p>
            )}
            <div id="calendar" className="h-full stable-height">
              {/* Calendar implementation will go here */}
            </div>
          </div>
        )}
        {view === 'stats' && (
          <div className="bg-white p-6 rounded-lg shadow fixed-layout">
            <h2 className="text-2xl font-bold mb-4">Estatísticas e Métricas</h2>
            {!isAdmin && (
              <p className="text-red-500 font-medium mb-4">Esta funcionalidade está disponível apenas para administradores.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded h-64 no-flicker">
                <h3 className="text-lg font-medium mb-4">Serviços por Tipo</h3>
                <div className="h-48">{/* Chart implementation will go here */}</div>
              </div>
              <div className="p-4 border rounded h-64 no-flicker">
                <h3 className="text-lg font-medium mb-4">Tempo Médio de Conclusão</h3>
                <div className="h-48">{/* Chart implementation will go here */}</div>
              </div>
            </div>
          </div>
        )}
        {view === 'search' && (
          <div className="bg-white p-6 rounded-lg shadow fixed-layout">
            <h2 className="text-2xl font-bold mb-4">Busca Avançada</h2>
            {!isAdmin && (
              <p className="text-red-500 font-medium mb-4">Esta funcionalidade está disponível apenas para administradores.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={!isAdmin}
                  id="search-client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Serviço</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  disabled={!isAdmin}
                  id="search-service-type"
                >
                  <option value="">Todos</option>
                  <option value="repair">Reparo</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="installation">Instalação</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  disabled={!isAdmin}
                  id="search-status"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="completed">Concluído</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                className={`px-4 py-2 ${isAdmin ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md`}
                disabled={!isAdmin}
                onClick={() => {
                  if (isAdmin) {
                    const clientName = (document.getElementById('search-client') as HTMLInputElement)?.value || '';
                    const serviceType = (document.getElementById('search-service-type') as HTMLSelectElement)?.value || '';
                    const status = (document.getElementById('search-status') as HTMLSelectElement)?.value || '';
                    
                    // Buscar serviços com base nos filtros
                    handleAdvancedSearch(clientName, serviceType as any, status as any);
                  }
                }}
              >
                Buscar
              </button>
            </div>
            
            <div id="search-results" className="mt-8">
              {searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(service => (
                    <li key={service.id}>{service.client_name} - {service.service_type} - {service.status}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum resultado encontrado.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {showNewServiceModal && (
        <NewServiceForm 
          onClose={() => {
            setShowNewServiceModal(false);
            // Recarregar estatísticas após adicionar um novo serviço
            loadDashboardStats();
          }} 
        />
      )}

      {showServicesListModal && (currentServiceStatus !== undefined || currentBudgetStatus !== undefined) && (
        <ServicesList 
          status={currentServiceStatus}
          budgetStatus={currentBudgetStatus}
          onUpdateStats={handleUpdateStats}
          onClose={handleCloseServicesList} 
        />
      )}

      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: {
          opacity: 1,
          userSelect: 'none'
        }
      }} />
    </div>
  );
}

export default App;