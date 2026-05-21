import { useState } from 'react';
import { Appointment } from '../types';
import { sampleServices, formatDateInSpanish } from '../data';
import { Search, Phone, Calendar, User, ChevronRight, X, Clock } from 'lucide-react';

interface ClientsListProps {
  appointments: Appointment[];
}

interface ClientRecord {
  clientName: string;
  clientLastName: string;
  phone: string;
  totalAppointments: number;
  lastVisitDate: string;
  history: Appointment[];
}

export default function ClientsList({ appointments }: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientPhone, setSelectedClientPhone] = useState<string>('');

  // Extract unique clients based on name + phone
  const clientsMap: { [key: string]: ClientRecord } = {};

  appointments.forEach((apt) => {
    // Treat Name + Phone as key. Strip spaces for comparison
    const key = `${apt.clientName.toLowerCase()}_${apt.clientLastName.toLowerCase()}_${apt.phone.replace(/\s+/g, '')}`;

    if (!clientsMap[key]) {
      clientsMap[key] = {
        clientName: apt.clientName,
        clientLastName: apt.clientLastName,
        phone: apt.phone,
        totalAppointments: 0,
        lastVisitDate: '',
        history: []
      };
    }

    const rec = clientsMap[key];
    rec.totalAppointments += 1;
    rec.history.push(apt);

    // Keep track of latest visit (biggest Date, or largest date+time)
    if (!rec.lastVisitDate || apt.date > rec.lastVisitDate) {
      rec.lastVisitDate = apt.date;
    }
  });

  // Sort history newest to oldest for selected client
  Object.values(clientsMap).forEach((c) => {
    c.history.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  });

  const clientsList = Object.values(clientsMap);

  // Filter list with research term
  const filteredClients = clientsList.filter((c) => {
    const fullName = `${c.clientName} ${c.clientLastName}`.toLowerCase();
    const phone = c.phone.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || phone.includes(term);
  });

  // Select first client by default if none selected and records exist
  const selectedClient = clientsList.find(
    (c) => c.phone === selectedClientPhone
  ) || null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pt-2">
      {/* Search Header Banner */}
      <div className="bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-4">
        <div>
          <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wider">
            MÓDULO DE CLIENTES (ADMINISTRADOR)
          </p>
          <h1 className="text-xl font-medium text-[#1D1D1F] tracking-tight">
            Tarjetas de Cliente e Historial
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Consulte la frecuencia de visitas, servicios preferidos y bitácora de asistencia de su clientela.
          </p>
        </div>

        {/* Live Search bar */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6E6E73]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre completo o teléfono..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D1D1D6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] bg-white text-[#1D1D1F]"
          />
        </div>
      </div>

      {/* Main Grid: Left is list, Right is expandable detail pane */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Client Table */}
        <div className={`bg-white border border-[#D1D1D6] rounded-xl overflow-hidden ${
          selectedClient ? 'md:col-span-7' : 'md:col-span-12'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1D1D1F]">
              <thead className="bg-[#F5F5F7] text-[#6E6E73] font-medium text-[10px] uppercase border-b border-[#E5E5EA]">
                <tr>
                  <th className="px-5 py-3">Nombre Completo</th>
                  <th className="px-5 py-3">Teléfono</th>
                  <th className="px-5 py-3 text-center">Citas</th>
                  <th className="px-5 py-3">Última Visita</th>
                  <th className="px-3 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA]">
                {filteredClients.map((client) => {
                  const isCurSelected = selectedClient?.phone === client.phone;
                  return (
                    <tr
                      key={client.phone}
                      onClick={() => setSelectedClientPhone(client.phone)}
                      className={`hover:bg-[#F5F5F7]/80 cursor-pointer transition-colors ${
                        isCurSelected ? 'bg-[#0071E3]/5 font-medium' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#F5F5F7] text-[#6E6E73] rounded-full flex items-center justify-center text-[10px] uppercase font-semibold border border-[#E5E5EA]">
                            {client.clientName.charAt(0)}
                            {client.clientLastName.charAt(0)}
                          </div>
                          <span>
                            {client.clientName} {client.clientLastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#6E6E73]">{client.phone}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="bg-[#F5F5F7] border border-[#E5E5EA] px-2 py-0.5 rounded-full text-[11px]">
                          {client.totalAppointments}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#6E6E73]">
                        {client.lastVisitDate
                          ? formatDateInSpanish(client.lastVisitDate).replace(
                              /^[a-z]+, /,
                              ''
                            )
                          : 'Sin fecha'}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <ChevronRight className={`w-4 h-4 text-[#6E6E73] transition-transform ${
                          isCurSelected ? 'translate-x-1 text-[#0071E3]' : ''
                        }`} />
                      </td>
                    </tr>
                  );
                })}

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#6E6E73]">
                      No se encontraron registros de clientes con el criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Expansive History Drawer */}
        {selectedClient && (
          <div className="md:col-span-12 lg:col-span-5 bg-white border border-[#D1D1D6] rounded-xl p-5 space-y-5 h-fit">
            <div className="flex justify-between items-start border-b border-[#E5E5EA] pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-[#0071E3] uppercase tracking-widest">
                  EXPEDIENTE DE CLIENTE
                </span>
                <h3 className="text-base font-medium text-[#1D1D1F]">
                  {selectedClient.clientName} {selectedClient.clientLastName}
                </h3>
                <p className="text-xs text-[#6E6E73] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedClient.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientPhone('')}
                className="text-[#6E6E73] hover:text-[#1D1D1F] p-1 bg-[#F5F5F7] rounded-full border border-[#E5E5EA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Statistics Block */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg p-3">
                <span className="text-[#6E6E73] block text-[10px] uppercase">Citas Totales</span>
                <span className="text-lg font-medium text-[#1D1D1F]">{selectedClient.totalAppointments} Citas</span>
              </div>
              <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg p-3">
                <span className="text-[#6E6E73] block text-[10px] uppercase">Última Visita</span>
                <span className="text-xs font-medium text-[#1D1D1F] block truncate mt-1">
                  {selectedClient.lastVisitDate
                    ? formatDateInSpanish(selectedClient.lastVisitDate).replace(
                        /^[a-z]+, /,
                        ''
                      )
                    : 'Ninguna'}
                </span>
              </div>
            </div>

            {/* Event Timeline list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">
                HISTORIAL DE VISITAS
              </h4>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {selectedClient.history.map((apt) => {
                  const service = sampleServices.find((s) => s.id === apt.serviceId);
                  
                  return (
                    <div
                      key={apt.id}
                      className="border border-[#E5E5EA] rounded-lg p-3.5 space-y-2 bg-white text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#1D1D1F]">
                          {formatDateInSpanish(apt.date).replace(/^[a-z]+, /, '')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase ${
                          apt.status === 'Completada'
                            ? 'bg-[#34C759] text-white'
                            : apt.status === 'Cancelada' || apt.status === 'No asistió'
                            ? 'bg-[#FF3B30] text-white'
                            : 'bg-[#F2F3FD] text-[#0071E3] border border-[#D1D1D6]'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-[#6E6E73] space-y-1">
                        <p className="flex justify-between">
                          <span>Servicio:</span>
                          <span className="text-[#1D1D1F] font-medium">{service?.name}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Hora de cita:</span>
                          <span className="text-[#1D1D1F] font-medium">{apt.time} hs</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Barbero asignado:</span>
                          <span className="text-[#1D1D1F] font-medium">{apt.barber}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
