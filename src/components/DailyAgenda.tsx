import { useState, useEffect, FormEvent } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { sampleServices, formatDateInSpanish } from '../data';
import {
  Clock,
  Phone,
  User,
  Check,
  Play,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Compass,
  UserCheck,
  Activity,
  CalendarCheck
} from 'lucide-react';

interface DailyAgendaProps {
  appointments: Appointment[];
  activeUserRole: string;
  activeUserName: string;
  businessName: string;
  onUpdateAppointmentStatus: (id: string, newStatus: AppointmentStatus) => void;
  onAddAppointment: (apt: Appointment) => void;
}

export default function DailyAgenda({
  appointments,
  activeUserRole,
  activeUserName,
  businessName,
  onUpdateAppointmentStatus,
  onAddAppointment
}: DailyAgendaProps) {
  const [showModal, setShowModal] = useState(false);
  const [walkInFirstName, setWalkInFirstName] = useState('');
  const [walkInLastName, setWalkInLastName] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState(sampleServices[0].id);
  const [errorText, setErrorText] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments
    .filter((a) => a.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const [liveSeconds, setLiveSeconds] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    // Collect active running ones
    const activeApts = todayAppointments.filter((a) => a.status === 'En servicio');
    
    // Initialize
    const initialSeconds: { [id: string]: number } = {};
    activeApts.forEach((a) => {
      initialSeconds[a.id] = a.elapsedTime || 0;
    });
    setLiveSeconds(initialSeconds);

    const interval = setInterval(() => {
      setLiveSeconds((prev) => {
        const updated = { ...prev };
        activeApts.forEach((a) => {
          updated[a.id] = (updated[a.id] || 0) + 1;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [appointments]);

  const formatChronometer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWalkInSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!walkInFirstName || !walkInLastName) {
      setErrorText('Por favor complete el nombre y apellido.');
      return;
    }

    setErrorText(null);

    const dateObj = new Date();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    const newWalkIn: Appointment = {
      id: `walk-in-${Date.now()}`,
      clientName: walkInFirstName,
      clientLastName: walkInLastName,
      phone: 'Entrada Directa',
      serviceId: walkInServiceId,
      date: todayStr,
      time: currentTimeStr,
      barber: activeUserName || 'Personal en turno',
      status: 'Cliente llegó',
      pricePaid: walkInServiceId === '1' ? 180 : walkInServiceId === '2' ? 250 : walkInServiceId === '3' ? 150 : 200
    };

    await onAddAppointment(newWalkIn);
    
    // Clean up & Close modal
    setWalkInFirstName('');
    setWalkInLastName('');
    setWalkInServiceId(sampleServices[0].id);
    setShowModal(false);
  };

  // Status badges generator
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Completada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#34C759] text-white">
            Completada
          </span>
        );
      case 'En servicio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF9F0A] text-white animate-pulse">
            En servicio
          </span>
        );
      case 'Cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF3B30] text-white">
            Cancelada
          </span>
        );
      case 'No asistió':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF3B30] text-white">
            No asistió
          </span>
        );
      case 'Confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#007AFF] bg-opacity-15 text-[#0071E3]">
            Confirmada
          </span>
        );
      case 'Cliente llegó':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF9F0A] bg-opacity-15 text-[#FF9F0A]">
            Cliente llegó
          </span>
        );
      case 'Agendada':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E5E5EA] text-[#6E6E73]">
            Agendada
          </span>
        );
    }
  };

  const standardSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:30', '16:30', '17:30'];
  const freeSlots = standardSlots
    .filter((time) => !todayAppointments.some((a) => a.time === time && a.status !== 'Cancelada' && a.status !== 'No asistió'))
    .slice(0, 4)
    .map((time) => ({ time, label: 'Disponible para entrada directa' }));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-2">
      {/* Top Banner Dashboard Header */}
      <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wider">
            SaaS Dashboard Operativo del Día
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-xl font-medium text-[#1D1D1F] tracking-tight">
              {businessName}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
          </div>
          <div className="text-xs text-[#6E6E73] mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>Fecha: <strong className="text-[#1D1D1F] font-normal">{formatDateInSpanish(todayStr)}</strong></span>
            <span>•</span>
            <span>Usuario: <strong className="text-[#1D1D1F] font-normal">{activeUserName} ({activeUserRole})</strong></span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0071E3] text-white hover:bg-[#005ebd] px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Registrar cliente sin cita
        </button>
      </div>

      {/* Main Agenda Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column - Active List of appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#D1D1D6] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5EA] bg-[#F5F5F7] flex justify-between items-center">
              <h2 className="text-xs font-medium tracking-wider text-[#6E6E73] uppercase">
                CRONOGRAMA DE CITAS DE HOY
              </h2>
              <span className="text-xs text-[#0071E3] font-medium bg-[#0071E3]/5 px-2.5 py-0.5 rounded-full">
                {todayAppointments.length} Registros
              </span>
            </div>

            <div className="divide-y divide-[#E5E5EA]">
              {todayAppointments.map((apt) => {
                const service = sampleServices.find((s) => s.id === apt.serviceId);
                const secondsElapsed = liveSeconds[apt.id] || 0;

                return (
                  <div
                    key={apt.id}
                    className={`p-4 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      apt.status === 'En servicio'
                        ? 'bg-[#0071E3]/5 border-l-2 border-l-[#FF9F0A]'
                        : apt.status === 'Completada'
                        ? 'opacity-85 bg-[#F5F5F7]/40'
                        : apt.status === 'Cancelada' || apt.status === 'No asistió'
                        ? 'opacity-65 line-through bg-[#F5F5F7]/20'
                        : 'bg-white'
                    }`}
                  >
                    {/* Time & Client metadata */}
                    <div className="flex gap-4 items-start">
                      <div className="w-16 text-right shrink-0">
                        <p className="text-sm font-semibold text-[#1D1D1F]">{apt.time} hs</p>
                        <p className="text-[10px] text-[#6E6E73] uppercase">{apt.date.slice(5)}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-[#1D1D1F]">
                            {apt.clientName} {apt.clientLastName}
                          </span>
                          {getStatusBadge(apt.status)}

                          {/* Live Chronometer badge */}
                          {apt.status === 'En servicio' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#FF9F0A] bg-[#FF9F0A]/10 px-2 py-0.5 rounded border border-[#FF9F0A]/20">
                              <Clock className="w-3 h-3 text-[#FF9F0A] animate-spin" />
                              {formatChronometer(secondsElapsed)}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#6E6E73] space-y-0.5">
                          {apt.phone !== 'Entrada Directa' && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {apt.phone}
                            </p>
                          )}
                          <p>
                            Servicio: <span className="text-[#1D1D1F] font-medium">{service?.name || 'Desconocido'}</span> ({service?.duration} min)
                          </p>
                          <p>
                            Responsable: <span className="text-[#1D1D1F] font-medium">{apt.barber}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Transition Buttons (Max 4 states check) */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                      {/* 1. Confirmar Llegada */}
                      {(apt.status === 'Agendada' || apt.status === 'Confirmada') && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'Cliente llegó')}
                          className="px-3 py-1.5 bg-[#007AFF]/10 text-[#0071E3] hover:bg-[#0071E3] hover:text-white transition-all text-xs font-semibold rounded-md border border-transparent cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Llegó
                        </button>
                      )}

                      {/* 2. Iniciar Servicio */}
                      {apt.status === 'Cliente llegó' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'En servicio')}
                          className="px-3 py-1.5 bg-[#FF9F0A]/15 text-[#FF9F0A] hover:bg-[#FF9F0A] hover:text-white transition-all text-xs font-semibold rounded-md border border-transparent cursor-pointer flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Iniciar
                        </button>
                      )}

                      {/* 3. Completar servicio */}
                      {apt.status === 'En servicio' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'Completada')}
                          className="px-3 py-1.5 bg-[#34C759]/15 text-[#34C759] hover:bg-[#34C759] hover:text-white transition-all text-xs font-semibold rounded-md border border-transparent cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completar
                        </button>
                      )}

                      {/* 4. No asistió */}
                      {(apt.status === 'Agendada' || apt.status === 'Confirmada') && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'No asistió')}
                          className="px-3 py-1.5 bg-white border border-[#D1D1D6] hover:bg-[#FF3B30]/5 hover:text-[#FF3B30] hover:border-[#FF3B30]/30 transition-all text-xs text-[#6E6E73] font-medium rounded-md cursor-pointer"
                        >
                          No asistió
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {todayAppointments.length === 0 && (
                <div className="p-8 text-center text-[#6E6E73] text-sm">
                  No hay citas registradas para hoy en el sistema.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Free slots & On-site Walk-in summary */}
        <div className="space-y-5">
          {/* AVAILABLE SLOTS WIDGET */}
          <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-medium text-[#6E6E73] uppercase tracking-wider">
                HORARIOS DISPONIBLES (ENTRADA DIRECTA)
              </h3>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">
                Para registrar clientes espontáneos sin agendado previo.
              </p>
            </div>

            <div className="space-y-2">
              {freeSlots.map((slot) => {
                const isOccupied = todayAppointments.some((a) => a.time === slot.time && a.status !== 'Cancelada');

                return (
                  <div
                    key={slot.time}
                    onClick={() => {
                      if (!isOccupied) {
                        setShowModal(true);
                      }
                    }}
                    className={`flex items-center justify-between p-3 border rounded-lg text-xs transition-colors ${
                      isOccupied
                        ? 'opacity-40 border-[#E5E5EA] line-through cursor-not-allowed bg-[#F5F5F7]'
                        : 'border-[#D1D1D6] hover:bg-[#F5F5F7] cursor-pointer bg-white'
                    }`}
                  >
                    <span className="font-semibold text-[#1D1D1F]">{slot.time} hrs</span>
                    <span className="text-[#6E6E73] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                      {isOccupied ? 'Ocupado actualmente' : slot.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SAAS STATS MINI ACCORDION */}
          <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 text-xs text-[#6E6E73] space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] uppercase text-[10px] tracking-wider">
              ESTADOS DEL DÍA
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#F5F5F7] rounded">
                <span className="font-medium text-[#1D1D1F]">
                  {todayAppointments.filter((a) => a.status === 'Completada').length}
                </span>{' '}
                Completadas
              </div>
              <div className="p-2 bg-[#F5F5F7] rounded">
                <span className="font-medium text-[#1D1D1F]">
                  {todayAppointments.filter((a) => a.status === 'En servicio').length}
                </span>{' '}
                En Servicio
              </div>
              <div className="p-2 bg-[#F5F5F7] rounded">
                <span className="font-medium text-[#1D1D1F]">
                  {todayAppointments.filter((a) => a.status === 'Cliente llegó').length}
                </span>{' '}
                Esperando
              </div>
              <div className="p-2 bg-[#F5F5F7] rounded">
                <span className="font-medium text-[#1D1D1F]">
                  {todayAppointments.filter((a) => a.status === 'Agendada' || a.status === 'Confirmada').length}
                </span>{' '}
                Próximas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERFAZ 6: Modal — Registro de cliente sin cita */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1D1D1F]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#D1D1D6] max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-5 py-4 border-b border-[#E5E5EA] bg-[#F5F5F7] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#1D1D1F]">
                Registrar cliente sin cita
              </h3>
              <button
                onClick={() => { setShowModal(false); setErrorText(null); }}
                className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] bg-[#E5E5EA] px-2 py-0.5 rounded cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="p-5 space-y-4">
              {errorText && (
                <div className="bg-[#FF3B30]/5 text-[#FF3B30] border border-[#FF3B30]/15 p-3 rounded-lg text-xs flex items-center gap-2 animate-fade-in mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF3B30] shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={walkInFirstName}
                  onChange={(e) => setWalkInFirstName(e.target.value)}
                  placeholder="Ej. Juan"
                  className="w-full px-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={walkInLastName}
                  onChange={(e) => setWalkInLastName(e.target.value)}
                  placeholder="Ej. García"
                  className="w-full px-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                  Servicio solicitado *
                </label>
                <select
                  value={walkInServiceId}
                  onChange={(e) => setWalkInServiceId(e.target.value)}
                  className="w-full text-sm border border-[#D1D1D6] rounded-md py-2 px-3 bg-white text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                >
                  {sampleServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5EA]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D1D1D6] text-xs font-medium text-[#1D1D1F] rounded-md hover:bg-[#F5F5F7] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0071E3] text-white text-xs font-medium rounded-md hover:bg-[#005ebd] transition-all cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
