import { Settings, CheckCircle, Clock, DollarSign, CheckSquare, XSquare } from 'lucide-react';
import { Service } from '../types/database';

interface DashboardProps {
  activeServices: number;
  completedToday: number;
  pendingServices: number;
  pendingBudgetServices: number;
  approvedBudgetServices: number;
  rejectedBudgetServices: number;
  onShowServicesList: (status: Service['status']) => void;
  onShowBudgetServicesList: (budgetStatus: 'pending' | 'approved' | 'rejected') => void;
  isAdmin: boolean;
}

export function Dashboard({
  activeServices,
  completedToday,
  pendingServices,
  pendingBudgetServices,
  approvedBudgetServices,
  rejectedBudgetServices,
  onShowServicesList,
  onShowBudgetServicesList,
  isAdmin,
}: DashboardProps) {
  return (
    <div className="space-y-8 fixed-layout">
      <h2 className="text-2xl font-bold mb-6">Status dos Serviços</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow no-flicker" style={{ minHeight: '180px' }}>
          <Settings className="text-blue-600 h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Serviços Ativos</h3>
          <p className="text-3xl font-bold text-blue-600 mb-4">{activeServices}</p>
          {isAdmin && (
            <button
              onClick={() => onShowServicesList('active')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Ver Lista
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow no-flicker" style={{ minHeight: '180px' }}>
          <CheckCircle className="text-green-600 h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Concluídos Hoje</h3>
          <p className="text-3xl font-bold text-green-600 mb-4">{completedToday}</p>
          {isAdmin && (
            <button
              onClick={() => onShowServicesList('completed')}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Ver Lista
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow no-flicker" style={{ minHeight: '180px' }}>
          <Clock className="text-yellow-600 h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Serviços Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-600 mb-4">{pendingServices}</p>
          {isAdmin && (
            <button
              onClick={() => onShowServicesList('pending')}
              className="text-sm text-yellow-600 hover:text-yellow-800"
            >
              Ver Lista
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 mt-12">Status dos Orçamentos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow no-flicker" style={{ minHeight: '180px' }}>
          <DollarSign className="text-orange-600 h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Orçamentos Pendentes</h3>
          <p className="text-3xl font-bold text-orange-600 mb-4">{pendingBudgetServices}</p>
          {isAdmin && (
            <button
              onClick={() => onShowBudgetServicesList('pending')}
              className="text-sm text-orange-600 hover:text-orange-800"
            >
              Ver Lista
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow no-flicker" style={{ minHeight: '180px' }}>
          <CheckSquare className="text-emerald-600 h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Orçamentos Aprovados</h3>
          <p className="text-3xl font-bold text-emerald-600 mb-4">{approvedBudgetServices}</p>
          {isAdmin && (
            <button
              onClick={() => onShowBudgetServicesList('approved')}
              className="text-sm text-emerald-600 hover:text-emerald-800"
            >
              Ver Lista
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow no-flicker" style={{ minHeight: '180px' }}>
          <XSquare className="text-red-600 h-8 w-8 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Orçamentos Recusados</h3>
          <p className="text-3xl font-bold text-red-600 mb-4">{rejectedBudgetServices}</p>
          {isAdmin && (
            <button
              onClick={() => onShowBudgetServicesList('rejected')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Ver Lista
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 mt-12">Categorias de Serviços</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ServiceCategory
          title="Reparo"
          description="Serviços de reparo e conserto de equipamentos e estruturas de madeira."
          imageUrl="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80"
        />
        <ServiceCategory
          title="Manutenção"
          description="Serviços de manutenção preventiva e corretiva em móveis e estruturas."
          imageUrl="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
        />
        <ServiceCategory
          title="Instalação"
          description="Serviços de instalação de novos móveis, assoalhos e estruturas de madeira."
          imageUrl="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"
        />
      </div>
    </div>
  );
}

interface ServiceCategoryProps {
  title: string;
  description: string;
  imageUrl: string;
}

function ServiceCategory({ title, description, imageUrl }: ServiceCategoryProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow no-flicker" style={{ minHeight: '240px' }}>
      <div className="h-32 w-full overflow-hidden rounded-md mb-4">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={(e) => {
            // Fallback caso a imagem não carregue
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagem+Indisponível';
          }}
        />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}