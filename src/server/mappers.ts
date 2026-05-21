import type { AppointmentStatus as UiStatus } from '../types';

export const services = [
  { id: '1', name: 'Corte de cabello', duration: 30, price: 180 },
  { id: '2', name: 'Corte y barba', duration: 45, price: 250 },
  { id: '3', name: 'Perfilado de barba', duration: 20, price: 150 },
  { id: '4', name: 'Afeitado clasico', duration: 30, price: 200 }
];

export const uiStatusToDb: Record<UiStatus, string> = {
  Agendada: 'agendada',
  Confirmada: 'confirmada',
  'Cliente llegó': 'llegada',
  'En servicio': 'en_servicio',
  Completada: 'completada',
  'No asistió': 'no_asistio',
  Cancelada: 'cancelada'
};

export const dbStatusToUi: Record<string, UiStatus> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  llegada: 'Cliente llegó',
  en_servicio: 'En servicio',
  completada: 'Completada',
  no_asistio: 'No asistió',
  cancelada: 'Cancelada'
};

export function splitDateTime(date: Date) {
  const iso = date.toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 16)
  };
}

export function toScheduledAt(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`);
}

export function getServiceById(serviceId: string) {
  return services.find((service) => service.id === serviceId || service.name === serviceId) ?? services[0];
}
