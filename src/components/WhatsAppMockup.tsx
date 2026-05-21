import { useState, useEffect, useRef } from 'react';
import { Send, CheckCheck, Phone, Video, MoreVertical, Smartphone, Play, RotateCcw, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'bot' | 'client';
  text: string;
  time: string;
}

const stepsMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'bot',
    text: '¡Hola! 💈 Bienvenido a AgendaBarber El Navajero. ¿Qué servicio deseas agendar hoy?\n\n• Corte de cabello\n• Corte y barba\n• Perfilado de barba\n• Afeitado clásico',
    time: '15:16'
  },
  {
    id: 2,
    sender: 'client',
    text: 'Hola, un Corte y barba por favor.',
    time: '15:17'
  },
  {
    id: 3,
    sender: 'bot',
    text: 'Perfecto. Tenemos disponibilidad para hoy con Carlos Mendoza en los siguientes horarios:\n\n1) 15:30 hrs\n2) 16:30 hrs\n3) 17:30 hrs\n\n¿Cuál opción prefieres? Por favor responde con el número.',
    time: '15:17'
  },
  {
    id: 4,
    sender: 'client',
    text: 'La opción 1, a las 15:30 por favor.',
    time: '15:18'
  },
  {
    id: 5,
    sender: 'bot',
    text: 'Excelente elección. Para finalizar el registro, ¿podrías indicarme tu Nombre y Apellido?',
    time: '15:18'
  },
  {
    id: 6,
    sender: 'client',
    text: 'Juan Pérez',
    time: '15:19'
  },
  {
    id: 7,
    sender: 'bot',
    text: '¡Listo, Juan! Cita agendada correctamente:\n\n• Servicio: Corte y barba\n• Fecha: Miércoles 20 de Mayo\n• Hora: 15:30 hrs\n• Barbero: Carlos Mendoza\n\nTe esperamos puntualmente.',
    time: '15:19'
  },
  {
    id: 8,
    sender: 'bot',
    text: 'Si necesitas cancelar o reprogramar tu cita, puedes hacerlo ingresando al siguiente enlace hasta 2 horas antes de tu compromiso: https://agendabarber.la/cancelar?id=apt-6\n\n¡Que tengas un excelente día!',
    time: '15:20'
  }
];

