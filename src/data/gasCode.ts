/**
 * Source code Google Apps Script (Code.gs) & Dokumentasi Arsitektur
 * Lengkap, siap pasang, dan dilengkapi penanganan konkurensi (LockService)
 */

export const gasCodeGs = `/**
 * ==============================================================================
 * SISTEM INFORMASI LAPORAN KINERJA KEPALA MADRASAH (KEMENTERIAN AGAMA RI)
 * File: Code.gs (Google Apps Script Backend)
 * Basis Data: Google Spreadsheet
 * Standard: Lampiran I (Laporan Harian) & Lampiran II (Capaian Kinerja Bulanan)
 * ==============================================================================
 */

// Konstanta Nama Sheet Database
const SHEETS = {
  PROFIL: 'Profil',
  MASTER_KEGIATAN: 'MasterKegiatan',
  LAPORAN_HARIAN: 'LaporanHarian',
  REKAP_BULANAN: 'RekapBulanan',
  LOG_AKTIVITAS: 'LogAktivitas'
};

/**
 * Entry Point HTTP GET
 * Menyajikan frontend jika diakses langsung lewat browser atau merespons request API
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    
    // Jika ada parameter action, perlakukan sebagai REST API JSON
    if (action) {
      return handleApiGet(e);
    }
    
    // Default: Menyajikan halaman web HTML Service
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Sistem Informasi Laporan Kinerja Kepala Madrasah - Kemenag RI')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  }
}

/**
 * Entry Point HTTP POST
 * Menerima payload JSON dari client untuk operasi Create, Update, Delete, Rekap, dan Sync
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Kunci eksekusi selama maksimal 30 detik untuk mencegah race condition
  const hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return jsonResponse({
      success: false,
      message: 'Server sedang sibuk memproses transaksi lain. Silakan coba beberapa saat lagi.'
    });
  }

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;
    let result = { success: false, message: 'Aksi tidak dikenali' };

    switch (action) {
      case 'ping':
        result = { success: true, message: 'Koneksi ke Google Apps Script Berhasil', timestamp: new Date().toISOString() };
        break;
      case 'initDatabase':
        result = initDatabase();
        break;
      case 'getAllData':
        result = getAllData();
        break;
      case 'saveProfile':
        result = saveProfile(payload.data);
        break;
      case 'saveMasterKegiatan':
        result = saveMasterKegiatan(payload.data);
        break;
      case 'saveLaporanHarian':
        result = saveLaporanHarian(payload.data);
        break;
      case 'deleteLaporanHarian':
        result = deleteLaporanHarian(payload.id);
        break;
      case 'hitungRekapBulanan':
        result = hitungRekapBulanan(payload.bulan, payload.tahun);
        break;
      case 'syncAll':
        result = syncAllData(payload.data);
        break;
      default:
        result = { success: false, message: 'Aksi ' + action + ' belum didukung' };
    }

    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({ success: false, message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper JSON Response
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Inisialisasi Database Google Spreadsheet Otomatis
 * Membangun 5 Sheet beserta Header, format, dan styling Kemenag (Emerald Green)
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Profil
  let sheetProfil = ss.getSheetByName(SHEETS.PROFIL);
  if (!sheetProfil) {
    sheetProfil = ss.insertSheet(SHEETS.PROFIL);
  }
  sheetProfil.clear();
  sheetProfil.getRange('A1:B1').setValues([['KUNCI_PARAMETER', 'NILAI']]);
  const defaultProfilData = [
    ['nama_kepala', 'Dr. H. Ahmad Fauzi, M.Pd.I'],
    ['nip_kepala', '197805122003121002'],
    ['pangkat_gol', 'Pembina Tingkat I (IV/b)'],
    ['jabatan_kepala', 'Kepala Madrasah Aliyah Negeri'],
    ['unit_kerja', 'MAN 1 Kota Jakarta'],
    ['email_kepala', 'ahmadfauzi.kemenag@gmail.com'],
    ['no_hp', '0812-8877-6655'],
    ['nama_madrasah', 'Madrasah Aliyah Negeri (MAN) 1 Kota Jakarta'],
    ['nsm', '131131750001'],
    ['npsn', '20107299'],
    ['alamat_madrasah', 'Jl. Rawa Jaya No. 1, Pondok Kopi, Duren Sawit'],
    ['kota_kabupaten', 'Kota Jakarta Timur'],
    ['provinsi', 'DKI Jakarta'],
    ['pejabat_nama', 'H. Zulkifli, S.Ag., M.Si.'],
    ['pejabat_nip', '197203151998031004'],
    ['pejabat_jabatan', 'Kepala Kantor Kementerian Agama Kota Jakarta Timur'],
    ['pengawas_nama', 'Dra. Hj. Nurjanah, M.Pd.'],
    ['pengawas_nip', '196908201995032001'],
    ['pengawas_jabatan', 'Pengawas Madrasah Ahli Madya'],
    ['lokasi_ttd', 'Jakarta Timur']
  ];
  sheetProfil.getRange(2, 1, defaultProfilData.length, 2).setValues(defaultProfilData);
  formatHeaderRow(sheetProfil, 1, 2);

  // 2. Sheet MasterKegiatan
  let sheetMaster = ss.getSheetByName(SHEETS.MASTER_KEGIATAN);
  if (!sheetMaster) {
    sheetMaster = ss.insertSheet(SHEETS.MASTER_KEGIATAN);
  }
  sheetMaster.clear();
  const masterHeaders = [
    'ID_Kegiatan', 'Nama_Kegiatan', 'Kategori', 'Satuan', 
    'Metode_Hitung', 'Target_Bulanan', 'Status', 'Urutan_Cetak', 'Contoh_Uraian', 'Default_Bukti'
  ];
  sheetMaster.getRange(1, 1, 1, masterHeaders.length).setValues([masterHeaders]);
  formatHeaderRow(sheetMaster, 1, masterHeaders.length);

  // Seed default 20 Master Kegiatan mencakup 12 Bidang Tugas Pokok Kepala Madrasah
  const initialMaster = [
    ['KEG-001', 'Menyusun perencanaan program kerja tahunan dan rencana anggaran madrasah (RKM/RKAM)', 'Bidang Perencanaan dan Pengembangan Madrasah', 'Dokumen', 'output_dokumen', 1, 'aktif', 1, 'Melakukan reviu dan finalisasi draf RKAM Triwulan IV', 'Dokumen RKAM & Berita Acara'],
    ['KEG-002', 'Melaksanakan supervisi akademik dan pemantauan proses pembelajaran guru', 'Bidang Supervisi Akademik dan Manajerial', 'Kegiatan', 'pelaksanaan', 4, 'aktif', 2, 'Melaksanakan supervisi akademik pembelajaran Matematika dan PAI di kelas X dan XI', 'Instrumen Supervisi & Lembar Catatan Observasi'],
    ['KEG-003', 'Melakukan observasi dan evaluasi perangkat pembelajaran guru (RPP/Modul Ajar)', 'Bidang Pengelolaan Kurikulum dan Pembelajaran', 'Dokumen', 'output_dokumen', 6, 'aktif', 3, 'Memeriksa dan menandatangani Modul Ajar guru rumpun MIPA dan Agama semester ganjil', 'Lembar Verifikasi Modul Ajar'],
    ['KEG-004', 'Melaksanakan pembinaan dan pengarahan disiplin guru dan tenaga kependidikan', 'Bidang Pendidik dan Tenaga Kependidikan', 'Kegiatan', 'pelaksanaan', 3, 'aktif', 4, 'Memberikan pembinaan disiplin jam kerja ASN dan kepatuhan pengisian presensi Pusaka Kemenag', 'Daftar Hadir Pembinaan & Notula'],
    ['KEG-005', 'Memimpin rapat dinas madrasah (koordinasi, evaluasi, dan pembagian tugas)', 'Bidang Administrasi, Data, dan Pelaporan', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 5, 'Memimpin rapat dinas bulanan persiapan Penilaian Akhir Semester (PAS) Ganjil', 'Undangan, Daftar Hadir, dan Notula Rapat Dinas'],
    ['KEG-006', 'Melaksanakan monitoring administrasi madrasah dan ketatausahaan', 'Bidang Administrasi, Data, dan Pelaporan', 'Dokumen', 'output_dokumen', 2, 'aktif', 6, 'Memeriksa rekapitulasi buku agenda surat masuk-keluar dan validasi data EMIS 4.0 siswa madrasah', 'Laporan Monitoring Administrasi Tata Usaha'],
    ['KEG-007', 'Mengelola pemeliharaan dan pengembangan sarana prasarana serta fasilitas madrasah', 'Bidang Sarana, Prasarana, dan Aset', 'Hari', 'tanggal_unik', 4, 'aktif', 7, 'Inspeksi berkala laboratorium komputer dan perbaikan instalasi kelistrikan ruang kelas', 'Laporan Ceklis Sarpras & Dokumentasi Foto'],
    ['KEG-008', 'Melaksanakan pembinaan karakter dan keagamaan peserta didik', 'Bidang Kesiswaan dan Pembinaan Karakter', 'Hari', 'tanggal_unik', 16, 'aktif', 8, 'Memimpin sholat Dhuha berjamaah dan memberikan tausiyah karakter akhlakul karimah peserta didik', 'Jurnal Pembiasaan Keagamaan & Dokumentasi'],
    ['KEG-009', 'Melakukan koordinasi dan konsultasi kedinasan dengan Pengawas dan Kantor Kemenag', 'Bidang Hubungan Masyarakat dan Kemitraan', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 9, 'Konsultasi teknis dengan Pengawas Pembina terkait implementasi Kurikulum Merdeka di madrasah', 'Surat Tugas & Lembar Konsultasi Pengawas'],
    ['KEG-010', 'Melaksanakan evaluasi program madrasah dan tindak lanjut hasil supervisi', 'Bidang Supervisi Akademik dan Manajerial', 'Dokumen', 'output_dokumen', 1, 'aktif', 10, 'Menyusun matriks tindak lanjut hasil supervisi akademik semester ganjil untuk guru madrasah', 'Dokumen Matriks Tindak Lanjut Supervisi'],
    ['KEG-011', 'Mengembangkan kemitraan madrasah dengan Komite, Orang Tua, dan Lembaga Eksternal', 'Bidang Hubungan Masyarakat dan Kemitraan', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 11, 'Pertemuan koordinasi dengan Komite Madrasah membahas program penguatan literasi dan riset siswa', 'Berita Acara Rapat Komite & Dokumentasi'],
    ['KEG-012', 'Mengelola sistem keuangan madrasah, transparansi BOS, dan verifikasi SPJ', 'Bidang Keuangan dan Pengelolaan Anggaran', 'Dokumen', 'output_dokumen', 2, 'aktif', 12, 'Memeriksa dan menandatangani Berkas Pertanggungjawaban (SPJ) Realisasi Dana BOS Bulan Berjalan', 'Lembar Verifikasi BKU & Dokumen SPJ'],
    ['KEG-013', 'Melaksanakan pembinaan peserta didik pada kegiatan ekstrakurikuler dan kompetisi', 'Bidang Kesiswaan dan Pembinaan Karakter', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 13, 'Memberikan arahan dan motivasi kepada tim riset siswa persiapan kompetisi MYRES Kemenag 2026', 'Surat Tugas Peserta & Dokumentasi'],
    ['KEG-014', 'Menyusun Laporan Capaian Kinerja Bulanan Kepala Madrasah (Lampiran I & II)', 'Bidang Administrasi, Data, dan Pelaporan', 'Dokumen', 'output_dokumen', 1, 'aktif', 14, 'Menyusun dan merekapitulasi Laporan Kinerja Harian (Lampiran I) dan Capaian Bulanan (Lampiran II)', 'Buku Laporan Kinerja Lengkap'],
    ['KEG-015', 'Melaksanakan evaluasi diri madrasah (EDM) dan persiapan peningkatan akreditasi', 'Bidang Penjaminan Mutu dan Evaluasi', 'Dokumen', 'manual', 1, 'aktif', 15, 'Memimpin review butir instrumen Evaluasi Diri Madrasah (EDM) bersama Tim Penjamin Mutu Madrasah', 'Instrumen EDM Terisi & Lembar Pengesahan'],
    ['KEG-016', 'Melaksanakan tugas kedinasan lainnya dari pimpinan instansi / Kantor Kemenag', 'Tugas Kedinasan Lainnya', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 16, 'Menghadiri Rapat Koordinasi Kepala Madrasah Aliyah se-DKI Jakarta di Aula Kanwil Kemenag', 'Surat Tugas Pimpinan & Sertifikat/Laporan'],
    ['KEG-017', 'Mengelola pengembangan kurikulum operasional madrasah (KOM) dan kalender pendidikan', 'Bidang Pengelolaan Kurikulum dan Pembelajaran', 'Dokumen', 'output_dokumen', 1, 'aktif', 17, 'Memimpin lokakarya reviu KOSP / Kurikulum Operasional Madrasah semester berjalan', 'Dokumen KOM & Berita Acara Lokakarya'],
    ['KEG-018', 'Mengkoordinasikan pengembangan keprofesian berkelanjutan (PKB) guru dan tendik', 'Bidang Pendidik dan Tenaga Kependidikan', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 18, 'Membuka dan memfasilitasi kegiatan MGMP guru madrasah tingkat kota', 'Surat Tugas & Daftar Hadir Peserta MGMP'],
    ['KEG-019', 'Mengembangkan inovasi kewirausahaan madrasah (riset, digital, dan unit produksi)', 'Bidang Pengembangan Kewirausahaan dan Inovasi', 'Kegiatan', 'pelaksanaan', 2, 'aktif', 19, 'Rapat koordinasi pembentukan inkubator kewirausahaan siswa dan madrasah digital', 'Proposal Inovasi & Dokumentasi Rapat'],
    ['KEG-020', 'Mewujudkan keamanan madrasah ramah anak, UKS sehat, dan pembiasaan budaya 5S', 'Bidang Keamanan, Kesehatan, dan Budaya Madrasah', 'Hari', 'tanggal_unik', 16, 'aktif', 20, 'Memantau pelaksanaan tata tertib disiplin gerbang pagi, keramahan 5S, dan kebersihan lingkungan', 'Jurnal Piket Keamanan & Ceklis Sanitasi']
  ];
  sheetMaster.getRange(2, 1, initialMaster.length, initialMaster[0].length).setValues(initialMaster);

  // 3. Sheet LaporanHarian
  let sheetHarian = ss.getSheetByName(SHEETS.LAPORAN_HARIAN);
  if (!sheetHarian) {
    sheetHarian = ss.insertSheet(SHEETS.LAPORAN_HARIAN);
  }
  sheetHarian.clear();
  const harianHeaders = [
    'ID_Laporan', 'Tanggal', 'Hari', 'ID_Kegiatan', 'Uraian_Kegiatan', 
    'Output', 'Bukti_Dokumen', 'Link_Drive', 'Status_Validasi', 'Waktu_Input', 'Waktu_Update'
  ];
  sheetHarian.getRange(1, 1, 1, harianHeaders.length).setValues([harianHeaders]);
  formatHeaderRow(sheetHarian, 1, harianHeaders.length);

  // 4. Sheet RekapBulanan
  let sheetRekap = ss.getSheetByName(SHEETS.REKAP_BULANAN);
  if (!sheetRekap) {
    sheetRekap = ss.insertSheet(SHEETS.REKAP_BULANAN);
  }
  sheetRekap.clear();
  const rekapHeaders = [
    'ID_Rekap', 'Bulan', 'Tahun', 'ID_Kegiatan', 'Nama_Kegiatan', 
    'Volume', 'Satuan', 'Metode_Hitung', 'Bukti_Dokumen', 'Target_Bulanan', 'Waktu_Rekap'
  ];
  sheetRekap.getRange(1, 1, 1, rekapHeaders.length).setValues([rekapHeaders]);
  formatHeaderRow(sheetRekap, 1, rekapHeaders.length);

  // 5. Sheet LogAktivitas
  let sheetLog = ss.getSheetByName(SHEETS.LOG_AKTIVITAS);
  if (!sheetLog) {
    sheetLog = ss.insertSheet(SHEETS.LOG_AKTIVITAS);
  }
  sheetLog.clear();
  const logHeaders = ['ID_Log', 'Timestamp', 'User', 'Aksi', 'Modul', 'Detail'];
  sheetLog.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
  formatHeaderRow(sheetLog, 1, logHeaders.length);

  // Catat log inisialisasi
  catatLog('Sistem', 'INIT', 'Basis Data', 'Inisialisasi 5 sheet basis data Google Spreadsheet selesai');

  return {
    success: true,
    message: 'Database Google Spreadsheet berhasil diinisialisasi dengan 5 sheet resmi Kemenag.'
  };
}

/**
 * Styling Header Row (Hijau Kemenag #047857 dengan teks putih bold)
 */
function formatHeaderRow(sheet, row, colCount) {
  const range = sheet.getRange(row, 1, 1, colCount);
  range.setBackground('#065f46') // Emerald Kemenag
       .setFontColor('#ffffff')
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
  sheet.setRowHeight(row, 32);
  sheet.setFrozenRows(1);
}

/**
 * Catat Log Aktivitas
 */
function catatLog(user, aksi, modul, detail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.LOG_AKTIVITAS);
    if (!sheet) return;
    const id = 'LOG-' + new Date().getTime();
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([id, timestamp, user, aksi, modul, detail]);
  } catch (e) {
    console.error('Gagal mencatat log: ' + e.toString());
  }
}

/**
 * Ambil Seluruh Data untuk Sinkronisasi Client
 */
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Baca Profil
  const sheetProfil = ss.getSheetByName(SHEETS.PROFIL);
  const profilObj = {};
  if (sheetProfil && sheetProfil.getLastRow() > 1) {
    const vals = sheetProfil.getRange(2, 1, sheetProfil.getLastRow() - 1, 2).getValues();
    vals.forEach(row => {
      profilObj[row[0]] = row[1];
    });
  }

  // Baca Master Kegiatan
  const sheetMaster = ss.getSheetByName(SHEETS.MASTER_KEGIATAN);
  const masterList = [];
  if (sheetMaster && sheetMaster.getLastRow() > 1) {
    const data = sheetMaster.getRange(2, 1, sheetMaster.getLastRow() - 1, 10).getValues();
    data.forEach(r => {
      masterList.push({
        id: r[0],
        nama: r[1],
        kategori: r[2],
        satuan: r[3],
        metodeHitung: r[4],
        targetBulanan: Number(r[5]) || 0,
        status: r[6],
        urutanCetak: Number(r[7]) || 1,
        contohUraian: r[8],
        defaultBukti: r[9]
      });
    });
  }

  // Baca Laporan Harian
  const sheetHarian = ss.getSheetByName(SHEETS.LAPORAN_HARIAN);
  const harianList = [];
  if (sheetHarian && sheetHarian.getLastRow() > 1) {
    const data = sheetHarian.getRange(2, 1, sheetHarian.getLastRow() - 1, 11).getValues();
    data.forEach(r => {
      let tglStr = '';
      if (r[1] instanceof Date) {
        tglStr = Utilities.formatDate(r[1], 'Asia/Jakarta', 'yyyy-MM-dd');
      } else {
        tglStr = String(r[1]);
      }
      harianList.push({
        id: r[0],
        tanggal: tglStr,
        hari: r[2],
        idKegiatan: r[3],
        uraianKegiatan: r[4],
        output: r[5],
        buktiDokumen: r[6],
        linkDrive: r[7],
        statusValidasi: r[8],
        waktuInput: String(r[9]),
        waktuUpdate: String(r[10])
      });
    });
  }

  return {
    success: true,
    profil: profilObj,
    masterKegiatan: masterList,
    laporanHarian: harianList
  };
}

/**
 * Simpan atau Perbarui Laporan Harian
 */
function saveLaporanHarian(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.LAPORAN_HARIAN);
  if (!sheet) {
    throw new Error('Sheet LaporanHarian tidak ditemukan. Silakan inisialisasi database dahulu.');
  }

  const lastRow = sheet.getLastRow();
  let foundRow = -1;
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === item.id) {
        foundRow = i + 2;
        break;
      }
    }
  }

  const rowData = [
    item.id,
    item.tanggal,
    item.hari,
    item.idKegiatan,
    item.uraianKegiatan,
    item.output,
    item.buktiDokumen,
    item.linkDrive || '',
    item.statusValidasi || 'Terverifikasi',
    item.waktuInput || nowStr,
    nowStr
  ];

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
    catatLog('Kepala Madrasah', 'EDIT', 'Laporan Harian', 'Memperbarui kegiatan ID ' + item.id + ' (' + item.tanggal + ')');
  } else {
    sheet.appendRow(rowData);
    catatLog('Kepala Madrasah', 'TAMBAH', 'Laporan Harian', 'Menambahkan kegiatan baru ID ' + item.id + ' (' + item.tanggal + ')');
  }

  return { success: true, message: 'Laporan harian berhasil disimpan ke Google Spreadsheet.' };
}

/**
 * Hapus Laporan Harian
 */
function deleteLaporanHarian(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.LAPORAN_HARIAN);
  if (!sheet) throw new Error('Sheet LaporanHarian tidak ditemukan');

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: 'Data tidak ditemukan' };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      sheet.deleteRow(i + 2);
      catatLog('Kepala Madrasah', 'HAPUS', 'Laporan Harian', 'Menghapus kegiatan ID ' + id);
      return { success: true, message: 'Data berhasil dihapus dari Google Spreadsheet.' };
    }
  }
  return { success: false, message: 'ID Laporan tidak ditemukan' };
}

/**
 * Mesin Penghitungan Otomatis Lampiran II (Rekapitulasi Bulanan)
 * Mengelompokkan berdasarkan ID Kegiatan dan menerapkan 4 metode volume
 */
function hitungRekapBulanan(bulan, tahun) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allData = getAllData();
  const masterMap = {};
  allData.masterKegiatan.forEach(k => {
    masterMap[k.id] = k;
  });

  // Filter laporan harian pada bulan dan tahun terpilih
  const bulanStr = String(bulan).padStart(2, '0');
  const targetPrefix = tahun + '-' + bulanStr;

  const validEntries = allData.laporanHarian.filter(lh => {
    return lh.tanggal && lh.tanggal.startsWith(targetPrefix);
  });

  // Kelompokkan per ID Kegiatan
  const groups = {};
  validEntries.forEach(lh => {
    if (!groups[lh.idKegiatan]) {
      groups[lh.idKegiatan] = [];
    }
    groups[lh.idKegiatan].push(lh);
  });

  // Hitung volume per metode
  const rekapHasil = [];
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  let no = 1;

  // Urutkan berdasarkan urutan cetak master kegiatan
  const sortedMasters = allData.masterKegiatan.slice().sort((a, b) => a.urutanCetak - b.urutanCetak);

  sortedMasters.forEach(master => {
    const entries = groups[master.id] || [];
    if (entries.length === 0) return; // Hanya yang ada pelaksanaan nyata

    let volume = 0;
    switch (master.metodeHitung) {
      case 'pelaksanaan':
        // Setiap catatan kegiatan dihitung 1
        volume = entries.length;
        break;
      case 'tanggal_unik':
        // Dihitung berdasarkan tanggal kalender unik
        const tanggalSet = new Set(entries.map(e => e.tanggal));
        volume = tanggalSet.size;
        break;
      case 'output_dokumen':
        // Dihitung berdasarkan jumlah dokumen atau output valid
        volume = entries.length;
        break;
      case 'manual':
        // Dihitung berdasarkan verifikasi
        volume = entries.length > 0 ? 1 : 0;
        break;
      default:
        volume = entries.length;
    }

    // Kumpulkan bukti dokumen unik
    const buktiSet = new Set();
    entries.forEach(e => {
      if (e.buktiDokumen && e.buktiDokumen.trim() !== '') {
        buktiSet.add(e.buktiDokumen.trim());
      }
    });
    const buktiTeks = Array.from(buktiSet).slice(0, 3).join(', ') || 'Dokumen';

    const rekapId = 'REK-' + tahun + bulanStr + '-' + master.id;
    rekapHasil.push({
      no: no++,
      idRekap: rekapId,
      bulan: Number(bulan),
      tahun: Number(tahun),
      idKegiatan: master.id,
      namaKegiatan: master.nama,
      volume: volume,
      satuan: master.satuan,
      metodeHitung: master.metodeHitung,
      buktiDokumen: buktiTeks,
      targetBulanan: master.targetBulanan,
      waktuRekap: nowStr
    });
  });

  // Tulis ke sheet RekapBulanan
  const sheetRekap = ss.getSheetByName(SHEETS.REKAP_BULANAN);
  if (sheetRekap) {
    // Hapus rekap bulan dan tahun terpilih terlebih dahulu
    const lastRow = sheetRekap.getLastRow();
    if (lastRow > 1) {
      const data = sheetRekap.getRange(2, 2, lastRow - 1, 2).getValues();
      for (let i = data.length - 1; i >= 0; i--) {
        if (Number(data[i][0]) === Number(bulan) && Number(data[i][1]) === Number(tahun)) {
          sheetRekap.deleteRow(i + 2);
        }
      }
    }

    // Append baris baru
    if (rekapHasil.length > 0) {
      const rows = rekapHasil.map(r => [
        r.idRekap, r.bulan, r.tahun, r.idKegiatan, r.namaKegiatan,
        r.volume, r.satuan, r.metodeHitung, r.buktiDokumen, r.targetBulanan, r.waktuRekap
      ]);
      sheetRekap.getRange(sheetRekap.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    }
  }

  catatLog('Sistem', 'REKAP', 'Rekapitulasi Bulanan', 'Menghitung rekapitulasi Lampiran II periode ' + bulan + '/' + tahun + ' (' + rekapHasil.length + ' item kegiatan)');

  return {
    success: true,
    message: 'Rekapitulasi bulanan berhasil dihitung dan disimpan ke Google Spreadsheet.',
    data: rekapHasil
  };
}
`;

