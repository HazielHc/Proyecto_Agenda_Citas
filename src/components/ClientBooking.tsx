import { useState, FormEvent } from 'react';
import { Calendar, Clock, Check, Phone, User, Landmark, AlertTriangle } from 'lucide-react';
import { Service, Appointment } from '../types';
import { sampleServices, formatDateInSpanish } from '../data';

interface ClientBookingProps {
  onAddAppointment: (apt: Appointment) => void;
  appointments: Appointment[];
}

export default function ClientBooking({ onAddAppointment, appointments }: ClientBookingProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(sampleServices[0].id);
  const [selectedDay, setSelectedDay] = useState<number>(20); // Default to today 20
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Calendar setup for May 2026
  // May 1st 2026 is a Friday.
  // We'll generate a grid of 31 days.
  const totalDays = 31;
  const firstDayIndex = 5; // Friday (0 = Sun, 1 = Mon, ..., 5 = Fri)

  // Some days are unavailable for simulation
  const unavailableDays = [3, 10, 17, 24, 31, 2, 9, 16]; // Sundays and Saturdays

  // Slots for the selected day
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:30', '16:30', '17:30'];

  const isTimeOccupied = (time: string, dayNum: number) => {
    // Check if there is an active appointment at that time on 2026-05-[dayNum]
    const dateStr = `2026-05-${dayNum.toString().padStart(2, '0')}`;
    return appointments.some(
      (a) => a.date === dateStr && a.time === time && a.status !== 'Cancelada'
    );
  };

  const handleBook = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedDay || !selectedTime || !firstName || !lastName || !phone) {
      setErrorText('Por favor complete todos los campos, seleccione fecha, hora y servicio.');
      return;
    }

    setErrorText(null);
    const dateStr = `2026-05-${selectedDay.toString().padStart(2, '0')}`;
    const newApt: Appointment = {
      id: `apt-user-${Date.now()}`,
      clientName: firstName,
      clientLastName: lastName,
      phone,
      serviceId: selectedServiceId,
      date: dateStr,
      time: selectedTime,
      barber: 'Carlos Mendoza', // Default assigned barber
      status: 'Agendada',
      pricePaid: selectedServiceId === '1' ? 180 : selectedServiceId === '2' ? 250 : selectedServiceId === '3' ? 150 : 200
    };

    onAddAppointment(newApt);
    setConfirmedApt(newApt);
    setIsConfirmed(true);

    // Reset inputs
    setFirstName('');
    setLastName('');
    setPhone('');
    setSelectedTime('');
  };

  const selectedService = sampleServices.find((s) => s.id === selectedServiceId);

  if (isConfirmed && confirmedApt) {
    const aptService = sampleServices.find((s) => s.id === confirmedApt.serviceId);
    return (
      <div className="w-full max-w-lg mx-auto bg-white border border-[#D1D1D6] rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-[#34C759] text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-medium text-[#1D1D1F] tracking-tight mb-2">
          ¡Cita Confirmada Exitosamente!
        </h2>
        <p className="text-sm text-[#6E6E73] mb-8">
          Su reserva ha sido registrada en nuestro sistema y el horario ha quedado asegurado.
        </p>

        <div className="bg-[#F5F5F7] rounded-lg p-5 text-left border border-[#E5E5EA] mb-8 space-y-3">
          <div className="flex justify-between border-b border-[#E5E5EA] pb-2">
            <span className="text-xs text-[#6E6E73]">Negocio</span>
            <span className="text-xs font-medium text-[#1D1D1F]">Barbería El Navajero</span>
          </div>
          <div className="flex justify-between border-b border-[#E5E5EA] pb-2">
            <span className="text-xs text-[#6E6E73]">Servicio</span>
            <span className="text-xs font-medium text-[#1D1D1F]">{aptService?.name}</span>
          </div>
          <div className="flex justify-between border-b border-[#E5E5EA] pb-2">
            <span className="text-xs text-[#6E6E73]">Fecha</span>
            <span className="text-xs font-medium text-[#1D1D1F]">
              {formatDateInSpanish(confirmedApt.date)}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#E5E5EA] pb-2">
            <span className="text-xs text-[#6E6E73]">Hora</span>
            <span className="text-xs font-medium text-[#1D1D1F]">{confirmedApt.time} hrs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[#6E6E73]">Cliente</span>
            <span className="text-xs font-medium text-[#1D1D1F]">
              {confirmedApt.clientName} {confirmedApt.clientLastName}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsConfirmed(false)}
          className="w-full py-3 bg-[#0071E3] text-white rounded-lg text-sm font-medium hover:bg-[#005ebd] transition-colors cursor-pointer"
        >
          Agendar Otra Cita
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
      <div className="md:col-span-7 bg-white border border-[#D1D1D6] rounded-xl p-6 md:p-8 space-y-8">
        {/* Name Header */}
        <div className="border-b border-[#E5E5EA] pb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#6E6E73] mb-1">
            PÁGINA WEB DE CLIENTES
          </p>
          <h1 className="text-2xl font-medium text-[#1D1D1F] tracking-tight">
            Barbería El Navajero
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1">
            Reserve su cita de forma ágil y segura en solo unos pasos.
          </p>
        </div>

        {/* 1. Seleccione Servicio */}
        <div>
          <h3 className="text-sm font-medium text-[#1D1D1F] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#F5F5F7] border border-[#D1D1D6] text-[11px] text-[#1D1D1F] rounded-full flex items-center justify-center font-bold">
              1
            </span>
            Seleccione el servicio
          </h3>
          <div className="space-y-2">
            {sampleServices.map((service) => (
              <label
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedServiceId === service.id
                    ? 'border-[#0071E3] bg-[#0071E3]/5'
                    : 'border-[#E5E5EA] hover:bg-[#F5F5F7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedServiceId === service.id
                        ? 'border-[#0071E3]'
                        : 'border-[#D1D1D6]'
                    }`}
                  >
                    {selectedServiceId === service.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1D1D1F]">{service.name}</p>
                    <p className="text-xs text-[#6E6E73]">{service.duration} mins de duración</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Calendario Visual */}
        <div>
          <h3 className="text-sm font-medium text-[#1D1D1F] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#F5F5F7] border border-[#D1D1D6] text-[11px] text-[#1D1D1F] rounded-full flex items-center justify-center font-bold">
              2
            </span>
            Seleccione el día
          </h3>
          <div className="border border-[#E5E5EA] rounded-lg p-4 bg-white">
            <div className="text-center font-medium text-xs text-[#1D1D1F] mb-3">
              Mayo de 2026
            </div>
            
            {/* Days indices */}
            <div className="grid grid-cols-7 text-center text-[10px] text-[#6E6E73] font-medium mb-2">
              <span>LUN</span>
              <span>MAR</span>
              <span>MIÉ</span>
              <span>JUE</span>
              <span>VIE</span>
              <span>SÁB</span>
              <span>DOM</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty gaps for start day */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day slots */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const isUnavailable = unavailableDays.includes(dayNum);
                const isSelected = selectedDay === dayNum;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => {
                      setSelectedDay(dayNum);
                      setSelectedTime('');
                    }}
                    className={`h-9 w-9 mx-auto rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer ${
                      isUnavailable
                        ? 'text-[#E5E5EA] bg-transparent cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#0071E3] text-white font-medium'
                        : 'text-[#1D1D1F] hover:bg-[#F5F5F7] border border-transparent'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Seleccionar Hora */}
        <div>
          <h3 className="text-sm font-medium text-[#1D1D1F] mb-1 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#F5F5F7] border border-[#D1D1D6] text-[11px] text-[#1D1D1F] rounded-full flex items-center justify-center font-bold">
              3
            </span>
            Horario disponible
          </h3>
          <p className="text-xs text-[#6E6E73] pl-7 mb-3">
            Mostrando horarios para el día {selectedDay} de Mayo, 2026
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map((time) => {
              const occupied = isTimeOccupied(time, selectedDay);
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  type="button"
                  disabled={occupied}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-3 text-xs rounded-md text-center border font-medium transition-all cursor-pointer ${
                    occupied
                      ? 'bg-[#F5F5F7] text-[#D1D1D6] border-[#E5E5EA] cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-[#0071E3] text-white border-[#0071E3]'
                      : 'bg-white text-[#1D1D1F] border-[#D1D1D6] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {time} hs
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Form for Details */}
      <div className="md:col-span-5 space-y-6">
        <div className="bg-white border border-[#D1D1D6] rounded-xl p-6">
          <h2 className="text-base font-medium text-[#1D1D1F] mb-4">
            Resumen & Sus Datos
          </h2>

          {errorText && (
            <div className="mb-4 bg-[#FF3B30]/5 text-[#FF3B30] border border-[#FF3B30]/15 p-3 rounded-lg text-xs flex items-start gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-4">
            {/* Service & Date summary box */}
            <div className="bg-[#F5F5F7] rounded-lg p-4 border border-[#E5E5EA] text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Servicio Seleccionado</span>
                <span className="font-medium text-[#1D1D1F]">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Duración</span>
                <span className="font-medium text-[#1D1D1F]">{selectedService?.duration} minutos</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E5EA] pt-2 mt-2">
                <span className="text-[#6E6E73]">Fecha</span>
                <span className="font-medium text-[#1D1D1F]">
                  {formatDateInSpanish(`2026-05-${selectedDay.toString().padStart(2, '0')}`)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Hora</span>
                <span className="font-medium text-[#0071E3]">
                  {selectedTime ? `${selectedTime} hrs` : 'No seleccionada'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                Nombre *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E6E73]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Alejandro"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                Apellido *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E6E73]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Torres"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1">
                Número de teléfono *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E6E73]">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#D1D1D6] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedTime || !firstName || !lastName || !phone}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors mt-6 flex items-center justify-center gap-2 cursor-pointer ${
                selectedTime && firstName && lastName && phone
                  ? 'bg-[#0071E3] text-white hover:bg-[#005ebd]'
                  : 'bg-[#F5F5F7] text-[#D1D1D6] border border-[#E5E5EA] cursor-not-allowed'
              }`}
            >
              Confirmar Cita
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
