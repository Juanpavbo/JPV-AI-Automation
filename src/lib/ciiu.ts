import ciiuData from '../data/ciiu.json';

interface CiiuEntry {
  desc: string;
  level: 'section' | 'division' | 'group' | 'class';
  section?: string;
  division?: string;
  group?: string;
}

const byCode = ciiuData as Record<string, CiiuEntry>;

export function ciiuCode(code: string | undefined | null): string {
  if (!code) return 'No disponible';
  const clean = code.trim();
  if (!clean) return 'No disponible';
  const entry = byCode[clean];
  if (!entry) return `Código CIIU ${clean}`;

  if (entry.level === 'class') {
    const group = entry.group ? byCode[entry.group] : undefined;
    const division = entry.division ? byCode[entry.division] : undefined;
    const section = entry.section ? byCode[entry.section] : undefined;
    const parts = [
      section?.desc,
      division?.desc,
      group?.desc,
      entry.desc
    ].filter(Boolean);
    return `${clean} - ${parts.join(' / ')}`;
  }

  return `${clean} - ${entry.desc}`;
}