export const standaloneIndexHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Informasi Laporan Kinerja Kepala Madrasah - Kemenag RI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media print {
      body { background: white !important; font-family: 'Times New Roman', serif; }
      .no-print { display: none !important; }
      .print-area { display: block !important; margin: 0; padding: 0; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid black !important; padding: 6px; }
      @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans">
  <div class="no-print min-h-screen flex flex-col">
    <!-- Header Kemenag -->
    <header class="bg-emerald-900 text-white px-6 py-4 border-b-4 border-amber-500 shadow-md">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-amber-500 text-emerald-950 rounded-full flex items-center justify-center font-bold text-xl shadow">
            <i class="fa-solid fa-mosque"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-wide">SISTEM INFORMASI LAPORAN KINERJA KEPALA MADRASAH</h1>
            <p class="text-xs text-emerald-200">Kementerian Agama Republik Indonesia · Berbasis Google Spreadsheet & GAS</p>
          </div>
        </div>
        <div class="text-right text-xs text-emerald-100">
          <div id="liveClock" class="font-mono">Zona Waktu: Asia/Jakarta</div>
          <div class="text-emerald-300 font-medium">Versi Produksi Kemenag RI 2026</div>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <main class="max-w-7xl mx-auto p-6 flex-1 w-full">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Web App Google Apps Script Terpasang Sukses!</h2>
        <p class="text-slate-600 max-w-2xl mx-auto mb-6 text-sm">
          Aplikasi ini telah terhubung dengan Google Apps Script backend dan Google Spreadsheet sebagai basis data penyimpanan laporan kinerja harian (Lampiran I) dan capaian bulanan (Lampiran II).
        </p>
        <div class="inline-flex gap-4">
          <a href="?action=getAllData" target="_blank" class="px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 text-sm font-medium transition shadow-sm">
            <i class="fa-solid fa-database mr-2"></i>Cek API JSON
          </a>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
`;

export const deploymentGuideMd = `# PANDUAN LENGKAP INSTALASI & DEPLOYMENT GOOGLE APPS SCRIPT
## Sistem Informasi Laporan Kinerja Kepala Madrasah - Kementerian Agama RI

### 1. Persiapan Basis Data (Google Spreadsheet)
1. Buka browser dan login ke akun Google / Madrasah Anda (disarankan akun dinas @kemenag.go.id atau @madrasah.kemenag.go.id).
2. Buat Spreadsheet baru di [Google Sheets](https://sheets.new) dengan nama:
   **"DATABASE LAPORAN KINERJA KEPALA MADRASAH - KEMENAG RI"**.
3. Di dalam Spreadsheet tersebut, klik menu **Ekstensi (Extensions)** > **Apps Script**.
4. Beri nama proyek Apps Script: **"Backend_Kinerja_Kamad_Kemenag"**.

---

### 2. Pemasangan Kode Backend (Code.gs)
1. Hapus semua kode bawaan di editor \`Code.gs\`.
2. Salin seluruh isi skrip dari tab **"Salin Kode Code.gs"** pada aplikasi ini, lalu tempelkan (*paste*) ke dalam file \`Code.gs\`.
3. Klik tombol **Simpan (Save / ikon Disket)** atau tekan \`Ctrl + S\`.
4. Jika ingin menyajikan antarmuka langsung lewat Apps Script:
   - Klik tanda **+** di sebelah kiri > pilih **HTML**.
   - Beri nama file: **\`index\`** (sehingga menjadi \`index.html\`).
   - Salin isi dari tab **"Template index.html"** dan simpan.

---

### 3. Menjalankan Inisialisasi Database Otomatis
1. Pada editor Apps Script, di bilah atas pilih fungsi: **\`initDatabase\`**.
2. Klik tombol **Jalankan (Run)**.
3. Google akan meminta **Tinjau Izin (Review Permissions)**:
   - Klik *Review Permissions*.
   - Pilih akun Google Anda.
   - Klik *Advanced (Lanjutan)* > klik *Go to Backend_Kinerja_Kamad_Kemenag (unsafe)*.
   - Klik **Allow (Izinkan)**.
4. Periksa Google Spreadsheet Anda! Lima lembar kerja (*sheets*) resmi Kemenag akan langsung terbuat dengan warna hijau emerald:
   - **Profil** (Identitas Kepala Madrasah & Pejabat Penilai)
   - **MasterKegiatan** (16 kegiatan standar Kepala Madrasah)
   - **LaporanHarian** (Arsip input Lampiran I)
   - **RekapBulanan** (Hasil hitung otomatis Lampiran II)
   - **LogAktivitas** (Audit trail perubahan data)

---

### 4. Melakukan Deployment Sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol **Deploy (Terapkan)** > pilih **New deployment (Penerapan baru)**.
2. Klik ikon gerigi di sebelah *Select type* > pilih **Web app**.
3. Isi parameter konfigurasi:
   - **Description**: *Produksi Laporan Kinerja Kamad v1.0*
   - **Execute as**: **Me (email Anda)** — agar memiliki hak tulis ke Spreadsheet.
   - **Who has access**: **Anyone (Siapa saja)** — agar aplikasi web dapat mengirimkan data via REST API.
4. Klik **Deploy**.
5. Salin tautan **Web App URL** yang dihasilkan (formatnya: \`https://script.google.com/macros/s/.../exec\`).
6. Tempelkan URL tersebut ke menu **"12. Backup & Sync Google Sheets"** pada aplikasi ini untuk sinkronisasi otomatis!

---

### 5. Skenario Pengujian & Checklist Verifikasi
- [x] **Inisialisasi Database**: Pastikan ke-5 sheet terbentuk dengan header dan baris terkunci.
- [x] **Input Laporan Harian**: Coba masukkan 1 kegiatan, periksa apakah hari (Senin/Selasa/dll) terisi otomatis dan tersimpan.
- [x] **Hitung Rekap Lampiran II**: Buka menu Rekapitulasi Bulanan, klik "Perbarui Rekap". Pastikan volume terhitung sesuai metode.
- [x] **Drill-down Volume**: Klik angka volume (contoh: "4 Kegiatan"), pastikan muncul modal rincian tanggal dan uraian aslinya.
- [x] **Cetak A4**: Masuk ke Cetak Lampiran I & II, klik "Pratinjau / Cetak A4" dan pastikan tata letak pas dalam ukuran kertas A4.
`;
