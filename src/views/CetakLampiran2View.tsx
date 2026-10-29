import React from 'react';
import { Printer, ArrowLeft, RefreshCw, Layers, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAMA_BULAN } from '../utils/dateUtils';
import { exportLampiran2ToWord } from '../utils/exportWord';

export const CetakLampiran2View: React.FC = () => {
  const {
    profile,
    madrasah,
    penandatangan,
    rekapBulanan,
    selectedBulan,
    selectedTahun,
    setActiveMenu,
    perbaruiRekap,
  } = useApp();

  const bulanNama = NAMA_BULAN[selectedBulan - 1];

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    exportLampiran2ToWord({
      profile,
      madrasah,
      penandatangan,
      items: rekapBulanan,
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
            onClick={() => setActiveMenu('rekap-bulanan')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Kembali ke Rekapitulasi"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase">
              Pratinjau Cetak Lampiran II (Laporan Capaian Kinerja Bulanan)
            </h2>
            <p className="text-xs text-slate-500">
              Format formal 4 kolom ukuran A4 standar Kementerian Agama RI ({rekapBulanan.length} Tugas Terlaksana)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={perbaruiRekap}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-800" />
            <span>Sinkron Ulang</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            title="Unduh format Microsoft Word (.doc / .docx)"
          >
            <FileDown className="w-4 h-4 text-blue-200" />
            <span>Ekspor ke Word (.doc)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak Dokumen Resmi (A4 / PDF)</span>
          </button>
        </div>
      </div>

      {/* Lembar Dokumen Formal Lampiran II (Ukuran A4 Kemenag) */}
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

        {/* Header Lampiran II */}
        <div className="flex justify-between items-start text-xs font-sans mb-3">
          <div />
          <div className="text-right italic font-semibold">
            LAMPIRAN II
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h1 className="text-sm sm:text-base font-bold uppercase underline tracking-wide">
            LAPORAN CAPAIAN KINERJA BULANAN KEPALA MADRASAH
          </h1>
          <div className="text-xs font-bold uppercase mt-1">
            PERIODE: BULAN {bulanNama.toUpperCase()} TAHUN {selectedTahun}
          </div>
        </div>

        {/* Identitas Pegawai & Satuan Kerja */}
        <div className="mb-5 text-xs text-black font-sans">
          <table className="w-full max-w-xl text-left border-collapse">
            <tbody>
              <tr>
                <td className="w-40 py-0.5 font-semibold">Nama Kepala Madrasah</td>
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
                <td className="py-0.5 font-semibold">Satuan Kerja</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{madrasah.namaMadrasah}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-semibold">Unit Kerja Pembina</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">{penandatangan.pejabatInstansi}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Resmi 4 Kolom Lampiran II */}
        <table className="print-table w-full border-collapse text-xs border border-black mb-6">
          <thead>
            <tr className="bg-slate-100 text-center font-bold">
              <th className="border border-black p-2.5 w-12 text-center">No</th>
              <th className="border border-black p-2.5">Uraian Tugas / Kegiatan</th>
              <th className="border border-black p-2.5 w-36 text-center">Volume</th>
              <th className="border border-black p-2.5 w-56">Bukti Dokumen</th>
            </tr>
          </thead>
          <tbody>
            {rekapBulanan.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-black p-6 text-center text-slate-500 italic">
                  Belum ada capaian kinerja bulanan yang terakumulasi pada periode ini.
                </td>
              </tr>
            ) : (
              rekapBulanan.map((item, idx) => (
                <tr key={item.idKegiatan}>
                  <td className="border border-black p-2 text-center font-mono align-middle">
                    {idx + 1}
                  </td>
                  <td className="border border-black p-2 align-middle font-sans">
                    <div className="font-semibold text-slate-900">{item.namaKegiatan}</div>
                  </td>
                  <td className="border border-black p-2 text-center align-middle font-mono font-bold font-sans">
                    {item.volume} {item.satuan}
                  </td>
                  <td className="border border-black p-2 align-middle font-sans text-xs">
                    {item.buktiDokumen || 'Dokumen'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Area Tanda Tangan Resmi Lampiran II */}
        <div className="signature-block grid grid-cols-2 gap-8 text-xs font-sans text-center mt-10 pt-4">
          <div>
            <p className="font-semibold">Pejabat Penilai Kinerja,</p>
            <p className="font-semibold text-slate-800">{penandatangan.pejabatJabatan}</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{penandatangan.pejabatNama}</p>
            <p className="text-[11px] font-mono">NIP. {penandatangan.pejabatNip}</p>
          </div>

          <div>
            <p>
              {penandatangan.lokasiTtd || 'Jakarta'}, {penandatangan.formatTanggal || `31 ${bulanNama} ${selectedTahun}`}
            </p>
            <p className="font-semibold text-slate-800">Kepala Madrasah Yang Dinilai,</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{profile.nama}</p>
            <p className="text-[11px] font-mono">NIP. {profile.nip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
