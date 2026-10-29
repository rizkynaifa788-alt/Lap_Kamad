export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Menghitung hari dalam Bahasa Indonesia dari string tanggal 'YYYY-MM-DD'
 */
export function getHariIndonesia(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return NAMA_HARI[date.getDay()] || '';
}

/**
 * Format tanggal ke format resmi Kemenag: DD/MM/YYYY
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
}

/**
 * Format tanggal lengkap untuk tanda tangan resmi, contoh: '31 Oktober 2026'
 */
export function formatTanggalResmi(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    return `${d} ${NAMA_BULAN[m - 1]} ${y}`;
  }
  return dateStr;
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD (Asia/Jakarta)
 */
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
