import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import pino from 'pino';
import { processWhatsAppMessage } from './gemini';

const SESSION_DIR = process.env.WHATSAPP_SESSION_DIR || './storage/baileys';

// Función auxiliar para extraer texto de las diferentes estructuras de mensaje de WhatsApp (incluyendo mensajes temporales)
function getMessageText(message: any): string | null {
  if (!message) return null;
  if (message.conversation) return message.conversation;
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
  if (message.imageMessage?.caption) return message.imageMessage.caption;
  if (message.videoMessage?.caption) return message.videoMessage.caption;
  
  // Desempaquetar envoltorios comunes de WhatsApp
  if (message.ephemeralMessage?.message) {
    return getMessageText(message.ephemeralMessage.message);
  }
  if (message.viewOnceMessage?.message) {
    return getMessageText(message.viewOnceMessage.message);
  }
  if (message.viewOnceMessageV2?.message) {
    return getMessageText(message.viewOnceMessageV2.message);
  }
  if (message.documentWithCaptionMessage?.message) {
    return getMessageText(message.documentWithCaptionMessage.message);
  }
  
  return null;
}

export async function connectToWhatsApp() {
  try {
    // Asegurar que la carpeta de almacenamiento existe
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    console.log('Iniciando cliente de WhatsApp Baileys...');
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      // Logger pino básico para evitar spam en la terminal
      logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n==================================================');
        console.log('       ESCANEA ESTE CÓDIGO QR CON TU CELULAR');
        console.log('       (WhatsApp > Dispositivos vinculados)');
        console.log('==================================================\n');
        qrcode.generate(qr, { small: true });
        console.log('\n==================================================');
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`Conexión de WhatsApp cerrada (Código: ${statusCode}). Reconectando: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          // Esperar un momento antes de reconectar para evitar bucles infinitos inmediatos
          setTimeout(() => connectToWhatsApp(), 5000);
        }
      } else if (connection === 'open') {
        const botNumber = sock.user?.id ? sock.user.id.split(':')[0] : 'Desconocido';
        console.log('==================================================');
        console.log('  ✅ ¡CONEXIÓN DE WHATSAPP ESTABLECIDA CON ÉXITO!  ');
        console.log(`  Bot conectado con el número: ${botNumber}`);
        console.log('  Ya puedes enviar mensajes a este número para agendar.');
        console.log('==================================================');
      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      if (m.type !== 'notify') return;

      for (const msg of m.messages) {
        // Evitar responder a mensajes enviados por el propio bot
        if (msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid) continue;

        // Responder únicamente a chats individuales (no grupos)
        if (!remoteJid.endsWith('@s.whatsapp.net')) continue;

        const phone = remoteJid.split('@')[0];
        const messageText = getMessageText(msg.message);

        if (!phone || !messageText) {
          if (!phone) continue;
          // Loggear para depuración si es un formato no soportado (como stickers, contactos, etc.)
          console.log(`[WhatsApp recibido] Mensaje de tipo no soportado o vacío de ${phone}`);
          continue;
        }

        console.log(`[WhatsApp recibido] De: ${phone} | Mensaje: ${messageText}`);

        try {
          // Procesar el mensaje con el agente conversacional de Gemini
          const reply = await processWhatsAppMessage(phone, messageText, 1);

          // Enviar respuesta al cliente
          await sock.sendMessage(remoteJid, { text: reply });
          console.log(`[WhatsApp enviado] A: ${phone} | Respuesta: ${reply}`);
        } catch (err) {
          console.error(`Error al procesar mensaje de ${phone}:`, err);
        }
      }
    });

  } catch (error) {
    console.error('Error al inicializar la conexión de WhatsApp con Baileys:', error);
  }
}
