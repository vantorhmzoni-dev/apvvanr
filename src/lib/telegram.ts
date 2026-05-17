import { telegramSend } from '@/api/telegramPhpParity'

/** إرسال home / pay / otp عبر telegram.php على الاستضافة */
export async function sendTelegram(
  _source: 'home' | 'pay' | 'otp',
  text: string,
  repeat = 1,
): Promise<boolean> {
  return telegramSend(text, repeat)
}
