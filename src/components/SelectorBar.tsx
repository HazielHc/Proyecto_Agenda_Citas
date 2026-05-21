import { useState } from 'react';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface SelectorBarProps {
  currentInterface: number;
  onSelectInterface: (num: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const interfacesList = [
  { id: 1, label: '1. Agendado de Cita', role: 'Cliente' },
  { id: 2, label: '2. Cancelacíon de Cita', role: 'Cliente' },
  { id: 3, label: '3. Inicio de Sesión', role: 'Dashboard / Acceso' },
  { id: 4, label: '4. Registro de Negocio', role: 'Dashboard / Registro' },
  { id: 5, label: '5. Agenda del Día', role: 'Dashboard / Principal' },
  { id: 7, label: '7. Lista de Clientes', role: 'Dashboard / Catálogo' },
  { id: 8, label: '8. Reportes', role: 'Dashboard / Analytics' },
  { id: 9, label: '9. Flujo de WhatsApp', role: 'Mockup Visual' }
];

export default function SelectorBar({
  currentInterface,
  onSelectInterface,
  collapsed,
  onToggleCollapse
}: SelectorBarProps) {
  return (
    <div
      className={`bg-white border-b border-[#D1D1D6] transition-all duration-300 ${
        collapsed ? 'h-10' : 'py-2.5 px-4'
      } flex flex-col justify-center relative z-50`}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#0071E3] text-white p-1 rounded-md">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-medium text-xs text-[#1D1D1F] tracking-tight hidden sm:inline">
            AgendaBarber Prototipo
          </span>
          <span className="bg-[#F5F5F7] text-[#6E6E73] text-[9px] px-1.5 py-0.5 rounded border border-[#E5E5EA]">
            HIG-SPEC
          </span>
        </div>

        {!collapsed && (
          <div className="flex flex-wrap gap-1 px-2 justify-center items-center flex-1 max-h-24 overflow-y-auto">
            {interfacesList.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectInterface(item.id)}
                className={`px-2.5 py-1 text-[11px] rounded-full transition-all duration-150 border font-medium ${
                  currentInterface === item.id
                    ? 'bg-[#0071E3] text-white border-[#0071E3]'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] border-[#E5E5EA] hover:bg-[#E5E5EA]'
                }`}
                title={`${item.label} (${item.role})`}
              >
                {item.id === 5 ? '5 & 6. Agenda / Registro Express' : item.label}
              </button>
            ))}
          </div>
        )}

        {collapsed && (
          <div className="flex items-center gap-2 text-xs text-[#6E6E73]">
            <span>Visualizando:</span>
            <span className="font-semibold text-[#1D1D1F]">
              {interfacesList.find((i) => i.id === currentInterface)?.label || 'Agenda del Día'}
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-[#6E6E73] hover:text-[#1D1D1F] bg-[#F5F5F7] border border-[#E5E5EA] rounded-md transition-colors font-medium cursor-pointer"
        >
          {collapsed ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Mostrar Control</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ocultar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
