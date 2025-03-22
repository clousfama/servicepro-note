import { PenTool, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onShowDashboard: () => void;
  onShowCalendar: () => void;
  onShowStats: () => void;
  onShowSearch: () => void;
  onNewService: () => void;
  isAdmin: boolean;
}

export function Header({
  onShowDashboard,
  onShowCalendar,
  onShowStats,
  onShowSearch,
  onNewService,
  isAdmin,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-lg fixed-layout">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 no-flicker">
          <div className="flex items-center">
            <PenTool className="text-blue-600 h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">
              ServiceNote-Pro {isAdmin && <span className="text-xs font-medium text-blue-600 ml-2 bg-blue-100 px-2 py-1 rounded">Admin</span>}
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center">
            <button onClick={onShowDashboard} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Painel
            </button>
            <button onClick={onShowCalendar} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Calendário
            </button>
            <button onClick={onShowStats} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Estatísticas
            </button>
            <button onClick={onShowSearch} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              Busca Avançada
            </button>
            <button
              onClick={onNewService}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Novo Serviço
            </button>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed-layout">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onShowDashboard();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                Painel
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onShowCalendar();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                Calendário
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onShowStats();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                Estatísticas
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onShowSearch();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                Busca Avançada
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onNewService();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 w-full text-left"
              >
                Novo Serviço
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 w-full text-left flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}