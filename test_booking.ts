import dotenv from 'dotenv';
dotenv.config();
import { processWhatsAppMessage } from './src/server/gemini';
import { prisma } from './src/server/prisma';

async function run() {
  const phone = '5512345678';
  try {
    // Limpiar sesión previa
    await prisma.chatSession.deleteMany({ where: { phone } });

    console.log('--- Mensaje 1 ---');
    let reply = await processWhatsAppMessage(phone, 'Hola, me gustaría agendar una cita', 1);
    console.log('Reply 1:', reply);

    console.log('--- Mensaje 2 ---');
    reply = await processWhatsAppMessage(phone, 'Quiero Corte y barba para mañana a las 16:30', 1);
    console.log('Reply 2:', reply);

    console.log('--- Mensaje 3 ---');
    reply = await processWhatsAppMessage(phone, 'Juan Perez', 1);
    console.log('Reply 3:', reply);

  } catch (error) {
    console.error('CRASH ERROR:', error);
  }
}

run();
