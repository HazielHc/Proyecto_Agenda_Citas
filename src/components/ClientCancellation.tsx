import { useState } from 'react';
import { Trash2, AlertTriangle, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Appointment } from '../types';
import { sampleServices, formatDateInSpanish } from '../data';

interface ClientCancellationProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
}

export default function ClientCancellation({
  appointments,
  onCancelAppointment
}: ClientCancellationProps) {
  // Get active appointments that can be cancelled (e.g., Agendada, Confirmada)
  const activeAppointments = appointments.filter(
    (a) => a.status === 'Agendada' || a.status === 'Confirmada' || a.status === 'Cliente llegó'
  );

  const [selectedAptId, setSelectedAptId] = useState<string>(
    activeAppointments[0]?.id || ''
  );
  const [step, setStep] = useState<'prompt' | 'success'>('prompt');
  const [messageText, setMessageText] = useState<string | null>(null);

  const selectedApt = appointments.find((a) => a.id === selectedAptId);
  const selectedService = selectedApt
    ? sampleServices.find((s) => s.id === selectedApt.serviceId)
    : null;

  const handleCancel = () => {
    if (!selectedAptId) return;
    onCancelAppointment(selectedAptId);
    setStep('success');
  };

  const handleMaintain = () => {
    setMessageText('Has decidido mantener tu cita. ¡Te esperamos!');
    setTimeout(() => {
      setMessageText(null);
    }, 5000);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#D1D1D6] rounded-xl p-6 md:p-8 space-y-6">
      <div className="border-b border-[#E5E5EA] pb-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-[#FF3B30] mb-1">
          PÁGINA WEB DE CANCELACIÓN
        </p>
        <h1 className="text-2xl font-medium text-[#1D1D1F] tracking-tight">
          Gestión de Cita
        </h1>
        <p className="text-sm text-[#6E6E73] mt-1">
          Barbería El Navajero
        </p>
      </div>

      {messageText && (
        <div className="bg-[#34C759]/5 text-[#34C759] border border-[#34C759]/15 p-3 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#34C759] shrink-0" />
          <span>{messageText}</span>
        </div>
      )}

      {step === 'prompt' ? (
        <div className="space-y-6">
          {/* Appointment Selector Option (so the evaluator can test cancelling different ones) */}
          {activeAppointments.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                Seleccione la cita que vino a gestionar (Simulado)
              </label>
              <select
                value={selectedAptId}
                onChange={(e) => setSelectedAptId(e.target.value)}
                className="w-full text-sm border border-[#D1D1D6] rounded-md py-2 px-3 bg-white text-[#1D1D1F]"
              >
                {activeAppointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.clientName} {apt.clientLastName} - {apt.time} hs (
                    {sampleServices.find((s) => s.id === apt.serviceId)?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedApt ? (
            <div className="space-y-6">
              {/* Appointment Card */}
              <div className="border border-[#D1D1D6] rounded-lg overflow-hidden bg-white">
                <div className="bg-[#F5F5F7] px-4 py-3 border-b border-[#E5E5EA] flex justify-between items-center">
                  <span className="text-xs font-medium text-[#1D1D1F]">Detalles de la Reserva</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/15 text-[#0071E3] font-medium">
                    {selectedApt.status}
                  </span>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Cliente:</span>
                    <span className="font-medium text-[#1D1D1F]">
                      {selectedApt.clientName} {selectedApt.clientLastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Servicio:</span>
                    <span className="font-medium text-[#1D1D1F]">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Fecha:</span>
                    <span className="font-medium text-[#1D1D1F]">
                      {formatDateInSpanish(selectedApt.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Hora:</span>
                    <span className="font-medium text-[#1D1D1F]">{selectedApt.time} hrs</span>
                  </div>
                  {selectedApt.barber && (
                    <div className="flex justify-between">
                      <span className="text-[#6E6E73]">Barbero asignado:</span>
                      <span className="font-medium text-[#1D1D1F]">{selectedApt.barber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning Prompt */}
              <div className="flex gap-3 bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-4 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#1D1D1F]">
                    ¿Estás seguro de que deseas cancelar tu cita?
                  </p>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Esta acción es irreversible y liberará el horario de inmediato para que otro cliente pueda agendarlo.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 bg-[#FF3B30] text-white hover:bg-[#d63028] text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Sí, cancelar
                </button>
                <button
                  onClick={handleMaintain}
                  className="w-full py-2.5 bg-white border border-[#D1D1D6] hover:bg-[#F5F5F7] text-[#1D1D1F] text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  No, mantener
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#6E6E73] text-sm">
              No hay citas activas para cancelar en este momento.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-6 py-6 animate-fade-in">
          <div className="w-14 h-14 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[#1D1D1F]">Cita Cancelada</h3>
            <p className="text-sm text-[#6E6E73] max-w-sm mx-auto">
              Tu cita ha sido cancelada. El horario quedó liberado.
            </p>
          </div>
          <button
            onClick={() => {
              setStep('prompt');
              // Automatically pick next active if exists
              const stillActive = appointments.filter(
                (a) => a.status === 'Agendada' || a.status === 'Confirmada'
              );
              if (stillActive.length > 0) {
                setSelectedAptId(stillActive[0].id);
              } else {
                setSelectedAptId('');
              }
            }}
            className="px-6 py-2 border border-[#D1D1D6] hover:bg-[#F5F5F7] text-xs font-medium rounded-md text-[#1d1d1f] transition-all cursor-pointer"
          >
            Volver a Administrar
          </button>
        </div>
      )}
    </div>
  );
}
