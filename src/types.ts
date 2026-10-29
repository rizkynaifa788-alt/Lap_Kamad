export type MetodeHitung = 'pelaksanaan' | 'tanggal_unik' | 'output_dokumen' | 'manual';

export type KategoriKegiatan =
  | 'Bidang Perencanaan dan Pengembangan Madrasah'
  | 'Bidang Pengelolaan Kurikulum dan Pembelajaran'
  | 'Bidang Pendidik dan Tenaga Kependidikan'
  | 'Bidang Supervisi Akademik dan Manajerial'
  | 'Bidang Kesiswaan dan Pembinaan Karakter'
  | 'Bidang Keuangan dan Pengelolaan Anggaran'
  | 'Bidang Sarana, Prasarana, dan Aset'
  | 'Bidang Administrasi, Data, dan Pelaporan'
  | 'Bidang Hubungan Masyarakat dan Kemitraan'
  | 'Bidang Pengembangan Kewirausahaan dan Inovasi'
  | 'Bidang Penjaminan Mutu dan Evaluasi'
  | 'Bidang Keamanan, Kesehatan, dan Budaya Madrasah'
  | 'Tugas Kedinasan Lainnya';

export const DAFTAR_12_BIDANG: KategoriKegiatan[] = [
  'Bidang Perencanaan dan Pengembangan Madrasah',
  'Bidang Pengelolaan Kurikulum dan Pembelajaran',
  'Bidang Pendidik dan Tenaga Kependidikan',
  'Bidang Supervisi Akademik dan Manajerial',
  'Bidang Kesiswaan dan Pembinaan Karakter',
  'Bidang Keuangan dan Pengelolaan Anggaran',
  'Bidang Sarana, Prasarana, dan Aset',
  'Bidang Administrasi, Data, dan Pelaporan',
  'Bidang Hubungan Masyarakat dan Kemitraan',
  'Bidang Pengembangan Kewirausahaan dan Inovasi',
  'Bidang Penjaminan Mutu dan Evaluasi',
  'Bidang Keamanan, Kesehatan, dan Budaya Madrasah',
];

export type SatuanVolume = 'Kegiatan' | 'Dokumen' | 'Hari' | 'Laporan' | 'Rapat' | 'Berkas';

export type StatusValidasi = 'Terverifikasi' | 'Menunggu' | 'Revisi';

export interface ProfileKepala {
  nama: string;
  nip: string;
  pangkatGol: string;
  jabatan: string;
  unitKerja: string;
  email: string;
  noHp: string;
  pendidikanTerakhir: string;
}

export interface MadrasahInfo {
  namaMadrasah: string;
  nsm: string;
  npsn: string;
  jenjang: 'MI' | 'MTs' | 'MA' | 'MAK';
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kopSuratTeks: string;
}

export interface PenandatanganInfo {
  pejabatNama: string;
  pejabatNip: string;
  pejabatPangkatGol: string;
  pejabatJabatan: string;
  pejabatInstansi: string;
  pengawasNama: string;
  pengawasNip: string;
  pengawasPangkatGol: string;
  pengawasJabatan: string;
  lokasiTtd: string;
  formatTanggal: string;
}

export interface MasterKegiatan {
  id: string; // e.g. KEG-001
  nama: string;
  kategori: KategoriKegiatan;
  satuan: SatuanVolume;
  metodeHitung: MetodeHitung;
  targetBulanan: number;
  status: 'aktif' | 'nonaktif';
  urutanCetak: number;
  keterangan: string;
  contohUraian: string;
  defaultBukti: string;
}

export interface LaporanHarian {
  id: string; // e.g. LH-202610-001
  tanggal: string; // YYYY-MM-DD
  hari: string; // Senin, Selasa, dll
  idKegiatan: string;
  uraianKegiatan: string;
  output: string;
  buktiDokumen: string;
  linkDrive?: string;
  manualVolume?: number;
  catatanManual?: string;
  statusValidasi: StatusValidasi;
  waktuInput: string;
  waktuUpdate: string;
}

export interface RekapBulananItem {
  no: number;
  idKegiatan: string;
  namaKegiatan: string;
  kategori: KategoriKegiatan;
  volume: number;
  satuan: SatuanVolume;
  metodeHitung: MetodeHitung;
  targetBulanan: number;
  persenCapaian: number;
  buktiDokumen: string;
  rincianHarian: LaporanHarian[];
}

export interface ArsipLaporan {
  id: string;
  bulan: number; // 1 - 12
  tahun: number;
  totalKegiatan: number;
  totalVolume: number;
  status: 'Draft' | 'Terkunci' | 'Disetujui';
  tanggalKunci?: string;
  alasanBuka?: string;
  catatanEvaluasi?: string;
}

export interface LogAktivitas {
  id: string;
  timestamp: string;
  user: string;
  aksi: 'TAMBAH' | 'EDIT' | 'HAPUS' | 'REKAP' | 'KUNCI' | 'BUKA' | 'BACKUP' | 'SYNC';
  modul: string;
  detail: string;
}

export interface GasConfig {
  webAppUrl: string;
  spreadsheetId: string;
  autoSync: boolean;
  lastSync?: string;
}
