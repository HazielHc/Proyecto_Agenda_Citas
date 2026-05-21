import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from './types';
import { initialAppointments, sampleServices } from './data';
import SelectorBar from './components/SelectorBar';
import ClientBooking from './components/ClientBooking';
import ClientCancellation from './components/ClientCancellation';
import DashboardLogin from './components/DashboardLogin';
import BusinessOnboarding from './components/BusinessOnboarding';
import DailyAgenda from './components/DailyAgenda';
import ClientsList from './components/ClientsList';
import ReportsDashboard from './components/ReportsDashboard';
import WhatsAppMockup from './components/WhatsAppMockup';
import { Scissors, Calendar, Users, BarChart3, Settings, LogOut, Mail, HelpCircle, Layers, LogIn, Sparkles } from 'lucide-react';
import {
  clearStoredToken,
  createAppointment,
  fetchAppointments,
  fetchCurrentUser,
  login,
  updateAppointmentStatus
} from './api';

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [currentInterface, setCurrentInterface] = useState<number>(5); // Default to Agenda (5)
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Authenticated State for Dashboard Views
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeUserEmail, setActiveUserEmail] = useState<string>('admin@barberia.com');
  const [activeUserRole, setActiveUserRole] = useState<string>('Administrador');
  const [activeUserName, setActiveUserName] = useState<string>('Carlos Mendoza');
  const [apiMode, setApiMode] = useState<boolean>(false);
  const [businessName, setBusinessName] = useState<string>('Barbería El Navajero');

  // Sync role if they login
  const handleLoginSuccess = async (email: string, password: string) => {
    const user = await login(email, password);
    setActiveUserEmail(user.email);
    setActiveUserRole(user.role === 'administrador' ? 'Administrador' : 'Barbero / Recepcionista');
    setActiveUserName(user.name);
    setBusinessName(user.businessName);
    setIsLoggedIn(true);
    setApiMode(true);
    setCurrentInterface(5);
    const result = await fetchAppointments();
    setAppointments(result.appointments);
    return;

    setActiveUserEmail(email);
    setIsLoggedIn(true);
    
    if (email.includes('barbero')) {
      setActiveUserRole('Barbero / Recepcionista');
      setActiveUserName('Héctor Ruiz');
    } else {
      setActiveUserRole('Administrador');
      setActiveUserName('Carlos Mendoza');
    }
    
    // Smooth transition to Daily Agenda (5)
    setCurrentInterface(5);
  };

  const handleOnboardingComplete = (newBusinessName: string, planId: string) => {
    setBusinessName(newBusinessName);
    setActiveUserRole('Administrador');
    setActiveUserName('Propietario');
    setIsLoggedIn(true);
    setCurrentInterface(5);
  };

  // State transitions callback
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    if (apiMode) {
      try {
        const result = await updateAppointmentStatus(id, newStatus);
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? result.appointment : apt))
        );
        return;
      } catch (error) {
        console.error(error);
      }
    }

    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          // If completing service, save appropriate price
          let price = apt.pricePaid;
          if (newStatus === 'Completada' && !price) {
            price = 200; // default average mxn
          }
          return { ...apt, status: newStatus, pricePaid: price };
        }
        return apt;
      })
    );
  };

  const handleAddAppointment = async (newApt: Appointment) => {
    if (apiMode) {
      try {
        const channel = newApt.phone === 'Entrada Directa' ? 'manual' : 'web';
        const result = await createAppointment(newApt, channel);
        setAppointments((prev) => [result.appointment, ...prev]);
        return;
      } catch (error) {
        console.error(error);
      }
    }

    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelada' } : apt))
    );
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsLoggedIn(false);
    setApiMode(false);
    setCurrentInterface(3); // Go to login screen
  };

  useEffect(() => {
    fetchCurrentUser()
      .then(async ({ user }) => {
        setActiveUserEmail(user.email);
        setActiveUserRole(user.role === 'administrador' ? 'Administrador' : 'Barbero / Recepcionista');
        setActiveUserName(user.name);
        setBusinessName(user.businessName);
        setIsLoggedIn(true);
        setApiMode(true);
        setCurrentInterface(5);
        const result = await fetchAppointments();
        setAppointments(result.appointments);
      })
      .catch(() => {
        setCurrentInterface(3);
      });
  }, []);

  // Safe checks & automatic redirects based on current screen states
  useEffect(() => {
    // If user is accessing a dashboard screen and is NOT logged in, let them log in
    const isDashboardScreen = [5, 7, 8].includes(currentInterface);
    if (isDashboardScreen && !isLoggedIn) {
      setCurrentInterface(3);
    }
  }, [currentInterface, isLoggedIn]);

  // Render chosen prototype view
  const renderInterfaceContent = () => {
    switch (currentInterface) {
      case 1:
        return (
          <ClientBooking
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
          />
        );
      case 2:
        return (
          <ClientCancellation
            appointments={appointments}
            onCancelAppointment={handleCancelAppointment}
          />
        );
      case 3:
        return <DashboardLogin onLoginSuccess={handleLoginSuccess} />;
      case 4:
        return <BusinessOnboarding onOnboardingComplete={handleOnboardingComplete} />;
      case 5:
        return (
          <DailyAgenda
            appointments={appointments}
            activeUserRole={activeUserRole}
            activeUserName={activeUserName}
            businessName={businessName}
            onUpdateAppointmentStatus={handleUpdateStatus}
            onAddAppointment={handleAddAppointment}
          />
        );
      case 7:
        return <ClientsList appointments={appointments} />;
      case 8:
        return <ReportsDashboard appointments={appointments} />;
      case 9:
        return <WhatsAppMockup />;
      default:
        return (
          <div className="text-center py-12 text-[#6E6E73]">
            Instrucción no soportada o pantalla excluida. Use el controlador superior.
          </div>
        );
    }
  };

  // Is is standard dashboard (agenda, clients, reports) -> Render standard frame with sidebar
  const isDashboardLayout = isLoggedIn && [5, 7, 8].includes(currentInterface);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7]">
      {/* 9-Interfaces core switcher */}
      <SelectorBar
        currentInterface={currentInterface}
        onSelectInterface={(num) => setCurrentInterface(num)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Sandbox Frame Container */}
      {isDashboardLayout ? (
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Dashboard Left Sidebar Navigation - conforming directly to HIG */}
          <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#D1D1D6] p-5 flex flex-col gap-6 shrink-0 z-10">
            {/* Header / Logo */}
            <div className="flex items-center gap-2.5 px-1.5 py-1">
              <div className="w-8 h-8 bg-[#0071E3] text-white rounded-lg flex items-center justify-center">
                <Scissors className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-[#1D1D1F] tracking-tight block">
                  AgendaBarber
                </span>
                <span className="text-[10px] text-[#6E6E73] block">
                  Panel Operativo
                </span>
              </div>
            </div>

            {/* Main Tabs Selection (changes currentInterface state reactively!) */}
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1 pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setCurrentInterface(5)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  currentInterface === 5
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>Agenda</span>
              </button>

              <button
                disabled={activeUserRole === 'Barbero / Recepcionista'}
                onClick={() => setCurrentInterface(7)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  activeUserRole === 'Barbero / Recepcionista'
                    ? 'opacity-40 cursor-not-allowed hidden md:flex'
                    : currentInterface === 7
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
                title={activeUserRole === 'Barbero / Recepcionista' ? 'Solo dueños' : ''}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Clientes</span>
              </button>

              <button
                disabled={activeUserRole === 'Barbero / Recepcionista'}
                onClick={() => setCurrentInterface(8)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  activeUserRole === 'Barbero / Recepcionista'
                    ? 'opacity-40 cursor-not-allowed hidden md:flex'
                    : currentInterface === 8
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
                title={activeUserRole === 'Barbero / Recepcionista' ? 'Solo dueños' : ''}
              >
                <BarChart3 className="w-4.5 h-4.5" />
                <span>Reportes</span>
              </button>
            </nav>

            <div className="mt-auto pt-4 border-t border-[#E5E5EA] flex flex-col gap-1 hidden md:flex">
              <span className="text-[10px] text-[#6E6E73] px-3.5">
                Sesión: <strong className="text-[#1D1D1F] font-normal">{activeUserName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30]/5 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>

          {/* Core Content Box with safe container scroll */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {renderInterfaceContent()}
          </main>
        </div>
      ) : (
        /* If Client view or Onboarding/Login view - Render simple isolated raw presentation template */
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
          {renderInterfaceContent()}
        </div>
      )}
    </div>
  );
}