export default function WhatsAppMockup() {
  const [visibleSteps, setVisibleSteps] = useState<number>(stepsMessages.length);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleSteps]);

  const handleSimulate = () => {
    setVisibleSteps(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && visibleSteps < stepsMessages.length) {
      const timer = setTimeout(() => {
        setVisibleSteps((prev) => prev + 1);
      }, 1800);
      return () => clearTimeout(timer);
    } else if (visibleSteps === stepsMessages.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, visibleSteps]);

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
      {/* Description sidebar and commands */}
      <div className="md:col-span-5 space-y-5 bg-white border border-[#D1D1D6] rounded-xl p-6 h-fit">
        <div>
          <span className="text-[10px] font-bold text-[#34C759] uppercase tracking-wider">
            MOCKUP INTEGRADO
          </span>
          <h1 className="text-xl font-medium text-[#1D1D1F] tracking-tight">
            Flujo de Conversación de WhatsApp
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1 pr-2">
            Simula la automatización real del Agente Inteligente (chatbot) que interactúa con el cliente final para agendar citas directamente por mensajería.
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#E5E5EA]">
          <p className="text-xs font-semibold text-[#1D1D1F]">
            Opciones de simulación:
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSimulate}
              disabled={isPlaying}
              className={`py-2 px-3 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-[#F5F5F7] text-[#D1D1D6] cursor-not-allowed border border-[#E5E5EA]'
                  : 'bg-[#34C759] text-white hover:bg-[#2da94d]'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Simular conversación de cero</span>
            </button>
            <button
              onClick={() => {
                setVisibleSteps(stepsMessages.length);
                setIsPlaying(false);
              }}
              className="py-2 px-4 border border-[#D1D1D6] hover:bg-[#F5F5F7] text-xs font-medium rounded-lg text-[#1D1D1F] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#6E6E73]" />
              <span>Restablecer flujo completo</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Flow Guidelines list */}
        <div className="bg-[#F5F5F7] rounded-lg p-4 border border-[#E5E5EA] space-y-2 text-xs">
          <p className="font-semibold text-[#1D1D1F] text-[11px] uppercase">
            Ventajas del canal:
          </p>
          <ul className="space-y-1.5 text-[#6E6E73] list-disc list-inside">
            <li>Auto-provisión de citas 24/7 sin llamadas humanas.</li>
            <li>Configura automáticamente los horarios libres.</li>
            <li>Enlace automático de cancelación (re-direct a Interfaz 2).</li>
            <li>Mensaje final formal con instrucciones.</li>
          </ul>
        </div>
      </div>

      {/* Main Column - Phone Frame Mockup container */}
      <div className="md:col-span-7 flex justify-center">
        {/* Apple Phone Shell */}
        <div className="w-full max-w-[340px] aspect-[9/18.5] bg-[#EFEAE2] border-[10px] border-[#1D1D1F] rounded-[40px] shadow-xl overflow-hidden flex flex-col relative">
          
          {/* Status bar */}
          <div className="bg-[#075E54] h-7 px-5 flex justify-between items-center text-white text-[10px] select-none font-medium shrink-0">
            <span>15:16</span>
            <div className="flex items-center gap-1 opacity-90">
              <span className="text-[9px]">4G</span>
              <div className="w-4 h-2 border border-white rounded-[2px] p-[1px] flex items-center">
                <div className="bg-white h-full w-full rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* WhatsApp Header block */}
          <div className="bg-[#075E54] px-3 py-1.5 flex items-center justify-between text-white shadow-sm shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-[30px] h-[30px] rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-xs text-white border border-white/20 uppercase shrink-0">
                B
              </div>
              <div className="leading-tight">
                <h4 className="font-semibold text-xs text-white truncate max-w-[130px]">
                  BarberIA El Navajero
                </h4>
                <p className="text-[9px] text-white/80">en línea</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 opacity-90 text-white">
              <Video className="w-3.5 h-3.5" />
              <Phone className="w-3.5 h-3.5" />
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Message List area with customized scrollbar */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 relative flex flex-col pt-4">
            {/* WhatsApp Chat Wall Background pattern element */}
            <div className="absolute inset-0 bg-[radial-gradient(#cfd5db_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            <div className="mx-auto bg-white/70 backdrop-blur-xs text-[#6E6E73] text-[9px] px-2.5 py-0.5 rounded-md border border-[#E5E5EA] shadow-xs uppercase font-medium self-center select-none mb-2 z-10">
              Hoy
            </div>

            {stepsMessages.slice(0, visibleSteps).map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col z-10 max-w-[85%] ${
                    isBot ? 'self-start items-start' : 'self-end items-end'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg text-[11.5px] shadow-xs relative leading-relaxed whitespace-pre-wrap ${
                      isBot
                        ? 'bg-white text-[#1D1D1F] rounded-tl-none border border-[#E5E5EA]'
                        : 'bg-[#DCF8C6] text-[#1D1D1F] rounded-tr-none'
                    }`}
                  >
                    {msg.text}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[8.5px] text-[#6E6E73] font-mono select-none">
                      <span>{msg.time}</span>
                      {!isBot && <CheckCheck className="w-3 h-3 text-[#34B7F1]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Simulated typing indicator */}
            {isPlaying && visibleSteps < stepsMessages.length && (
              <div className="bg-white border border-[#E5E5EA] text-[#6E6E73] text-[10px] px-3 py-1.5 rounded-lg rounded-tl-none shadow-xs self-start flex items-center gap-1.5 z-10 select-none">
                <span className="font-semibold text-[#1D1D1F]">Bot está escribiendo</span>
                <span className="flex gap-0.5 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#6E6E73] animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-[#6E6E73] animate-bounce delay-100" />
                  <span className="w-1 h-1 rounded-full bg-[#6E6E73] animate-bounce delay-200" />
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Fake active input footer */}
          <div className="bg-[#ECE5DD] p-1.5 flex items-center gap-1 border-t border-black/5 shrink-0 select-none pb-4">
            <div className="flex-1 bg-white rounded-full h-8 flex items-center px-3 gap-2 border border-black/5">
              <span className="text-[#6E6E73] text-[11px] flex-1">Escribe un mensaje</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center text-white shadow-xs">
              <Send className="w-3.5 h-3.5 translate-x-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
