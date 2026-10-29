import React from 'react';
import { Calendar, Printer, ShieldCheck, Lock, Unlock, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAMA_BULAN } from '../utils/dateUtils';

export const Header: React.FC = () => {
  const {
    profile,
    madrasah,
    selectedBulan,
    setSelectedBulan,
    selectedTahun,
    setSelectedTahun,
    isBulanTerkunci,
    setActiveMenu,
  } = useApp();

  const terkunci = isBulanTerkunci(selectedBulan, selectedTahun);

  return (
    <header className="bg-emerald-900 text-white border-b-4 border-amber-500 shadow-md sticky top-0 z-30 print-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Judul Aplikasi */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-amber-400 font-bold text-xl shadow-inner shrink-0">
              <span className="font-serif tracking-tighter">KM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-wide text-white font-sans uppercase">
                  Sistem Informasi Laporan Kinerja Kepala Madrasah
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-800 text-amber-300 rounded border border-emerald-700">
                  Kemenag RI
                </span>
              </div>
              <p className="text-xs text-emerald-200 truncate max-w-xl">
                {madrasah.namaMadrasah} · {profile.nama}
              </p>
            </div>
          </div>

          {/* Filter Periode & Action Cepat */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            {/* Pemilih Periode */}
            <div className="flex items-center bg-emerald-950/70 rounded-lg p-1 border border-emerald-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1" />
              <select
                aria-label="Pilih Bulan Laporan"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-medium px-2 py-1 rounded focus:outline-none focus:bg-emerald-900 cursor-pointer"
              >
                {NAMA_BULAN.map((bln, idx) => (
                  <option key={bln} value={idx + 1} className="bg-slate-900 text-white">
                    {bln}
                  </option>
                ))}
              </select>
              <select
                aria-label="Pilih Tahun Laporan"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-medium px-2 py-1 rounded focus:outline-none focus:bg-emerald-900 cursor-pointer border-l border-emerald-800"
              >
                {[2024, 2025, 2026, 2027].map((thn) => (
                  <option key={thn} value={thn} className="bg-slate-900 text-white">
                    {thn}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Laporan Bulan Terpilih */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                terkunci
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
              }`}
            >
              {terkunci ? (
                <>
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Terkunci</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span>Aktif (Draft)</span>
                </>
              )}
            </div>

            {/* Tombol Cetak Cepat */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveMenu('cetak-lampiran-1')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition border border-emerald-700 shadow-sm"
                title="Pratinjau & Cetak Lampiran I"
              >
                <Printer className="w-3 h-3 text-amber-400" />
                <span>Lamp. I</span>
              </button>
              <button
                onClick={() => setActiveMenu('cetak-lampiran-2')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition border border-emerald-700 shadow-sm"
                title="Pratinjau & Cetak Lampiran II"
              >
                <Printer className="w-3 h-3 text-amber-400" />
                <span>Lamp. II</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
