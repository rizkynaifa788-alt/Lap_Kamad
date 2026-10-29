import React, { useMemo } from 'react';
import { Printer, ArrowLeft, Download, ShieldCheck, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAMA_BULAN, formatTanggalIndo } from '../utils/dateUtils';
import { exportLampiran1ToWord } from '../utils/exportWord';

export const CetakLampiran1View: React.FC = () => {
  const {
    profile,
    madrasah,
    penandatangan,
    laporanHarian,
    selectedBulan,
    selectedTahun,
    setActiveMenu,
  } = useApp();

  const bulanNama = NAMA_BULAN[selectedBulan - 1];

  // Ambil laporan harian pada bulan terpilih
  const currentEntries = useMemo(() => {
    const prefix = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`;
    return laporanHarian
      .filter((l) => l.tanggal.startsWith(prefix))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [laporanHarian, selectedBulan, selectedTahun]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    exportLampiran1ToWord({
      profile,
      madrasah,
      penandatangan,
      entries: currentEntries,
      bulan: selectedBulan,
      tahun: selectedTahun,
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (Tidak ikut dicetak) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveMenu('data-harian')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Kembali ke Data Harian"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase">
              Pratinjau Cetak Lampiran I (Laporan Kinerja Harian)
            </h2>
            <p className="text-xs text-slate-500">
              Format formal ukuran A4 standar Kementerian Agama RI ({currentEntries.length} Baris Kegiatan)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            title="Unduh dokumen dalam format Microsoft Word (.doc / .docx)"
          >
            <FileDown className="w-4 h-4 text-blue-200" />
            <span>Ekspor ke Word (.doc)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Dokumen Resmi (A4 / PDF)</span>
          </button>
        </div>
      </div>

      {/* Lembar Dokumen Formal (Standar Kemenag RI A4) */}
      <div className="print-document bg-white mx-auto p-8 sm:p-12 max-w-4xl border border-slate-300 shadow-md text-slate-900 font-serif leading-normal">
        {/* Kop Surat Madrasah */}
        <div className="text-center pb-3 border-b-2 border-black">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black leading-tight whitespace-pre-line">
            {madrasah.kopSuratTeks || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA\nKANTOR KEMENTERIAN AGAMA'}
          </div>
          <div className="text-[10px] text-slate-800 font-sans mt-1">
            Alamat: {madrasah.alamat}, {madrasah.kotaKabupaten}, {madrasah.provinsi} · Telp: {madrasah.telepon || '-'}
          </div>
        </div>
        <div className="h-0.5 bg-black mt-0.5 mb-5" />

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h1 className="text-sm sm:text-base font-bold uppercase underline tracking-wide">
            LAPORAN KINERJA HARIAN KEPALA MADRASAH
          </h1>
          <div className="text-xs font-bold uppercase mt-1">
            BULAN: {bulanNama} {selectedTahun}
          </div>
        </div>

        {/* Identitas Pegawai */}
        <div className="mb-5 text-xs text-black font-sans">
          <table className="w-full max-w-xl text-left border-collapse">
            <tbody>
              <tr>
                <td className="w-36 py-0.5 font-semibold">Nama Pegawai</td>
                <td className="w-4 py-0.5">:</td>
                <td className="py-0.5 font-bold uppercase">{profile.nama}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">NIP</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5 font-mono">{profile.nip}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">Pangkat / Gol. Ruang</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{profile.pangkatGol}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">Jabatan</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{profile.jabatan}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">Satuan Kerja / Unit</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{madrasah.namaMadrasah}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel 5 Kolom Lampiran I Sesuai Ketentuan */}
        <table className="print-table w-full border-collapse text-xs border border-black mb-6">
          <thead>
            <tr className="bg-slate-100 text-center font-bold">
              <th className="border border-black p-2 w-10">No</th>
              <th className="border border-black p-2 w-20">Hari</th>
              <th className="border border-black p-2 w-24">Tanggal</th>
              <th className="border border-black p-2">Uraian Kegiatan</th>
              <th className="border border-black p-2 w-52">Output / Hasil / Bukti Dokumen</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black p-6 text-center text-slate-500 italic">
                  Tidak ada catatan kegiatan harian pada periode ini.
                </td>
              </tr>
            ) : (
              currentEntries.map((row, idx) => (
                <tr key={row.id}>
                  <td className="border border-black p-2 text-center font-mono align-top">
                    {idx + 1}
                  </td>
                  <td className="border border-black p-2 text-center align-top font-sans font-medium">
                    {row.hari}
                  </td>
                  <td className="border border-black p-2 text-center align-top font-mono">
                    {formatTanggalIndo(row.tanggal)}
                  </td>
                  <td className="border border-black p-2 align-top text-justify font-sans leading-relaxed">
                    {row.uraianKegiatan}
                  </td>
                  <td className="border border-black p-2 align-top font-sans text-xs">
                    <div className="font-semibold">{row.output || '-'}</div>
                    <div className="text-[11px] text-slate-700 italic mt-0.5">
                      Bukti: {row.buktiDokumen || 'Dokumen'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Area Tanda Tangan Resmi */}
        <div className="signature-block grid grid-cols-2 gap-8 text-xs font-sans text-center mt-8 pt-4">
          <div>
            <p className="font-semibold">Mengetahui,</p>
            <p className="font-semibold text-slate-800">{penandatangan.pejabatJabatan}</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{penandatangan.pejabatNama}</p>
            <p className="text-[11px] font-mono">NIP. {penandatangan.pejabatNip}</p>
          </div>

          <div>
            <p>
              {penandatangan.lokasiTtd || 'Jakarta'}, {penandatangan.formatTanggal || `31 ${bulanNama} ${selectedTahun}`}
            </p>
            <p className="font-semibold text-slate-800">Kepala Madrasah,</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{profile.nama}</p>
            <p className="text-[11px] font-mono">NIP. {profile.nip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
