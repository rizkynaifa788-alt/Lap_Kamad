import React, { useState } from 'react';
import {
  Archive,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  FileText,
  AlertTriangle,
  History,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAMA_BULAN } from '../utils/dateUtils';

export const ArsipLaporanView: React.FC = () => {
  const {
    arsipList,
    kunciLaporanBulanan,
    bukaLaporanBulanan,
    selectedBulan,
    setSelectedBulan,
    selectedTahun,
    setSelectedTahun,
    setActiveMenu,
    logs,
  } = useApp();

  const [modalLockOpen, setModalLockOpen] = useState(false);
  const [modalUnlockOpen, setModalUnlockOpen] = useState(false);
  const [targetPeriod, setTargetPeriod] = useState<{ bulan: number; tahun: number }>({
    bulan: selectedBulan,
    tahun: selectedTahun,
  });
  const [alasanBuka, setAlasanBuka] = useState('');
  const [catatanKunci, setCatatanKunci] = useState('');

  const currentArsip = arsipList.find(
    (a) => a.bulan === targetPeriod.bulan && a.tahun === targetPeriod.tahun
  );
  const isTargetLocked = currentArsip?.status === 'Terkunci' || currentArsip?.status === 'Disetujui';

  const handleOpenLockModal = (bulan: number, tahun: number) => {
    setTargetPeriod({ bulan, tahun });
    setCatatanKunci('');
    setModalLockOpen(true);
  };

  const handleOpenUnlockModal = (bulan: number, tahun: number) => {
    setTargetPeriod({ bulan, tahun });
    setAlasanBuka('');
    setModalUnlockOpen(true);
  };

  const handleConfirmLock = (e: React.FormEvent) => {
    e.preventDefault();
    kunciLaporanBulanan(targetPeriod.bulan, targetPeriod.tahun, catatanKunci);
    setModalLockOpen(false);
  };

  const [unlockError, setUnlockError] = useState<string | null>(null);

  const handleConfirmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanBuka.trim()) {
      setUnlockError('Alasan pembukaan kunci wajib dicantumkan untuk keperluan audit trail.');
      return;
    }
    bukaLaporanBulanan(targetPeriod.bulan, targetPeriod.tahun, alasanBuka);
    setUnlockError(null);
    setModalUnlockOpen(false);
  };

  const handleViewArchive = (bulan: number, tahun: number) => {
    setSelectedBulan(bulan);
    setSelectedTahun(tahun);
    setActiveMenu('cetak-lampiran-2');
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Arsip & Penguncian Dokumen Laporan Kinerja
            </h2>
            <p className="text-xs text-slate-500">
              Pengelolaan arsip berkas bulanan, prosedur pembekuan data (freeze), dan riwayat audit pembukaan kunci
            </p>
          </div>
        </div>
      </div>

      {/* Grid Arsip Bulanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arsipList.map((arsip) => {
          const isLocked = arsip.status === 'Terkunci' || arsip.status === 'Disetujui';
          const namaBln = NAMA_BULAN[arsip.bulan - 1];

          return (
            <div
              key={arsip.id}
              className={`p-5 rounded-xl border shadow-xs transition bg-white flex flex-col justify-between ${
                isLocked ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-800" />
                    <span className="text-sm font-bold text-slate-900">
                      {namaBln} {arsip.tahun}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      isLocked
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{arsip.status}</span>
                  </span>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Kegiatan Harian:</span>
                    <span className="font-mono font-bold text-slate-800">{arsip.totalKegiatan} Kegiatan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Kunci:</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {arsip.tanggalKunci || '-'}
                    </span>
                  </div>
                  {arsip.alasanBuka && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800">
                      <span className="font-bold block">Riwayat Pembukaan Kunci:</span>
                      <span>&quot;{arsip.alasanBuka}&quot;</span>
                    </div>
                  )}
                  {arsip.catatanEvaluasi && (
                    <p className="text-[11px] text-slate-500 italic mt-2">
                      {arsip.catatanEvaluasi}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleViewArchive(arsip.bulan, arsip.tahun)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buka Dokumen</span>
                </button>

                {isLocked ? (
                  <button
                    onClick={() => handleOpenUnlockModal(arsip.bulan, arsip.tahun)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>Buka Kunci</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenLockModal(arsip.bulan, arsip.tahun)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Kunci Laporan</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Aktivitas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-800" />
            <span>Audit Trail & Log Aktivitas Sistem (Mencatat Perubahan & Pembukaan Kunci)</span>
          </h3>
          <span className="text-[11px] text-slate-500">Mencatat 100 tindakan terakhir</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
          {logs.slice(0, 15).map((log) => (
            <div key={log.id} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50">
              <div className="flex items-start gap-2.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    log.aksi === 'KUNCI'
                      ? 'bg-amber-100 text-amber-900'
                      : log.aksi === 'BUKA'
                      ? 'bg-rose-100 text-rose-900'
                      : log.aksi === 'HAPUS'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {log.aksi}
                </span>
                <div>
                  <span className="font-semibold text-slate-800 mr-2">{log.modul}:</span>
                  <span className="text-slate-600">{log.detail}</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Kunci Laporan */}
      {modalLockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Kunci Laporan Kinerja Bulanan
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Periode: <strong>{NAMA_BULAN[targetPeriod.bulan - 1]} {targetPeriod.tahun}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Setelah dikunci, catatan kegiatan harian pada bulan ini tidak dapat diubah atau dihapus tanpa prosedur pembukaan kunci tercatat.
            </p>

            <form onSubmit={handleConfirmLock} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Catatan Pengesahan / Keterangan
                </label>
                <textarea
                  rows={3}
                  value={catatanKunci}
                  onChange={(e) => setCatatanKunci(e.target.value)}
                  placeholder="Contoh: Laporan telah disetujui Kepala Kantor Kemenag dan siap diarsipkan"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalLockOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                >
                  Kunci Laporan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buka Kunci Laporan */}
      {modalUnlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-700 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase">
                Prosedur Pembukaan Kunci Laporan
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Periode: <strong>{NAMA_BULAN[targetPeriod.bulan - 1]} {targetPeriod.tahun}</strong>
            </p>
            <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-2">
              Sesuai SOP Administrasi ASN Kemenag RI, setiap pembukaan kunci dokumen yang telah difinalisasi wajib menyertakan alasan resmi dan akan dicatat pada Log Aktivitas Sistem.
            </p>

            {unlockError && (
              <div className="mt-2 p-2 bg-rose-50 border border-rose-300 text-rose-700 rounded-lg text-xs font-semibold">
                {unlockError}
              </div>
            )}

            <form onSubmit={handleConfirmUnlock} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Alasan Perubahan / Koreksi Data *
                </label>
                <textarea
                  rows={3}
                  required
                  value={alasanBuka}
                  onChange={(e) => setAlasanBuka(e.target.value)}
                  placeholder="Tuliskan alasan perbaikan (misal: Perbaikan nomor bukti dokumen supervisi atas arahan Pengawas)..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalUnlockOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold shadow"
                >
                  Buka Kunci & Catat Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
