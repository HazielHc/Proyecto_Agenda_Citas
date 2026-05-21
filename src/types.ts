export type AppointmentStatus =
  | 'Agendada'
  | 'Confirmada'
  | 'Cliente llegó'
  | 'En servicio'
  | 'Completada'
  | 'No asistió'
  | 'Cancelada';

export interface Appointment {
  id: string;
  clientName: string;
  clientLastName: string;
  phone: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  barber: string;
  status: AppointmentStatus;
  elapsedTime?: number; // in seconds, if 'En servicio'
  pricePaid?: number; // for reports
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
}

export interface BusinessPlan {
  id: string;
  name: string;
  price: string;
  limits: string;
  details: string[];
}
