export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) {
    return '+' + digits.slice(0, 13);
  }
  let cleaned = digits;
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.length > 10) {
    cleaned = cleaned.slice(cleaned.length - 10);
  }
  return '+1' + cleaned;
}
