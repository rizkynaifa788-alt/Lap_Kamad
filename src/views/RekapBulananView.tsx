import React, { useState } from 'react';
import {
  Calculator,
  RefreshCw,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Target,
  FileText,
  Calendar,
  Layers,
  Info,
  FileDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RekapBulananItem } from '../types';
import { NAMA_BULAN } from '../utils/dateUtils';
import { DrillDownModal } from '../components/DrillDownModal';
import { exportLampiran2ToWord } from '../utils/exportWord';

export const RekapBulananView: React.FC = () => {
  const {
    profile,
    madrasah,
    penandatangan,
    rekapBulanan,
    rekapTimestamp,
    perbaruiRekap,
    selectedBulan,
    selectedTahun,
    setActiveMenu,
    isBulanTerkunci,
  } = useApp();

  const [drillDownItem, setDrillDownItem] = useState<RekapBulananItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bulanNama = NAMA_BULAN[selectedBulan - 1];
  const terkunci = isBulanTerkunci(selectedBulan, selectedTahun);

  const handleRefresh = () => {
    setIsRefreshing(true);
    perbaruiRekap();
    setTimeout(() => setIsRefreshing(false), 500);
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

  const totalVolume = rekapBulanan.reduce((sum, item) => sum + item.volume, 0);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Rekapitulasi Capaian Kinerja Bulanan (Lampiran II)
            </h2>
            <p className="text-xs text-slate-500">
              Hasil integrasi dan kalkulasi otomatis dari Laporan Kinerja Harian berdasarkan aturan volume
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
            title="Hitung Ulang Rekapitulasi dari Laporan Harian"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-800' : ''}`} />
            <span>Perbarui Rekap</span>
          </button>

          <button
            onClick={handleExportWord}
            disabled={rekapBulanan.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
            title="Unduh Lampiran II dalam format Microsoft Word"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-200" />
            <span>Ekspor Word</span>
          </button>

          <button
            onClick={() => setActiveMenu('cetak-lampiran-2')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Pratinjau & Cetak Lampiran II</span>
          </button>
        </div>
      </div>

      {/* Status Bar Integrasi */}
      <div className="bg-emerald-950 text-white p-4 rounded-xl shadow-xs border border-emerald-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                Periode Rekapitulasi: {bulanNama} {selectedTahun}
              </span>
              <span className="bg-emerald-800 text-emerald-200 px-2 py-0.2 rounded text-[10px] font-mono">
                {rekapBulanan.length} Item Tugas Terlaksana
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 mt-0.5">
              Terakhir diperbarui otomatis: {rekapTimestamp} WIB · Formula audit siap ditelusuri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-emerald-300 block uppercase">Total Akumulasi Volume</span>
            <span className="text-base font-bold font-mono text-amber-300">{totalVolume} Volume</span>
          </div>
        </div>
      </div>

      {/* Petunjuk Klik Drill-down */}
      <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Fitur Transparansi Audit:</strong> Klik pada angka di kolom <strong>Volume</strong> untuk membuka rincian catatan harian, tanggal kalender, dan berkas bukti dokumen yang membentuk angka tersebut.
          </span>
        </div>
      </div>

      {/* Tabel Lampiran II */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Uraian Tugas / Kegiatan Standar</th>
                <th className="p-3 w-40">Kategori Tugas</th>
                <th className="p-3 w-36 text-center">Volume (Klik Audit)</th>
                <th className="p-3 w-36">Metode Hitung</th>
                <th className="p-3 w-28 text-center">Target & Capaian</th>
                <th className="p-3 w-56">Bukti Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rekapBulanan.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada kegiatan harian yang tercatat pada bulan {bulanNama} {selectedTahun}. Silakan tambahkan kegiatan di menu Input Laporan Harian.
                  </td>
                </tr>
              ) : (
                rekapBulanan.map((item) => (
                  <tr key={item.idKegiatan} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center font-mono font-bold text-slate-500">
                      {item.no}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{item.namaKegiatan}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 font-normal">
                        Kode: {item.idKegiatan}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <span className="text-[11px] font-medium text-slate-700">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setDrillDownItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold font-mono text-xs transition shadow-2xs group cursor-pointer"
                        title="Klik untuk membuka rincian log harian"
                      >
                        <span className="group-hover:underline">
                          {item.volume} {item.satuan}
                        </span>
                        <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100" />
                      </button>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-600 capitalize">
                        {item.metodeHitung.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-mono font-bold text-slate-800">
                          {item.persenCapaian}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.persenCapaian >= 100 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.persenCapaian}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5">
                          Tgt: {item.targetBulanan > 0 ? `${item.targetBulanan} ${item.satuan}` : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 text-[11px] leading-relaxed">
                      {item.buktiDokumen}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Audit Drill-Down */}
      <DrillDownModal item={drillDownItem} onClose={() => setDrillDownItem(null)} />
    </div>
  );
};
