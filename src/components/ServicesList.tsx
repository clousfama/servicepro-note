import { useState, useEffect } from 'react';
import { Service } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Clock, CheckCircle, Activity, DollarSign, CheckSquare, XSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ServicesListProps {
  status?: Service['status'];
  budgetStatus?: 'pending' | 'approved' | 'rejected';
  onClose: () => void;
  onUpdateStats: () => void;
}

export function ServicesList({ status, budgetStatus, onClose, onUpdateStats }: ServicesListProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar serviços ao montar o componente
  useEffect(() => {
    if (user) {
      getFirestoreServices();
    }
  }, [user, status, budgetStatus]);

  // Função para converter timestamp para data formatada
  const formatDate = (dateString: string) => {
    try {
      // Criar a data e ajustar para o fuso horário local
      const date = new Date(dateString);
      // Ajustar o timezone para evitar problemas com data aparecendo um dia antes
      date.setHours(date.getHours() + 12);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return 'Data inválida';
    }
  };

  // Escolher a cor e ícone com base no status
  const getStatusConfig = () => {
    if (status) {
      switch (status) {
        case 'active':
          return { 
            bgColor: 'bg-blue-50', 
            textColor: 'text-blue-700',
            borderColor: 'border-blue-200',
            icon: <Activity className="h-6 w-6 text-blue-600" />,
            title: 'Serviços Ativos'
          };
        case 'completed':
          return { 
            bgColor: 'bg-green-50', 
            textColor: 'text-green-700',
            borderColor: 'border-green-200',
            icon: <CheckCircle className="h-6 w-6 text-green-600" />,
            title: 'Serviços Concluídos' 
          };
        case 'pending':
          return { 
            bgColor: 'bg-yellow-50', 
            textColor: 'text-yellow-700',
            borderColor: 'border-yellow-200',
            icon: <Clock className="h-6 w-6 text-yellow-600" />,
            title: 'Serviços Pendentes' 
          };
        default:
          return { 
            bgColor: 'bg-gray-50', 
            textColor: 'text-gray-700',
            borderColor: 'border-gray-200',
            icon: <Activity className="h-6 w-6 text-gray-600" />,
            title: 'Lista de Serviços'
          };
      }
    } else if (budgetStatus) {
      switch (budgetStatus) {
        case 'pending':
          return { 
            bgColor: 'bg-orange-50', 
            textColor: 'text-orange-700',
            borderColor: 'border-orange-200',
            icon: <DollarSign className="h-6 w-6 text-orange-600" />,
            title: 'Orçamentos Pendentes'
          };
        case 'approved':
          return { 
            bgColor: 'bg-emerald-50', 
            textColor: 'text-emerald-700',
            borderColor: 'border-emerald-200',
            icon: <CheckSquare className="h-6 w-6 text-emerald-600" />,
            title: 'Orçamentos Aprovados'
          };
        case 'rejected':
          return { 
            bgColor: 'bg-red-50', 
            textColor: 'text-red-700',
            borderColor: 'border-red-200',
            icon: <XSquare className="h-6 w-6 text-red-600" />,
            title: 'Orçamentos Recusados'
          };
        default:
          return { 
            bgColor: 'bg-gray-50', 
            textColor: 'text-gray-700',
            borderColor: 'border-gray-200',
            icon: <DollarSign className="h-6 w-6 text-gray-600" />,
            title: 'Orçamentos'
          };
      }
    } else {
      return { 
        bgColor: 'bg-gray-50', 
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        icon: <Activity className="h-6 w-6 text-gray-600" />,
        title: 'Lista de Serviços'
      };
    }
  };

  const statusConfig = getStatusConfig();

  // Mapear os tipos de serviço para nomes mais amigáveis
  const serviceTypeMap = {
    repair: 'Reparo',
    maintenance: 'Manutenção',
    installation: 'Instalação'
  };
  
  // Mapear os status de orçamento para nomes mais amigáveis
  const budgetStatusMap = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Recusado'
  };

  // Atualizar estatísticas no localStorage
  const updateServiceStats = () => {
    // Carregar todos os serviços
    const allServices = JSON.parse(localStorage.getItem('simulatedServices') || '[]');
    
    // Calcular estatísticas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      activeServices: allServices.filter((s: Service) => s.status === 'active').length,
      completedToday: allServices.filter((s: Service) => {
        if (s.status !== 'completed') return false;
        const updatedDate = new Date(s.updated_at);
        updatedDate.setHours(0, 0, 0, 0);
        return updatedDate.getTime() === today.getTime();
      }).length,
      pendingServices: allServices.filter((s: Service) => s.status === 'pending').length,
      pendingBudgetServices: allServices.filter((s: Service) => s.budget_status === 'pending').length,
      approvedBudgetServices: allServices.filter((s: Service) => s.budget_status === 'approved').length,
      rejectedBudgetServices: allServices.filter((s: Service) => s.budget_status === 'rejected').length
    };
    
    // Salvar estatísticas no localStorage
    localStorage.setItem('serviceStats', JSON.stringify(stats));
    
    // Notificar App.tsx para atualizar as estatísticas
    onUpdateStats();
  };

  const getFirestoreServices = async () => {
    try {
      setIsLoading(true);
      
      // Tentar carregar do localStorage primeiro para que usuários comuns e admin vejam os mesmos dados
      const savedServices = localStorage.getItem('simulatedServices');
      if (savedServices) {
        const parsedServices = JSON.parse(savedServices) as Service[];
        // Aplicar filtros
        let filteredServices = parsedServices;
        
        if (status) {
          filteredServices = filteredServices.filter(service => service.status === status);
        } else if (budgetStatus) {
          filteredServices = filteredServices.filter(service => service.budget_status === budgetStatus);
        }
        
        setServices(filteredServices);
        setIsLoading(false);
        return;
      }
      
      // Se não houver dados no localStorage, gerar dados vazios
      const demoServices: Service[] = [];
      setServices(demoServices);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar os serviços. Tente novamente mais tarde.');
      setIsLoading(false);
    }
  };

  const handleChangeServiceStatus = (id: string, newStatus: Service['status']) => {
    const updatedServices = services.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    setServices(updatedServices);
    updateServiceStats();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col no-flicker">
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-b px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center">
            {statusConfig.icon}
            <h2 className={`text-xl font-bold ml-2 ${statusConfig.textColor}`}>
              {statusConfig.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-auto p-6 flex-grow">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">Carregando serviços...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">Nenhum serviço encontrado com os critérios selecionados.</p>
            </div>
          ) : (
            <div className="divide-y">
              {services.map((service) => (
                <div key={service.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.client_name} - {serviceTypeMap[service.service_type]}
                    </h3>
                    <span className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(service.budget)}
                    </span>
                  </div>
                  <div className="text-gray-700 mb-2">
                    Endereço: {service.address}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div><span className="font-medium">Cliente:</span> {service.client_name}</div>
                    <div><span className="font-medium">Contato:</span> {service.phone}</div>
                    <div><span className="font-medium">Status:</span> {
                      {
                        'active': 'Ativo',
                        'completed': 'Concluído',
                        'pending': 'Pendente'
                      }[service.status] || service.status
                    }</div>
                    <div><span className="font-medium">Orçamento:</span> {budgetStatusMap[service.budget_status]}</div>
                    <div><span className="font-medium">Criado:</span> {formatDate(service.created_at)}</div>
                    <div><span className="font-medium">Atualizado:</span> {formatDate(service.updated_at)}</div>
                    <div><span className="font-medium text-red-600 font-bold">Data de Entrega:</span> {formatDate(service.due_date)}</div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        handleChangeServiceStatus(service.id, 'completed');
                      }}
                      className="px-4 py-2 bg-green-200 text-green-800 rounded hover:bg-green-300 transition-colors mr-2"
                    >
                      Concluir
                    </button>
                    <button
                      onClick={() => {
                        handleChangeServiceStatus(service.id, 'pending');
                      }}
                      className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors mr-2"
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => {
                        handleChangeServiceStatus(service.id, 'active');
                      }}
                      className="px-4 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition-colors"
                    >
                      Ativo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
