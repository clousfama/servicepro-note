import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
import { format } from 'date-fns'; // Importando funções do date-fns

interface AppointmentModalProps {
  service: {
    id: string;
    title: string;
    price: string;
  };
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  service,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    date: '',
    time: '',
  });
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockTimes, setBlockTimes] = useState<string[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLogin, setAdminLogin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);
    let formatted = limited;
    if (limited.length > 2) {
      formatted = `(${limited.slice(0, 2)})${limited.slice(2)}`;
    }
    if (limited.length > 7) {
      formatted = `${formatted.slice(0, 9)}-${formatted.slice(9)}`;
    }
    return formatted;
  };

  const handleDateChange = async (date: string) => {
    setFormData(prev => ({ ...prev, date })); // Atualiza a data no formData
    setBlockDate(date); // Atualiza a data no blockDate
    
    try {
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getUTCDay(); // Usando getUTCDay para considerar o fuso horário UTC
      
      // Se for domingo, não deve retornar horários
      if (dayOfWeek === 0) {
        setAvailableTimes([]);
        toast.error('Não atendemos aos domingos');
        return;
      }

      const { data: bookedAppointments } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', format(selectedDate, 'yyyy-MM-dd')) // Formatando a data para o formato correto
        .eq('status', 'confirmed');

      const bookedTimes = new Set(bookedAppointments?.map(app => app.time) || []);
      
      const times: string[] = [];
      const startHour = 8;
      let endHour = 19; // Horário padrão para dias de semana

      // Se for sábado, o horário final deve ser 17
      if (dayOfWeek === 6) {
        endHour = 17;
      }

      for (let hour = startHour; hour <= endHour; hour++) { // Incluir o horário final
        for (let minute of [0, 30]) {
          if (hour === 8 && minute === 0) continue; // Pular 8:00, começar às 8:30
          
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          if (!bookedTimes.has(timeString) && !(hour === 17 && minute === 30) && !(hour === 19 && minute === 30)) { // Remover 17:30 e 19:30
            times.push(timeString);
          }
        }
      }

      // Garantir que o último horário seja incluído
      if (dayOfWeek === 6) {
        if (!bookedTimes.has('17:00')) {
          times.push('17:00'); // Incluir 17:00 para sábado, se não estiver reservado
        }
      } else {
        if (!bookedTimes.has('19:00')) {
          times.push('19:00'); // Incluir 19:00 para dias de semana, se não estiver reservado
        }
      }
      
      // Remover duplicatas
      const uniqueTimes = Array.from(new Set(times));
      setAvailableTimes(uniqueTimes);
    } catch (error) {
      console.error('Error fetching available times:', error);
      toast.error('Erro ao carregar horários disponíveis');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: supabaseError } = await supabase
        .from('appointments')
        .insert([{
          name: formData.name,
          whatsapp: formData.whatsapp,
          service: service.id,
          service_text: `${service.title} - ${service.price}`,
          date: formData.date,
          time: formData.time,
        }]);

      if (supabaseError) throw supabaseError;

      await emailjs.send(
        'service_ha16nlq',
        'template_0k95b0o',
        {
          to_name: "Kesley",
          from_name: formData.name,
          service: `${service.title} - ${service.price}`,
          date: formData.date,
          time: formData.time,
          to_email: "kesleywd25@gmail.com",
          reply_to: formData.whatsapp + "@c.us"
        }
      );

      toast.success('Agendamento realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao realizar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBlockSchedule = () => {
    setShowBlockModal(true);
  };

  const handleAuthentication = () => {
    if (adminLogin === 'admin' && adminPassword === 'WoodBK@') {
      setIsAuthenticated(true);
      toast.success('Login bem-sucedido!');
    } else {
      toast.error('Login ou senha incorretos');
    }
  };

  const handleBlockSubmit = async () => {
    // Lógica para bloquear horários no banco de dados
    // Aqui você pode implementar a lógica para registrar os horários bloqueados
    // no banco de dados usando o supabase.
    toast.success('Horários bloqueados com sucesso!');
    setShowBlockModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
      <div className="bg-woodDark rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-woodGold mb-6">
          Agendar {service.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={e => setFormData(prev => ({ 
                ...prev, 
                whatsapp: formatWhatsApp(e.target.value)
              }))}
              placeholder="(99) 99999-9999"
              className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Data
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={e => handleDateChange(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Horário
            </label>
            <select
              required
              value={formData.time}
              onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold"
            >
              <option value="">Selecione um horário</option>
              {availableTimes.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-woodGold text-black py-2 rounded font-medium hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </form>

        <button
          onClick={handleBlockSchedule}
          className="w-full bg-red-600 text-white py-2 rounded mt-4 hover:bg-red-700 transition"
        >
          Bloquear Agenda
        </button>

        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-woodDark rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-woodGold mb-4">Bloquear Horários</h2>
              <input
                type="text"
                placeholder="Login Admin"
                value={adminLogin}
                onChange={e => setAdminLogin(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold mb-4"
              />
              <input
                type="password"
                placeholder="Senha Admin"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold mb-4"
              />
              <input
                type="date"
                value={blockDate}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-woodGold focus:ring-1 focus:ring-woodGold mb-4"
              />
              <div className="space-y-2">
                {availableTimes.map(time => (
                  <div key={time} className="flex items-center">
                    <input
                      type="checkbox"
                      value={time}
                      onChange={e => {
                        if (e.target.checked) {
                          setBlockTimes(prev => [...prev, time]);
                        } else {
                          setBlockTimes(prev => prev.filter(t => t !== time));
                        }
                      }}
                    />
                    <label className="text-white ml-2">{time}</label>
                  </div>
                ))}
              </div>
              <button
                onClick={handleBlockSubmit}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition mt-4"
              >
                Confirmar Bloqueio
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition mt-2"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
