import { useEffect, useState } from 'react';
import { Appointment, AppointmentStatus } from './types';
import ClientBooking from './components/ClientBooking';
import ClientCancellation from './components/ClientCancellation';
import DashboardLogin from './components/DashboardLogin';
import BusinessOnboarding from './components/BusinessOnboarding';
import DailyAgenda from './components/DailyAgenda';
import ClientsList from './components/ClientsList';
import ReportsDashboard from './components/ReportsDashboard';
import { BarChart3, Calendar, LogOut, MessageSquare, Scissors, Users } from 'lucide-react';
import {
  cancelPublicAppointment,
  clearStoredToken,
  createAppointment,
  createPublicAppointment,
  fetchAppointments,
  fetchCurrentUser,
  fetchPublicAppointments,
  fetchPublicBusiness,
  login,
  registerBusiness,
  updateAppointmentStatus
} from './api';
import WhatsAppSimulator from './components/WhatsAppSimulator';

type DashboardView = 'agenda' | 'clients' | 'reports';

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dashboardView, setDashboardView] = useState<DashboardView>('agenda');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUserRole, setActiveUserRole] = useState('Administrador');
  const [activeUserName, setActiveUserName] = useState('');
  const [businessName, setBusinessName] = useState('AgendaBarber');
  const [isBooting, setIsBooting] = useState(true);

  const path = window.location.pathname;
  const isPublicBooking = path.startsWith('/book');
  const isPublicCancellation = path.startsWith('/cancel');
  const isRegistration = path.startsWith('/register');
  const isChatSimulator = path.startsWith('/chat');

  const loadAppointments = async () => {
    const result = await fetchAppointments();
    setAppointments(result.appointments);
  };

  const applySession = async (user: {
    email: string;
    role: 'administrador' | 'barbero';
    name: string;
    businessName: string;
  }) => {
    setActiveUserRole(user.role === 'administrador' ? 'Administrador' : 'Barbero / Recepcionista');
    setActiveUserName(user.name);
    setBusinessName(user.businessName);
    setIsLoggedIn(true);
    await loadAppointments();
  };

  const handleLoginSuccess = async (email: string, password: string) => {
    const user = await login(email, password);
    await applySession(user);
  };

  const handleOnboardingComplete = async (
    newBusinessName: string,
    planId: string,
    email: string,
    password: string
  ) => {
    const user = await registerBusiness({
      businessName: newBusinessName,
      email,
      password,
      plan: planId
    });
    window.history.replaceState(null, '', '/');
    await applySession(user);
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    const result = await updateAppointmentStatus(id, newStatus);
    setAppointments((prev) => prev.map((apt) => (apt.id === id ? result.appointment : apt)));
  };

  const handleAddAppointment = async (newApt: Appointment) => {
    const channel = newApt.phone === 'Entrada Directa' ? 'manual' : 'web';
    const result = await createAppointment(newApt, channel);
    setAppointments((prev) => [result.appointment, ...prev]);
  };

  const handlePublicAppointment = async (newApt: Appointment) => {
    const result = await createPublicAppointment(newApt);
    setAppointments((prev) => [result.appointment, ...prev]);
    return result.appointment;
  };

  const handleCancelAppointment = async (id: string, phone?: string) => {
    const result = phone
      ? await cancelPublicAppointment(id, phone)
      : await updateAppointmentStatus(id, 'Cancelada');
    setAppointments((prev) => prev.map((apt) => (apt.id === id ? result.appointment : apt)));
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsLoggedIn(false);
    setAppointments([]);
  };

  useEffect(() => {
    if (isPublicBooking || isPublicCancellation || isRegistration) {
      fetchPublicBusiness()
        .then(({ business }) => {
          if (business) setBusinessName(business.name);
        })
        .catch(() => undefined);
      fetchPublicAppointments()
        .then((result) => setAppointments(result.appointments))
        .catch(() => setAppointments([]));
      setIsBooting(false);
      return;
    }

    fetchCurrentUser()
      .then(({ user }) => applySession(user))
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => setIsBooting(false));
  }, []);

  if (isChatSimulator) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 flex items-center justify-center">
        <WhatsAppSimulator />
      </main>
    );
  }

  if (isPublicBooking) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 flex items-center justify-center">
        <ClientBooking
          appointments={appointments}
          businessName={businessName}
          onAddAppointment={handlePublicAppointment}
        />
      </main>
    );
  }

  if (isPublicCancellation) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 flex items-center justify-center">
        <ClientCancellation
          appointments={appointments}
          businessName={businessName}
          onCancelAppointment={handleCancelAppointment}
        />
      </main>
    );
  }

  if (isRegistration) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 flex items-center justify-center">
        <BusinessOnboarding onOnboardingComplete={handleOnboardingComplete} />
      </main>
    );
  }

  if (isBooting) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] grid place-items-center text-sm text-[#6E6E73]">
        Cargando AgendaBarber...
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] p-4 md:p-8 flex items-center justify-center">
        <DashboardLogin onLoginSuccess={handleLoginSuccess} />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F7]">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#D1D1D6] p-5 flex flex-col gap-6 shrink-0 z-10">
        <div className="flex items-center gap-2.5 px-1.5 py-1">
          <div className="w-8 h-8 bg-[#0071E3] text-white rounded-lg flex items-center justify-center">
            <Scissors className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-semibold text-sm text-[#1D1D1F] tracking-tight block">
              AgendaBarber
            </span>
            <span className="text-[10px] text-[#6E6E73] block">{businessName}</span>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1 pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setDashboardView('agenda')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              dashboardView === 'agenda'
                ? 'bg-[#0071E3] text-white'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`}
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>Agenda</span>
          </button>

          <a
            href="/chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            <MessageSquare className="w-4.5 h-4.5 text-[#25D366]" />
            <span>Simulador Bot WA</span>
          </a>

          <button
            disabled={activeUserRole === 'Barbero / Recepcionista'}
            onClick={() => setDashboardView('clients')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeUserRole === 'Barbero / Recepcionista'
                ? 'opacity-40 cursor-not-allowed hidden md:flex'
                : dashboardView === 'clients'
                ? 'bg-[#0071E3] text-white'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Clientes</span>
          </button>

          <button
            disabled={activeUserRole === 'Barbero / Recepcionista'}
            onClick={() => setDashboardView('reports')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              activeUserRole === 'Barbero / Recepcionista'
                ? 'opacity-40 cursor-not-allowed hidden md:flex'
                : dashboardView === 'reports'
                ? 'bg-[#0071E3] text-white'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5" />
            <span>Reportes</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-[#E5E5EA] flex-col gap-1 hidden md:flex">
          <span className="text-[10px] text-[#6E6E73] px-3.5">
            Sesión: <strong className="text-[#1D1D1F] font-normal">{activeUserName}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30]/5 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {dashboardView === 'agenda' && (
          <DailyAgenda
            appointments={appointments}
            activeUserRole={activeUserRole}
            activeUserName={activeUserName}
            businessName={businessName}
            onUpdateAppointmentStatus={handleUpdateStatus}
            onAddAppointment={handleAddAppointment}
          />
        )}
        {dashboardView === 'clients' && <ClientsList appointments={appointments} />}
        {dashboardView === 'reports' && <ReportsDashboard appointments={appointments} />}
      </main>
    </div>
  );
}
