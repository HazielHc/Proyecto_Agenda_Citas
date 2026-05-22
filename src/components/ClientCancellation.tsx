import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Appointment } from '../types';
import { sampleServices, formatDateInSpanish } from '../data';
import { lookupPublicAppointments } from '../api';

interface ClientCancellationProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string, phone: string) => void | Promise<void>;
  businessName?: string;
}

export default function ClientCancellation({
  appointments,
  onCancelAppointment,
  businessName = 'AgendaBarber'
}: ClientCancellationProps) {
  const [phone, setPhone] = useState('');
  const [selectedAptId, setSelectedAptId] = useState('');
  const [foundAppointments, setFoundAppointments] = useState<Appointment[]>(appointments);
  const [step, setStep] = useState<'prompt' | 'success'>('prompt');
  const [errorText, setErrorText] = useState<string | null>(null);

  const normalizedPhone = phone.replace(/\D/g, '');
  const activeAppointments = useMemo(
    () =>
      foundAppointments.filter((appointment) => {
        const samePhone = appointment.phone.replace(/\D/g, '').endsWith(normalizedPhone);
        const cancellable =
          appointment.status === 'Agendada' || appointment.status === 'Confirmada';
        return normalizedPhone.length >= 4 && samePhone && cancellable;
      }),
    [foundAppointments, normalizedPhone]
  );

  const selectedApt = foundAppointments.find((appointment) => appointment.id === selectedAptId);
  const selectedService = selectedApt
    ? sampleServices.find((service) => service.id === selectedApt.serviceId)
    : null;

  const handleCancel = async () => {
    if (!selectedApt) return;
    setErrorText(null);
    try {
      await onCancelAppointment(selectedApt.id, selectedApt.phone);
      setStep('success');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'No se pudo cancelar la cita.');
    }
  };

  const handleLookup = async () => {
    setErrorText(null);
    const result = await lookupPublicAppointments(phone);
    setFoundAppointments(result.appointments);
    setSelectedAptId(result.appointments[0]?.id || '');
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#D1D1D6] rounded-xl p-6 md:p-8 space-y-6">
      <div className="border-b border-[#E5E5EA] pb-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-[#FF3B30] mb-1">
          Cancelacion de cita
        </p>
        <h1 className="text-2xl font-medium text-[#1D1D1F] tracking-tight">
          Gestion de cita
        </h1>
        <p className="text-sm text-[#6E6E73] mt-1">{businessName}</p>
      </div>

      {step === 'success' ? (
        <div className="text-center space-y-6 py-6">
          <div className="w-14 h-14 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[#1D1D1F]">Cita cancelada</h3>
            <p className="text-sm text-[#6E6E73] max-w-sm mx-auto">
              Tu cita ha sido cancelada y el horario quedo liberado.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1">
              Telefono con el que agendaste
            </label>
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setSelectedAptId('');
              }}
              placeholder="Ej. 55 1234 5678"
              className="w-full text-sm border border-[#D1D1D6] rounded-md py-2 px-3 bg-white text-[#1D1D1F]"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={normalizedPhone.length < 4}
              className="mt-2 w-full py-2 bg-[#0071E3] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-xs font-medium"
            >
              Buscar citas
            </button>
          </div>

          {activeAppointments.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                Cita a cancelar
              </label>
              <select
                value={selectedAptId}
                onChange={(event) => setSelectedAptId(event.target.value)}
                className="w-full text-sm border border-[#D1D1D6] rounded-md py-2 px-3 bg-white text-[#1D1D1F]"
              >
                <option value="">Selecciona una cita</option>
                {activeAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatDateInSpanish(appointment.date)} - {appointment.time} hrs
                  </option>
                ))}
              </select>
            </div>
          )}

          {normalizedPhone.length >= 4 && activeAppointments.length === 0 && (
            <p className="text-sm text-[#6E6E73] text-center py-4">
              No encontramos citas activas con ese telefono.
            </p>
          )}

          {selectedApt && (
            <div className="border border-[#D1D1D6] rounded-lg overflow-hidden bg-white">
              <div className="bg-[#F5F5F7] px-4 py-3 border-b border-[#E5E5EA]">
                <span className="text-xs font-medium text-[#1D1D1F]">Detalles de la reserva</span>
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
                  <span className="font-medium text-[#1D1D1F]">{formatDateInSpanish(selectedApt.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6E73]">Hora:</span>
                  <span className="font-medium text-[#1D1D1F]">{selectedApt.time} hrs</span>
                </div>
              </div>
            </div>
          )}

          {selectedApt && (
            <div className="flex gap-3 bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-4 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" />
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Esta accion es irreversible y liberara el horario para otro cliente.
              </p>
            </div>
          )}

          {errorText && <p className="text-xs text-[#FF3B30] text-center">{errorText}</p>}

          <button
            disabled={!selectedApt}
            onClick={handleCancel}
            className="w-full py-2.5 bg-[#FF3B30] disabled:opacity-40 disabled:cursor-not-allowed text-white hover:bg-[#d63028] text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cancelar cita
          </button>
        </div>
      )}
    </div>
  );
}
