/** Build a wa.me link. Returns null when no WhatsApp number is configured. */
export function whatsappLink(number: string, message: string): string | null {
  const digits = number.replace(/[^\d]/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
