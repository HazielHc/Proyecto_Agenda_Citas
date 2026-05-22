import { GoogleGenAI } from '@google/genai';
import { prisma } from './prisma';
import { services, toScheduledAt, splitDateTime } from './mappers';

// Inicializar Gemini
// Se requiere configurar GEMINI_API_KEY en el archivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Estructura de respuesta que le exigimos a Gemini
const responseSchema = {
  type: "OBJECT",
  properties: {
    reply: {
      type: "STRING",
      description: "Mensaje amigable en español para el cliente por WhatsApp."
    },
    action: {
      type: "OBJECT",
      description: "Acción a realizar en la base de datos.",
      properties: {
        type: {
          type: "STRING",
          enum: ["book", "cancel", "none"],
          description: "Tipo de acción: 'book' (agendar), 'cancel' (cancelar) o 'none' (conversar)."
        },
        bookingDetails: {
          type: "OBJECT",
          description: "Información para agendar. Requerido solo si type es 'book'.",
          properties: {
            clientFirstName: { type: "STRING" },
            clientLastName: { type: "STRING" },
            serviceId: { 
              type: "STRING", 
              description: "ID del servicio: '1' para Corte de cabello, '2' para Corte y barba, '3' para Perfilado de barba, '4' para Afeitado clasico" 
            },
            date: { type: "STRING", description: "Fecha en formato YYYY-MM-DD" },
            time: { type: "STRING", description: "Hora en formato HH:MM" }
          },
          required: ["clientFirstName", "clientLastName", "serviceId", "date", "time"]
        },
        cancellationDetails: {
          type: "OBJECT",
          description: "Información para cancelar. Requerido solo si type es 'cancel'.",
          properties: {
            appointmentId: { type: "STRING", description: "ID de la cita a cancelar" }
          },
          required: ["appointmentId"]
        }
      },
      required: ["type"]
    }
  },
  required: ["reply", "action"]
};

// Horarios de citas fijos definidos por el sistema
const FIXED_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:30', '16:30', '17:30'];

/**
 * Obtener un string de contexto que detalla los horarios libres y ocupados
 * para los siguientes 7 días a partir de hoy.
 */
async function getAvailabilityContext(businessId: number): Promise<string> {
  const contextLines: string[] = [];
  const today = new Date();
  
  // Analizar hoy y los próximos 7 días
  for (let i = 0; i < 8; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() + i);
    
    const dayOfWeek = checkDate.getDay();
    const dayName = checkDate.toLocaleDateString('es-MX', { weekday: 'long' });
    const formattedDate = checkDate.toISOString().slice(0, 10);
    
    // Domingo es cerrado
    if (dayOfWeek === 0) {
      contextLines.push(`- ${dayName} ${checkDate.getDate()} de Mayo (${formattedDate}): CERRADO (No se labora)`);
      continue;
    }
    
    // Obtener citas del día en la DB
    const startOfDay = new Date(`${formattedDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${formattedDate}T23:59:59.999Z`);
    
    const appointments = await prisma.appointment.findMany({
      where: {
        businessId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['cancelada', 'no_asistio']
        }
      }
    });
    
    const occupiedTimes = appointments.map(apt => {
      const { time } = splitDateTime(apt.scheduledAt);
      return time;
    });
    
    const freeSlots = FIXED_SLOTS.filter(slot => !occupiedTimes.includes(slot));
    
    contextLines.push(
      `- ${dayName} ${checkDate.getDate()} (${formattedDate}): ` +
      `Disponibles: [${freeSlots.join(', ')}] | Ocupados: [${occupiedTimes.length > 0 ? occupiedTimes.join(', ') : 'Ninguno'}]`
    );
  }
  
  return contextLines.join('\n');
}

/**
 * Procesa un mensaje de WhatsApp entrante usando Gemini y actualiza la base de datos
 * si la IA decide realizar una reserva o cancelación.
 */
