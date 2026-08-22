// CIIU code mapping for Colombian businesses
export const ciiuCode = {
  consultoría: '6202',
  desarrollo: '6201',
  tecnología: '6209',
  comercio: '4711',
  servicios: '9609',
} as const;

export function getCiiuCode(sector: string): string {
  return ciiuCode[sector as keyof typeof ciiuCode] || '6209';
}
