import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, ArrowLeft, RefreshCw, MessageSquare, ShieldAlert } from 'lucide-react';
import { sendWhatsAppMessage, fetchPublicBusiness } from '../api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function WhatsAppSimulator() {
  const [phone, setPhone] = useState('5512345678');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Bienvenido al asistente virtual de la barbería. ¿En qué te puedo ayudar hoy? Puedes preguntarme por nuestros servicios, precios o solicitar una cita.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState('Barbería');
  const [errorMessage, setErrorMessage] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar el nombre del negocio al montar el componente
    fetchPublicBusiness()
      .then(({ business }) => {
        if (business) {
          setBusinessName(business.name);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    // Scroll automático al último mensaje
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    setErrorMessage('');

    // Crear el mensaje del usuario localmente
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Hacer la llamada a la API
      const result = await sendWhatsAppMessage(phone, userText);

      // Crear el mensaje del bot
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al comunicarse con el chatbot.');
      
      // Mostrar un mensaje de error en la burbuja
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: '❌ Lo siento, ocurrió un error en mi sistema. Por favor, asegúrate de que el backend esté ejecutándose y configurado con un GEMINI_API_KEY válido.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Para reiniciar el chat, enviamos una instrucción especial al backend o limpiamos localmente
      await sendWhatsAppMessage(phone, '__RESET_SESSION__');
      
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `¡Chat reiniciado! Hola, soy el asistente virtual de ${businessName}. ¿En qué te puedo colaborar hoy?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setErrorMessage('No se pudo reiniciar el chat en el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickOption = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-xl border border-[#D1D1D6] overflow-hidden flex flex-col md:flex-row">
      {/* Panel de Configuración Lateral */}
      <div className="w-full md:w-80 bg-[#F5F5F7] border-b md:border-b-0 md:border-r border-[#D1D1D6] p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-1 hover:bg-[#E5E5EA] rounded-full transition-colors cursor-pointer text-[#0071E3]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-[#1D1D1F] tracking-tight">Simulador IA</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-xs text-blue-800 leading-relaxed flex gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-1">Simulación del Bot de WhatsApp</strong>
              Este módulo interactúa con la API de Gemini para interpretar lenguaje natural y agendar de forma automática las citas en tu base de datos SQLite.
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6E6E73] mb-1.5 uppercase tracking-wider">
                Número de Teléfono Simulador
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej. 5512345678"
                className="w-full px-3 py-2 text-sm bg-white border border-[#D1D1D6] rounded-lg focus:outline-none focus:border-[#0071E3] font-mono"
              />
              <p className="text-[10px] text-[#86868B] mt-1">
                Cambia el número para simular que chatea un cliente diferente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6E6E73] mb-2 uppercase tracking-wider">
                Mensajes rápidos de prueba
              </label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleQuickOption('Hola, me gustaría agendar una cita')}
                  className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-[#E5E5EA] border border-[#E5E5EA] rounded-lg transition-colors text-[#1D1D1F] cursor-pointer"
                >
                  "Hola, me gustaría agendar una cita"
                </button>
                <button
                  onClick={() => handleQuickOption('¿Qué servicios tienen y cuáles son los precios?')}
                  className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-[#E5E5EA] border border-[#E5E5EA] rounded-lg transition-colors text-[#1D1D1F] cursor-pointer"
                >
                  "¿Qué servicios tienen y cuáles son los precios?"
                </button>
                <button
                  onClick={() => handleQuickOption(`Quiero un Corte y barba para mañana a las 16:30`)}
                  className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-[#E5E5EA] border border-[#E5E5EA] rounded-lg transition-colors text-[#1D1D1F] cursor-pointer"
                >
                  "Quiero Corte y barba para mañana a las 16:30"
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E5EA] mt-4">
          {errorMessage && (
            <div className="mb-3 px-3 py-2 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-lg text-xs text-[#FF3B30] flex gap-1.5 items-center">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <button
            onClick={handleResetChat}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#FF3B30]/5 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-[#FF3B30]/20 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reiniciar conversación</span>
          </button>
        </div>
      </div>

      {/* Interfaz de Chat (WhatsApp Web Style) */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
        {/* Chat Background Doodle Pattern Mockup */}
        <div 
          className="absolute inset-0 opacity-4 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Cabecera del Chat */}
        <div className="bg-[#f0f2f5] border-b border-[#D1D1D6] py-3 px-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
              IA
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1d2a35] leading-tight">
                {businessName} Assistant
              </h3>
              <span className="text-[11px] text-[#25D366] font-medium flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse" />
                en línea (Bot Gemini)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              disabled={isLoading}
              title="Recargar conversación"
              className="p-2 text-[#667781] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3.5 z-10 flex flex-col">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm relative flex flex-col gap-1 ${
                msg.sender === 'user'
                  ? 'bg-[#d9fdd3] text-[#111b21] self-end rounded-tr-none'
                  : 'bg-white text-[#111b21] self-start rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <span className="text-[9px] text-[#667781] self-end -mb-0.5 select-none mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="bg-white text-[#111b21] max-w-[75%] rounded-lg rounded-tl-none px-4 py-3 text-sm shadow-sm self-start flex items-center gap-1">
              <span className="w-2 h-2 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Formulario de Entrada */}
        <form
          onSubmit={handleSendMessage}
          className="bg-[#f0f2f5] py-2.5 px-4 flex items-center gap-3 shrink-0 z-10 border-t border-[#D1D1D6]"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje en lenguaje natural..."
            disabled={isLoading}
            className="flex-1 bg-white px-4 py-2 rounded-lg text-sm border border-[#E5E5EA] focus:outline-none focus:ring-1 focus:ring-[#25D366] text-[#111b21] disabled:bg-[#f0f2f5]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 bg-[#25D366] hover:bg-[#20ba59] disabled:bg-[#a9eabf] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
