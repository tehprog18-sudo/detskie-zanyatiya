const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("[Telegram] Bot not configured. Message:", message);
    return false;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.error("[Telegram] Error:", e);
    return false;
  }
}

export function formatNewClientMessage(name: string, email: string, phone: string | null): string {
  return `🆕 <b>Новый клиент зарегистрировался!</b>\n\n👤 Имя: ${name}\n📧 Email: ${email}\n📱 Телефон: ${phone || "не указан"}`;
}

export function formatBookingMessage(parentName: string, childName: string, programName: string, date: string, time: string): string {
  return `📋 <b>Новая запись на занятие!</b>\n\n👤 Родитель: ${parentName}\n👶 Ребёнок: ${childName}\n📚 Занятие: ${programName}\n📅 Дата: ${date}\n🕐 Время: ${time}`;
}

export function formatTestDriveMessage(name: string, phone: string, childAge: string | null): string {
  return `🎯 <b>Заявка на тест-драйв!</b>\n\n👤 Имя: ${name}\n📱 Телефон: ${phone}\n👶 Возраст ребёнка: ${childAge || "не указан"}`;
}
