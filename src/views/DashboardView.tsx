import React, { useMemo } from 'react';
import {
  FileCheck2,
  CalendarDays,
  Target,
  FileQuestion,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Printer,
  Calculator,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAMA_BULAN, formatTanggalIndo } from '../utils/dateUtils';

export const DashboardView: React.FC = () => {
  const {
    laporanHarian,
    masterKegiatan,
    selectedBulan,
    selectedTahun,
    setActiveMenu,
    rekapBulanan,
    isBulanTerkunci,
  } = useApp();

  const terkunci = isBulanTerkunci(selectedBulan, selectedTahun);
  const bulanNama = NAMA_BULAN[selectedBulan - 1];

  // Filter kegiatan bulan aktif
  const currentMonthEntries = useMemo(() => {
    const prefix = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`;
    return laporanHarian.filter((l) => l.tanggal.startsWith(prefix));
  }, [laporanHarian, selectedBulan, selectedTahun]);

  // Statistik Utama
  const totalKegiatan = currentMonthEntries.length;
  const uniqueDates = useMemo(() => {
    return new Set(currentMonthEntries.map((l) => l.tanggal)).size;
  }, [currentMonthEntries]);

  const uniqueActivities = useMemo(() => {
    return new Set(currentMonthEntries.map((l) => l.idKegiatan)).size;
  }, [currentMonthEntries]);

  const withProofCount = useMemo(() => {
    return currentMonthEntries.filter(
      (l) => (l.buktiDokumen && l.buktiDokumen.trim() !== '') || (l.linkDrive && l.linkDrive.trim() !== '')
    ).length;
  }, [currentMonthEntries]);

  const proofPercentage = totalKegiatan > 0 ? Math.round((withProofCount / totalKegiatan) * 100) : 0;

  // Distribusi Mingguan (Minggu 1 s/d 5)
  const weeklyDistribution = useMemo(() => {
    const weeks = [
      { label: 'Minggu I (1-7)', count: 0 },
      { label: 'Minggu II (8-14)', count: 0 },
      { label: 'Minggu III (15-21)', count: 0 },
      { label: 'Minggu IV (22-28)', count: 0 },
      { label: 'Minggu V (29-31)', count: 0 },
    ];

    currentMonthEntries.forEach((e) => {
      const day = Number(e.tanggal.split('-')[2]);
      if (day <= 7) weeks[0].count++;
      else if (day <= 14) weeks[1].count++;
      else if (day <= 21) weeks[2].count++;
      else if (day <= 28) weeks[3].count++;
      else weeks[4].count++;
    });

    const maxCount = Math.max(...weeks.map((w) => w.count), 1);
    return { weeks, maxCount };
  }, [currentMonthEntries]);

  // Proporsi 12 Bidang Tugas Kepala Madrasah
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const masterMap: Record<string, string> = {};
    masterKegiatan.forEach((m) => {
      masterMap[m.id] = m.kategori;
    });

    currentMonthEntries.forEach((e) => {
      const cat = masterMap[e.idKegiatan] || 'Bidang Perencanaan dan Pengembangan Madrasah';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return counts;
  }, [currentMonthEntries, masterKegiatan]);

  // Peringatan Bukti yang Belum Diunggah
  const missingProofEntries = useMemo(() => {
    return currentMonthEntries.filter(
      (l) => !l.buktiDokumen || l.buktiDokumen.trim() === ''
    );
  }, [currentMonthEntries]);

  // Daftar 5 Kegiatan Terbaru
  const recentEntries = useMemo(() => {
    return [...currentMonthEntries].slice(0, 5);
  }, [currentMonthEntries]);

  return (
    <div className="space-y-6">
      {/* Banner Selamat Datang & Status Periode */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/70 text-amber-300 border border-emerald-700/50">
              Periode Laporan: {bulanNama} {selectedTahun}
            </span>
            <span className="text-xs text-emerald-200">· Zona Waktu Asia/Jakarta</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Dashboard Capaian Kinerja Kepala Madrasah
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5 max-w-2xl">
            Sistem otomatisasi penyusunan Laporan Harian (Lampiran I) dan integrasi rekapitulasi capaian bulanan (Lampiran II) Kementerian Agama RI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveMenu('input-harian')}
            disabled={terkunci}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow transition ${
              terkunci
                ? 'bg-slate-700/50 text-slate-300 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-emerald-950'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Kegiatan Harian</span>
          </button>
          <button
            onClick={() => setActiveMenu('rekap-bulanan')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-950 text-white border border-emerald-700 shadow transition"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>Lihat Rekapitulasi</span>
          </button>
        </div>
      </div>

      {/* 5 Kartu Informasi Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Kartu 1: Total Kegiatan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Catatan Harian</span>
            <FileCheck2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalKegiatan}</div>
            <div className="text-[11px] text-slate-500 mt-1">Kegiatan terekam di Lampiran I</div>
          </div>
        </div>

        {/* Kartu 2: Jenis Kegiatan Unik */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Jenis Tugas Aktif</span>
            <Target className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">{uniqueActivities}</div>
            <div className="text-[11px] text-slate-500 mt-1">Dari 16 master kegiatan Kemenag</div>
          </div>
        </div>

        {/* Kartu 3: Hari Efektif Berisi Kegiatan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Hari Aktif Kerja</span>
            <CalendarDays className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900">{uniqueDates} Hari</div>
            <div className="text-[11px] text-slate-500 mt-1">Tanggal tercatat dalam kalender</div>
          </div>
        </div>

        {/* Kartu 4: Kelengkapan Bukti */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Bukti Dokumen</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-800">{proofPercentage}%</div>
            <div className="text-[11px] text-slate-500 mt-1">{withProofCount} dari {totalKegiatan} berlampiran</div>
          </div>
        </div>

        {/* Kartu 5: Status Laporan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Status Laporan</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded ${
                  terkunci
                    ? 'bg-amber-100 text-amber-900'
                    : totalKegiatan >= 10
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {terkunci ? 'Terkunci (Final)' : totalKegiatan >= 10 ? 'Siap Dicetak' : 'Draf Pengisian'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {rekapBulanan.length} baris di Lampiran II
            </div>
          </div>
        </div>
      </div>

      {/* Grid Grafik & Distribusi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grafik 1: Kegiatan per Minggu */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Distribusi Kegiatan Per Minggu ({bulanNama})
            </h3>
            <span className="text-[11px] text-slate-500">Frekuensi Pelaksanaan</span>
          </div>
          <div className="space-y-3">
            {weeklyDistribution.weeks.map((w, idx) => {
              const pct = (w.count / weeklyDistribution.maxCount) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{w.label}</span>
                    <span className="font-mono text-slate-500 font-semibold">{w.count} Kegiatan</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grafik 2: Distribusi 12 Bidang Tugas Kepala Madrasah */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Distribusi 12 Bidang Tugas Pokok
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {Object.keys(categoryStats).length} Bidang Terlaksana
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {Object.keys(categoryStats).length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Belum ada aktivitas pada periode ini.
              </div>
            ) : (
              Object.entries(categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count], idx) => {
                  const pct = totalKegiatan > 0 ? Math.round((count / totalKegiatan) * 100) : 0;
                  const colors = [
                    'bg-emerald-700',
                    'bg-teal-600',
                    'bg-amber-600',
                    'bg-indigo-600',
                    'bg-sky-600',
                    'bg-cyan-600',
                    'bg-emerald-600',
                    'bg-rose-600',
                  ];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[280px]" title={cat}>
                          {cat}
                        </span>
                        <span className="font-mono text-slate-500 shrink-0 font-semibold">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Peringatan Kerapihan Data & Berkas Bukti Dukung */}
      {missingProofEntries.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-950">
              Pemberitahuan Kelengkapan Dokumen Bukti ({missingProofEntries.length} Kegiatan Belum Memiliki Bukti)
            </h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Terdapat kegiatan yang belum mencantumkan nomor berkas atau bukti dokumen. Lengkapi bukti fisik/digital agar Laporan Capaian Kinerja (Lampiran II) terverifikasi secara sah.
            </p>
            <button
              onClick={() => setActiveMenu('data-harian')}
              className="mt-2 text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 text-xs"
            >
              <span>Periksa Data Laporan Harian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tabel 5 Kegiatan Harian Terbaru */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Catatan Kegiatan Harian Terkini ({bulanNama} {selectedTahun})
          </h3>
          <button
            onClick={() => setActiveMenu('data-harian')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
          >
            <span>Buka Semua Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada catatan kegiatan pada bulan {bulanNama} {selectedTahun}. Klik tombol &quot;Tambah Kegiatan Harian&quot; untuk memulai.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentEntries.map((item, idx) => (
              <div key={item.id} className="p-3.5 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {formatTanggalIndo(item.tanggal)} ({item.hari})
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                        {item.idKegiatan}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-0.5 line-clamp-1">{item.uraianKegiatan}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 shrink-0 md:w-56">
                  <div className="truncate font-medium text-slate-700">
                    {item.buktiDokumen || 'Tanpa Bukti Dokumen'}
                  </div>
                  <span className="text-emerald-700 text-[10px] font-semibold">
                    Terverifikasi
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
