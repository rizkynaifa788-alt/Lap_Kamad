import { ProfileKepala, MadrasahInfo, PenandatanganInfo, LaporanHarian, RekapBulananItem } from '../types';
import { formatTanggalIndo, NAMA_BULAN } from './dateUtils';

interface ExportLampiran1Options {
  profile: ProfileKepala;
  madrasah: MadrasahInfo;
  penandatangan: PenandatanganInfo;
  entries: LaporanHarian[];
  bulan: number;
  tahun: number;
}

interface ExportLampiran2Options {
  profile: ProfileKepala;
  madrasah: MadrasahInfo;
  penandatangan: PenandatanganInfo;
  items: RekapBulananItem[];
  bulan: number;
  tahun: number;
}

/**
 * Ekspor Dokumen Resmi Lampiran I ke format Microsoft Word (.doc / .docx compatible)
 */
export function exportLampiran1ToWord(options: ExportLampiran1Options): void {
  const { profile, madrasah, penandatangan, entries, bulan, tahun } = options;
  const bulanNama = NAMA_BULAN[bulan - 1];

  const rowsHtml = entries
    .map(
      (row, idx) => `
    <tr>
      <td style="border: 1pt solid #000000; padding: 6px; text-align: center; vertical-align: top;">${idx + 1}</td>
      <td style="border: 1pt solid #000000; padding: 6px; text-align: center; vertical-align: top; font-weight: bold;">${row.hari}</td>
      <td style="border: 1pt solid #000000; padding: 6px; text-align: center; vertical-align: top;">${formatTanggalIndo(row.tanggal)}</td>
      <td style="border: 1pt solid #000000; padding: 6px; text-align: justify; vertical-align: top;">${row.uraianKegiatan}</td>
      <td style="border: 1pt solid #000000; padding: 6px; vertical-align: top;">
        <strong>${row.output || '-'}</strong><br/>
        <span style="font-size: 9.5pt; font-style: italic;">Bukti: ${row.buktiDokumen || 'Dokumen'}</span>
      </td>
    </tr>`
    )
    .join('');

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Lampiran I Laporan Kinerja Harian</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 2.0cm 2.0cm 2.0cm 2.0cm;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; color: #000; }
    table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    p { margin: 0 0 6pt 0; }
    .header-kop { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 11pt; }
    .line-thick { border-top: 2.5pt solid #000; margin-top: 6pt; }
    .line-thin { border-top: 1pt solid #000; margin-top: 1.5pt; margin-bottom: 14pt; }
    .title-doc { text-align: center; font-weight: bold; font-size: 13pt; text-decoration: underline; text-transform: uppercase; }
    .title-sub { text-align: center; font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 14pt; }
    .table-data th { border: 1pt solid #000; padding: 6px; background-color: #f2f2f2; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
<div class="Section1">
  <!-- Kop Madrasah -->
  <div class="header-kop">
    ${(madrasah.kopSuratTeks || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA').replace(/\n/g, '<br/>')}
  </div>
  <div style="text-align: center; font-size: 9pt; font-family: Arial, sans-serif; margin-top: 3pt;">
    Alamat: ${madrasah.alamat}, ${madrasah.kotaKabupaten}, ${madrasah.provinsi} | Telp: ${madrasah.telepon || '-'}
  </div>
  <div class="line-thick"></div>
  <div class="line-thin"></div>

  <!-- Judul Dokumen -->
  <div class="title-doc">LAPORAN KINERJA HARIAN KEPALA MADRASAH</div>
  <div class="title-sub">BULAN: ${bulanNama.toUpperCase()} TAHUN ${tahun}</div>

  <!-- Identitas Pegawai -->
  <table style="width: 100%; margin-bottom: 12pt; font-size: 10.5pt;">
    <tr>
      <td style="width: 160px; padding: 2px 0; font-weight: bold;">Nama Pegawai</td>
      <td style="width: 15px; padding: 2px 0;">:</td>
      <td style="padding: 2px 0; font-weight: bold; text-transform: uppercase;">${profile.nama}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">NIP</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0; font-family: monospace;">${profile.nip}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Pangkat / Gol. Ruang</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${profile.pangkatGol}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Jabatan</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${profile.jabatan}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Satuan Kerja / Unit</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${madrasah.namaMadrasah}</td>
    </tr>
  </table>

  <!-- Tabel 5 Kolom Lampiran I -->
  <table class="table-data" style="margin-bottom: 20pt; font-size: 10pt;">
    <thead>
      <tr>
        <th style="width: 35px;">No</th>
        <th style="width: 75px;">Hari</th>
        <th style="width: 85px;">Tanggal</th>
        <th>Uraian Kegiatan</th>
        <th style="width: 190px;">Output / Hasil / Bukti Dokumen</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="5" style="border: 1pt solid #000; text-align: center; padding: 10px;">Belum ada catatan kegiatan harian.</td></tr>'}
    </tbody>
  </table>

  <!-- Area Tanda Tangan -->
  <table style="width: 100%; margin-top: 25pt; font-size: 10.5pt; text-align: center;">
    <tr>
      <td style="width: 50%; vertical-align: top;">
        Mengetahui,<br/>
        <strong>${penandatangan.pejabatJabatan}</strong>
        <br/><br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${penandatangan.pejabatNama}</strong><br/>
        NIP. ${penandatangan.pejabatNip}
      </td>
      <td style="width: 50%; vertical-align: top;">
        ${penandatangan.lokasiTtd || 'Jakarta'}, ${penandatangan.formatTanggal || `31 ${bulanNama} ${tahun}`}<br/>
        <strong>Kepala Madrasah,</strong>
        <br/><br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${profile.nama}</strong><br/>
        NIP. ${profile.nip}
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;

  downloadWordFile(wordContent, `Lampiran_I_Laporan_Kinerja_Harian_${bulanNama}_${tahun}.doc`);
}

/**
 * Ekspor Dokumen Resmi Lampiran II ke format Microsoft Word (.doc / .docx compatible)
 */
export function exportLampiran2ToWord(options: ExportLampiran2Options): void {
  const { profile, madrasah, penandatangan, items, bulan, tahun } = options;
  const bulanNama = NAMA_BULAN[bulan - 1];

  const rowsHtml = items
    .map(
      (item, idx) => `
    <tr>
      <td style="border: 1pt solid #000000; padding: 7px; text-align: center; vertical-align: middle;">${idx + 1}</td>
      <td style="border: 1pt solid #000000; padding: 7px; vertical-align: middle; font-weight: bold;">${item.namaKegiatan}</td>
      <td style="border: 1pt solid #000000; padding: 7px; text-align: center; vertical-align: middle; font-weight: bold;">${item.volume} ${item.satuan}</td>
      <td style="border: 1pt solid #000000; padding: 7px; vertical-align: middle;">${item.buktiDokumen || 'Dokumen'}</td>
    </tr>`
    )
    .join('');

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Lampiran II Laporan Capaian Kinerja Bulanan</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 2.0cm 2.0cm 2.0cm 2.0cm;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; color: #000; }
    table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    p { margin: 0 0 6pt 0; }
    .header-kop { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 11pt; }
    .line-thick { border-top: 2.5pt solid #000; margin-top: 6pt; }
    .line-thin { border-top: 1pt solid #000; margin-top: 1.5pt; margin-bottom: 12pt; }
    .title-doc { text-align: center; font-weight: bold; font-size: 13pt; text-decoration: underline; text-transform: uppercase; }
    .title-sub { text-align: center; font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 14pt; }
    .table-data th { border: 1pt solid #000; padding: 7px; background-color: #f2f2f2; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
<div class="Section1">
  <!-- Kop Madrasah -->
  <div class="header-kop">
    ${(madrasah.kopSuratTeks || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA').replace(/\n/g, '<br/>')}
  </div>
  <div style="text-align: center; font-size: 9pt; font-family: Arial, sans-serif; margin-top: 3pt;">
    Alamat: ${madrasah.alamat}, ${madrasah.kotaKabupaten}, ${madrasah.provinsi} | Telp: ${madrasah.telepon || '-'}
  </div>
  <div class="line-thick"></div>
  <div class="line-thin"></div>

  <!-- Label Lampiran II -->
  <div style="text-align: right; font-style: italic; font-weight: bold; font-size: 10pt; margin-bottom: 6pt;">
    LAMPIRAN II
  </div>

  <!-- Judul Dokumen -->
  <div class="title-doc">LAPORAN CAPAIAN KINERJA BULANAN KEPALA MADRASAH</div>
  <div class="title-sub">PERIODE: BULAN ${bulanNama.toUpperCase()} TAHUN ${tahun}</div>

  <!-- Identitas Pegawai -->
  <table style="width: 100%; margin-bottom: 12pt; font-size: 10.5pt;">
    <tr>
      <td style="width: 180px; padding: 2px 0; font-weight: bold;">Nama Kepala Madrasah</td>
      <td style="width: 15px; padding: 2px 0;">:</td>
      <td style="padding: 2px 0; font-weight: bold; text-transform: uppercase;">${profile.nama}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">NIP</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0; font-family: monospace;">${profile.nip}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Pangkat / Gol. Ruang</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${profile.pangkatGol}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Jabatan</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${profile.jabatan}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Satuan Kerja</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${madrasah.namaMadrasah}</td>
    </tr>
    <tr>
      <td style="padding: 2px 0; font-weight: bold;">Unit Kerja Pembina</td>
      <td style="padding: 2px 0;">:</td>
      <td style="padding: 2px 0;">${penandatangan.pejabatInstansi}</td>
    </tr>
  </table>

  <!-- Tabel 4 Kolom Lampiran II -->
  <table class="table-data" style="margin-bottom: 20pt; font-size: 10.5pt;">
    <thead>
      <tr>
        <th style="width: 40px;">No</th>
        <th>Uraian Tugas / Kegiatan</th>
        <th style="width: 140px;">Volume</th>
        <th style="width: 220px;">Bukti Dokumen</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="4" style="border: 1pt solid #000; text-align: center; padding: 12px;">Belum ada capaian kinerja bulanan terakumulasi.</td></tr>'}
    </tbody>
  </table>

  <!-- Area Tanda Tangan -->
  <table style="width: 100%; margin-top: 25pt; font-size: 10.5pt; text-align: center;">
    <tr>
      <td style="width: 50%; vertical-align: top;">
        Pejabat Penilai Kinerja,<br/>
        <strong>${penandatangan.pejabatJabatan}</strong>
        <br/><br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${penandatangan.pejabatNama}</strong><br/>
        NIP. ${penandatangan.pejabatNip}
      </td>
      <td style="width: 50%; vertical-align: top;">
        ${penandatangan.lokasiTtd || 'Jakarta'}, ${penandatangan.formatTanggal || `31 ${bulanNama} ${tahun}`}<br/>
        <strong>Kepala Madrasah Yang Dinilai,</strong>
        <br/><br/><br/><br/><br/>
        <strong style="text-decoration: underline; text-transform: uppercase;">${profile.nama}</strong><br/>
        NIP. ${profile.nip}
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;

  downloadWordFile(wordContent, `Lampiran_II_Capaian_Kinerja_Bulanan_${bulanNama}_${tahun}.doc`);
}

/**
 * Helper untuk mengunduh string HTML sebagai berkas Microsoft Word (.doc)
 */
function downloadWordFile(content: string, filename: string): void {
  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
