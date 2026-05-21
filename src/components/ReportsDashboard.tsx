import { useState } from 'react';
import { Appointment } from '../types';
import { sampleServices } from '../data';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  TrendingUp,
  Award,
  CircleDot,
  BarChart,
  Grid
} from 'lucide-react';

interface ReportsDashboardProps {
  appointments: Appointment[];
}

export default function ReportsDashboard({ appointments }: ReportsDashboardProps) {
  const [period, setPeriod] = useState<'Día' | 'Semana' | 'Mes'>('Semana');

  // Compute live statistics based on current appointments
  const totalBooked = appointments.length;
  const totalCompleted = appointments.filter((a) => a.status === 'Completada').length;
  const totalCanceled = appointments.filter((a) => a.status === 'Cancelada').length;
  const totalNoShow = appointments.filter((a) => a.status === 'No asistió').length;

  // Period multipliers to simulate full data breadth
  const mult = period === 'Día' ? 1 : period === 'Semana' ? 6 : 24;

  const stats = {
    booked: totalBooked * mult,
    completed: totalCompleted * mult,
    canceled: totalCanceled * mult,
    noShow: totalNoShow * mult
  };

  // Group services
  const serviceCounts: { [id: string]: number } = {};
  appointments.forEach((a) => {
    serviceCounts[a.serviceId] = (serviceCounts[a.serviceId] || 0) + 1;
  });

  const popularServices = sampleServices
    .map((s) => ({
      name: s.name,
      count: (serviceCounts[s.id] || 0) * mult
    }))
    .sort((a, b) => b.count - a.count);

  // Simulated chart data values for Lun, Mar, Mié, Jue, Vie, Sáb, Dom
  const chartValues = [
    { day: 'Lun', bookings: Math.round(8 * (mult * 0.8)) },
    { day: 'Mar', bookings: Math.round(12 * (mult * 1.0)) },
    { day: 'Mié', bookings: Math.round(14 * (mult * 0.9)) },
    { day: 'Jue', bookings: Math.round(15 * (mult * 1.1)) },
    { day: 'Vie', bookings: Math.round(22 * (mult * 1.2)) },
    { day: 'Sáb', bookings: Math.round(18 * (mult * 1.1)) },
    { day: 'Dom', bookings: Math.round(2 * (mult * 0.4)) }
  ];

  const maxBookings = Math.max(...chartValues.map((v) => v.bookings)) || 1;

  // Punctuality indicators
  const compliance = {
    onTime: 85,
    delayed: 10,
    noShow: 5
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-2">
      {/* Header Banner & Period Tab Segment */}
      <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] font-medium text-[#0071E3] uppercase tracking-wider">
            ANALYTICS & INFORMES SENSITIVOS
          </p>
          <h1 className="text-xl font-medium text-[#1D1D1F] tracking-tight">
            Rendimiento del Negocio
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Plan Profesional habilitado • Resumen estadístico e indicadores clave.
          </p>
        </div>

        {/* apple-style Segmented Control */}
        <div className="bg-[#F5F5F7] border border-[#E5E5EA] p-1 rounded-lg flex items-center shrink-0">
          {(['Día', 'Semana', 'Mes'] as const).map((p) => {
            const isSelected = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#1D1D1F] border border-[#D1D1D6] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric summary boxes grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agendadas */}
        <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-[#6E6E73]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Citas Agendadas</span>
            <Calendar className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{stats.booked}</p>
            <p className="text-[10px] text-[#6E6E73] mt-1 flex items-center gap-1">
              <span className="text-[#34C759] font-medium">+12%</span> vs período anterior
            </p>
          </div>
        </div>

        {/* Completadas */}
        <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-[#6E6E73]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Completadas</span>
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{stats.completed}</p>
            <p className="text-[10px] text-[#6E6E73] mt-1 flex items-center gap-1">
              <span className="text-[#34C759] font-medium">+8%</span> tasa de conversión
            </p>
          </div>
        </div>

        {/* Canceladas */}
        <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-[#6E6E73]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Canceladas</span>
            <XCircle className="w-4 h-4 text-[#FF3B30]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{stats.canceled}</p>
            <p className="text-[10px] text-[#6E6E73] mt-1 flex items-center gap-1">
              <span className="text-[#FF3B30] font-medium">-2%</span> horas liberadas
            </p>
          </div>
        </div>

        {/* No asistidas */}
        <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-[#6E6E73]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">No Asistidas</span>
            <UserX className="w-4 h-4 text-[#FF3B30]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{stats.noShow}</p>
            <p className="text-[10px] text-[#6E6E73] mt-1 flex items-center gap-1">
              <span className="text-[#FF3B30] font-medium">3.5%</span> índice de inasistencia
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Citas por Día Bar chart */}
        <div className="lg:col-span-2 bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#1D1D1F]">
                Volumen de Citas por Día
              </h3>
              <p className="text-[11px] text-[#6E6E73]">
                Distribución de carga laboral acumulada durante este período.
              </p>
            </div>
          </div>

          {/* Manual SVG implementation for responsive Apple HIG bar charts */}
          <div className="space-y-2">
            <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 border-b border-[#E5E5EA] px-2">
              {chartValues.map((v) => {
                const heightPercent = `${Math.max(8, (v.bookings / maxBookings) * 80)}%`;
                return (
                  <div key={v.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip value */}
                    <span className="text-[10px] font-medium text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-opacity bg-[#F5F5F7] px-1.5 py-0.5 rounded border border-[#D1D1D6] -translate-y-1">
                      {v.bookings}
                    </span>
                    
                    {/* Flat bar */}
                    <div
                      style={{ height: heightPercent }}
                      className="w-full max-w-8 bg-[#0071E3] hover:bg-[#005ebd] rounded-t-sm transition-all duration-300 pointer-events-auto"
                    />
                    
                    {/* Day label */}
                    <span className="text-[10px] font-semibold text-[#6E6E73] mt-1">
                      {v.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Popular Services */}
        <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1D1D1F]">
              Servicios más solicitados
            </h3>
            <p className="text-[11px] text-[#6E6E73]">
              Ordenados por frecuencia de demanda.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {popularServices.map((service, idx) => {
              const percentages = totalBooked > 0 ? (service.count / (totalBooked * mult)) * 100 : 25;
              return (
                <div key={service.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                      {service.name}
                    </span>
                    <span className="text-[#6E6E73] font-medium">{service.count} pedidos</span>
                  </div>
                  {/* Flat progress bar */}
                  <div className="w-full bg-[#F5F5F7] rounded-full h-1.5 border border-[#E5E5EA]">
                    <div
                      style={{ width: `${percentages}%` }}
                      className="bg-[#0071E3] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower full width Block: Puntualidad */}
      <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-[#1D1D1F]">
            Métrica de Puntualidad & Asistencia
          </h3>
          <p className="text-[11px] text-[#6E6E73]">
            Promedio acumulado de llegada temprano o puntualidad de clientes a sus citas asignadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* A tiempo */}
          <div className="border border-[#E5E5EA] rounded-lg p-4 bg-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-sm shrink-0">
              85%
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                Llegadas A tiempo
              </p>
              <p className="text-[10px] text-[#6E6E73]">
                Clientes ingresando más o menos 5 minutos antes de su turno.
              </p>
            </div>
          </div>

          {/* Con retraso */}
          <div className="border border-[#E5E5EA] rounded-lg p-4 bg-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center font-bold text-sm shrink-0">
              10%
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                Con Demora / Retrasos
              </p>
              <p className="text-[10px] text-[#6E6E73]">
                Margen de gracia cubriendo demoras entre 5 a 15 minutos máximos.
              </p>
            </div>
          </div>

          {/* Inasistencia */}
          <div className="border border-[#E5E5EA] rounded-lg p-4 bg-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center font-bold text-sm shrink-0">
              5%
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                Ausencia Absoluta (No asistió)
              </p>
              <p className="text-[10px] text-[#6E6E73]">
                Citas desaprovechadas sin aviso previo por el cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
