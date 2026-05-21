import { Appointment, Service, BusinessPlan } from './types';

export const sampleServices: Service[] = [
  { id: '1', name: 'Corte de cabello', duration: 30 },
  { id: '2', name: 'Corte y barba', duration: 45 },
  { id: '3', name: 'Perfilado de barba', duration: 20 },
  { id: '4', name: 'Afeitado clásico', duration: 30 }
];

export const sampleBarbers = ['Carlos Mendoza', 'Héctor Ruiz'];

export const samplePlans: BusinessPlan[] = [
  {
    id: 'basico',
    name: 'Básico',
    price: '$299 MXN/mes',
    limits: '1 barbero • hasta 100 citas',
    details: ['1 barbero', 'Hasta 100 citas al mes', 'Soporte estándar', 'Sin reportes']
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: '$599 MXN/mes',
    limits: 'hasta 3 barberos • citas ilimitadas',
    details: ['Hasta 3 barberos', 'Citas ilimitadas', 'Soporte prioritario', 'Reportes de rendimiento']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$999 MXN/mes',
    limits: 'hasta 5 barberos • citas ilimitadas',
    details: ['Hasta 5 barberos', 'Citas ilimitadas', 'Módulo de comisiones', 'Reportes avanzados']
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Alejandro',
    clientLastName: 'Torres',
    phone: '55 1234 5678',
    serviceId: '2', // Corte y barba
    date: '2026-05-20', // TODAY
    time: '09:00',
    barber: 'Carlos Mendoza',
    status: 'Confirmada',
    pricePaid: 250
  },
  {
    id: 'apt-2',
    clientName: 'Iván',
    clientLastName: 'García',
    phone: '55 9876 5432',
    serviceId: '1', // Corte de cabello
    date: '2026-05-20',
    time: '10:00',
    barber: 'Héctor Ruiz',
    status: 'Cliente llegó',
    pricePaid: 180
  },
  {
    id: 'apt-3',
    clientName: 'Miguel Ángel',
    clientLastName: 'Reyes',
    phone: '55 4567 8901',
    serviceId: '4', // Afeitado clásico
    date: '2026-05-20',
    time: '11:00',
    barber: 'Carlos Mendoza',
    status: 'En servicio',
    elapsedTime: 247, // 4m 7s
    pricePaid: 200
  },
  {
    id: 'apt-4',
    clientName: 'Jorge',
    clientLastName: 'Herrera',
    phone: '55 3344 5566',
    serviceId: '3', // Perfilado de barba
    date: '2026-05-20',
    time: '13:00',
    barber: 'Héctor Ruiz',
    status: 'Completada',
    pricePaid: 150
  },
  {
    id: 'apt-5',
    clientName: 'Fernando',
    clientLastName: 'Gómez',
    phone: '55 6677 8899',
    serviceId: '1', // Corte de cabello
    date: '2026-05-20',
    time: '14:00',
    barber: 'Carlos Mendoza',
    status: 'Cancelada',
    pricePaid: 0
  },
  {
    id: 'apt-6',
    clientName: 'Juan',
    clientLastName: 'Pérez',
    phone: '600 000 000',
    serviceId: '1',
    date: '2026-05-20',
    time: '15:30',
    barber: 'Héctor Ruiz',
    status: 'Agendada',
    pricePaid: 180
  }
];

// Helper to format date cleanly in Spanish
export function formatDateInSpanish(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  
  const dateObj = new Date(year, month, day);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formatted = dateObj.toLocaleDateString('es-ES', options);
  
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