export async function processWhatsAppMessage(
  phone: string,
  messageText: string,
  businessId: number = 1
): Promise<string> {
  
  // 1. Manejo del reinicio de sesión de simulación
  if (messageText === '__RESET_SESSION__') {
    await prisma.chatSession.deleteMany({
      where: { phone }
    });
    return 'Sesión reiniciada.';
  }

  // 2. Obtener el historial conversacional
  let session = await prisma.chatSession.findUnique({
    where: { phone }
  });

  let history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (session) {
    try {
      history = JSON.parse(session.history);
    } catch {
      history = [];
    }
  }

  // 3. Obtener el contexto dinámico de la barbería
  const business = await prisma.business.findFirst({
    where: { id: businessId }
  });
  const businessName = business?.name || 'Barbería El Navajero';
  const availabilityContext = await getAvailabilityContext(businessId);
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  // 4. Buscar citas activas del usuario para poder cancelar si lo pide
  const client = await prisma.client.findFirst({
    where: { businessId, phone }
  });
  
  let clientAppointmentsContext = 'No tiene citas agendadas actualmente.';
  if (client) {
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        businessId,
        clientId: client.id,
        status: { in: ['agendada', 'confirmada'] }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    if (activeAppointments.length > 0) {
      clientAppointmentsContext = activeAppointments
        .map(apt => {
          const { date, time } = splitDateTime(apt.scheduledAt);
          return `- Cita ID: ${apt.id} | Servicio: ${apt.service} | Fecha: ${date} | Hora: ${time}`;
        })
        .join('\n');
    }
  }

  // 5. Construir las instrucciones del sistema (Prompt)
  const systemInstruction = `
Eres el asistente virtual con Inteligencia Artificial de la barbería "${businessName}". Tu objetivo es ayudar a los clientes a consultar precios, horarios de atención y agendar o cancelar citas de forma automática a través de WhatsApp.

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${businessName}
- Servicios disponibles:
${services.map(s => `  * ID: ${s.id} | ${s.name} | Duración: ${s.duration} mins | Precio: $${s.price} MXN`).join('\n')}

HORA Y FECHA ACTUAL EN EL SERVIDOR:
Hoy es ${dateStr} y la hora actual es ${timeStr}. Usa esta referencia exacta para interpretar expresiones relativas como "hoy", "mañana", "pasado mañana", "el sábado", etc.

CITAS ACTIVAS DE ESTE CLIENTE (Teléfono: ${phone}):
${clientAppointmentsContext}

DISPONIBILIDAD DE HORARIOS (Próximos 7 días):
${availabilityContext}

REGLAS DE CONVERSACIÓN:
1. Sé amable, atento, educado y muy breve. Recuerda que estás en WhatsApp.
2. Si el cliente quiere agendar, debes guiarlo para definir el Servicio, el Día y la Hora.
3. Para poder completar el agendado, es obligatorio que le preguntes su Nombre y Apellido.
4. **IMPORTANTE:** Solo debes realizar la acción de agendar ("type": "book") cuando el cliente haya seleccionado explícitamente un día libre, una hora libre, un servicio válido y te haya provisto su Nombre y Apellido. Mientras falten datos, mantén la acción en {"type": "none"} y sigue conversando amablemente para pedirlos.
5. Si el cliente quiere cancelar, busca su cita en la lista de arriba y realiza la acción "cancel" usando el ID de cita adecuado.
6. Nunca inventes horarios ocupados ni agendes en días que están marcados como CERRADO.
`;

  // 6. Preparar los contenidos para la API de Gemini
  // Agregamos el mensaje actual al historial temporal
  const userMessage = {
    role: 'user' as const,
    parts: [{ text: messageText }]
  };

  // LLamada a Gemini utilizando Structured Output
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [...history, userMessage],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const responseJson = JSON.parse(response.text || '{}');
    let replyText = responseJson.reply || 'Disculpa, no entendí bien eso. ¿Me lo puedes repetir?';
    const action = responseJson.action || { type: 'none' };

    // 7. Ejecutar acciones en la base de datos si aplica
    if (action.type === 'book' && action.bookingDetails) {
      const details = action.bookingDetails;
      
      try {
        const service = services.find(s => s.id === details.serviceId) ?? services[0];
        const scheduledAt = toScheduledAt(details.date, details.time);

        // Verificar traslapes de último minuto
        const overlap = await prisma.appointment.findFirst({
          where: {
            businessId,
            scheduledAt,
            status: { notIn: ['cancelada', 'no_asistio'] }
          }
        });

        if (overlap) {
          replyText = `Lo siento, el horario del ${details.date} a las ${details.time} se ocupó hace un momento. ¿Te gustaría elegir otro horario disponible?`;
        } else {
          // Crear o actualizar cliente
          const dbClient = await prisma.client.upsert({
            where: {
              businessId_phone: { businessId, phone }
            },
            create: {
              businessId,
              firstName: details.clientFirstName,
              lastName: details.clientLastName,
              phone
            },
            update: {
              firstName: details.clientFirstName,
              lastName: details.clientLastName
            }
          });

          // Crear cita
          const apt = await prisma.appointment.create({
            data: {
              businessId,
              clientId: dbClient.id,
              service: service.name,
              scheduledAt,
              durationMin: service.duration,
              status: 'agendada',
              channel: 'whatsapp',
              pricePaid: service.price
            }
          });

          replyText = `✅ ¡Listo! He agendado tu cita. Aquí tienes los detalles:\n\n- Servicio: ${service.name}\n- Fecha: ${details.date}\n- Hora: ${details.time} hrs\n- Cliente: ${details.clientFirstName} ${details.clientLastName}\n\n¡Te esperamos en ${businessName}!`;
        }
      } catch (err) {
        console.error('Error al agendar cita por WhatsApp:', err);
        replyText = 'Hubo un inconveniente técnico al registrar tu cita en el sistema. Por favor intenta de nuevo.';
      }
    } else if (action.type === 'cancel' && action.cancellationDetails) {
      const details = action.cancellationDetails;
      
      try {
        const aptId = Number(details.appointmentId);
        const appointment = await prisma.appointment.findFirst({
          where: { id: aptId, businessId }
        });

        if (!appointment) {
          replyText = 'No encontré ninguna cita registrada con esa información para cancelar.';
        } else {
          await prisma.appointment.update({
            where: { id: aptId },
            data: { status: 'cancelada' }
          });
          replyText = `Cita cancelada con éxito. Esperamos verte pronto de nuevo en ${businessName}.`;
        }
      } catch (err) {
        console.error('Error al cancelar cita por WhatsApp:', err);
        replyText = 'No pude procesar la cancelación en este momento. Intenta de nuevo.';
      }
    }

    // 8. Guardar el nuevo mensaje del modelo en el historial de chat
    const modelMessage = {
      role: 'model' as const,
      parts: [{ text: response.text || '' }]
    };

    history.push(userMessage);
    history.push(modelMessage);

    // Mantener los últimos 15 mensajes para que no crezca infinitamente la sesión
    if (history.length > 30) {
      history = history.slice(-30);
    }

    // Guardar en la DB
    await prisma.chatSession.upsert({
      where: { phone },
      create: {
        phone,
        history: JSON.stringify(history),
        businessId
      },
      update: {
        history: JSON.stringify(history)
      }
    });

    return replyText;

  } catch (error) {
    console.error('Error en proceso de Gemini WhatsApp:', error);
    throw new Error('No se pudo procesar la solicitud con la inteligencia artificial.');
  }
}
