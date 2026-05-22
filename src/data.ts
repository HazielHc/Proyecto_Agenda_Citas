import { Service, BusinessPlan } from './types';

export const sampleServices: Service[] = [
  { id: '1', name: 'Corte de cabello', duration: 30 },
  { id: '2', name: 'Corte y barba', duration: 45 },
  { id: '3', name: 'Perfilado de barba', duration: 20 },
  { id: '4', name: 'Afeitado clasico', duration: 30 }
];

export const samplePlans: BusinessPlan[] = [
  {
    id: 'basico',
    name: 'Basico',
    price: '$299 MXN/mes',
    limits: '1 barbero, hasta 100 citas',
    details: ['1 barbero', 'Hasta 100 citas al mes', 'Soporte estandar', 'Sin reportes']
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: '$599 MXN/mes',
    limits: 'hasta 3 barberos, citas ilimitadas',
    details: ['Hasta 3 barberos', 'Citas ilimitadas', 'Soporte prioritario', 'Reportes de rendimiento']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$999 MXN/mes',
    limits: 'hasta 5 barberos, citas ilimitadas',
    details: ['Hasta 5 barberos', 'Citas ilimitadas', 'Modulo de comisiones', 'Reportes avanzados']
  }
];

export function formatDateInSpanish(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  const formatted = dateObj.toLocaleDateString('es-MX', options);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
