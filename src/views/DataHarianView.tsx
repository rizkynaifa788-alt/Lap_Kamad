import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  X,
  Save,
  AlertCircle,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LaporanHarian } from '../types';
import { formatTanggalIndo, NAMA_BULAN, getHariIndonesia } from '../utils/dateUtils';
import { exportLampiran1ToWord } from '../utils/exportWord';

export const DataHarianView: React.FC = () => {
  const {
    profile,
    madrasah,
    penandatangan,
    laporanHarian,
    updateLaporanHarian,
    deleteLaporanHarian,
    deleteMultipleLaporanHarian,
    masterKegiatan,
    selectedBulan,
    setSelectedBulan,
    selectedTahun,
    setSelectedTahun,
    setActiveMenu,
    isBulanTerkunci,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('semua');
  const [editingItem, setEditingItem] = useState<LaporanHarian | null>(null);

  // States untuk optimasi aksi hapus (In-App Modal & Multi-Select)
  const [itemToDelete, setItemToDelete] = useState<LaporanHarian | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const terkunci = isBulanTerkunci(selectedBulan, selectedTahun);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Master Lookup Map
  const masterMap = useMemo(() => {
    const map: Record<string, { nama: string; kategori: string }> = {};
    masterKegiatan.forEach((m) => {
      map[m.id] = { nama: m.nama, kategori: m.kategori };
    });
    return map;
  }, [masterKegiatan]);

  // Filter Data
  const filteredData = useMemo(() => {
    const prefix = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`;
    return laporanHarian
      .filter((l) => l.tanggal.startsWith(prefix))
      .filter((l) => {
        if (filterKegiatan !== 'semua' && l.idKegiatan !== filterKegiatan) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          l.uraianKegiatan.toLowerCase().includes(q) ||
          l.output.toLowerCase().includes(q) ||
          l.buktiDokumen.toLowerCase().includes(q) ||
          l.tanggal.includes(q)
        );
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [laporanHarian, selectedBulan, selectedTahun, filterKegiatan, searchTerm]);

  // Status seleksi multi-pilih
  const isAllFilteredSelected =
    filteredData.length > 0 && filteredData.every((item) => selectedIds.includes(item.id));
  const isSomeFilteredSelected =
    filteredData.some((item) => selectedIds.includes(item.id)) && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredData.map((d) => d.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredData.map((d) => d.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Eksekusi Hapus Satuan
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return;
    const res = deleteLaporanHarian(itemToDelete.id);
    if (res.success) {
      showToast('success', res.message);
      setSelectedIds((prev) => prev.filter((id) => id !== itemToDelete.id));
    } else {
      showToast('error', res.message);
    }
    setItemToDelete(null);
  };

  // Eksekusi Hapus Massal
  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const res = deleteMultipleLaporanHarian(selectedIds);
    if (res.success) {
      showToast('success', res.message);
      setSelectedIds([]);
    } else {
      showToast('error', res.message);
    }
    setIsBulkDeleteModalOpen(false);
  };

  // Ekspor CSV
  const handleExportCsv = () => {
    const headers = ['No', 'Hari', 'Tanggal', 'Kode_Kegiatan', 'Uraian_Kegiatan', 'Output_Hasil', 'Bukti_Dokumen', 'Status'];
    const rows = filteredData.map((d, idx) => [
      idx + 1,
      d.hari,
      formatTanggalIndo(d.tanggal),
      d.idKegiatan,
      `"${d.uraianKegiatan.replace(/"/g, '""')}"`,
      `"${d.output.replace(/"/g, '""')}"`,
      `"${d.buktiDokumen.replace(/"/g, '""')}"`,
      d.statusValidasi,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Harian_Kamad_${selectedTahun}_${selectedBulan}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const res = updateLaporanHarian(editingItem);
      if (res && !res.success) {
        showToast('error', res.message);
      } else {
        showToast('success', 'Perubahan catatan kegiatan harian berhasil disimpan.');
      }
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notifikasi Berhasil / Gagal */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-700'
              : 'bg-rose-800 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 p-0.5"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Data Laporan Kinerja Harian (Lampiran I)
            </h2>
            <p className="text-xs text-slate-500">
              Kelola, verifikasi, saring, dan hapus catatan tugas kedinasan harian Kepala Madrasah
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filteredData.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() =>
              exportLampiran1ToWord({
                profile,
                madrasah,
                penandatangan,
                entries: filteredData,
                bulan: selectedBulan,
                tahun: selectedTahun,
              })
            }
            disabled={filteredData.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition shadow-2xs disabled:opacity-50"
            title="Unduh Lampiran I dalam format Microsoft Word (.doc / .docx)"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-200" />
            <span>Ekspor Word</span>
          </button>
          <button
            onClick={() => setActiveMenu('input-harian')}
            disabled={terkunci}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs ${
              terkunci
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-800 hover:bg-emerald-700 text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Kegiatan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari uraian kegiatan, output, bukti..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Filter Periode & Jenis Tugas */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Bulan:</span>
              <select
                aria-label="Pilih Bulan Laporan"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              >
                {NAMA_BULAN.map((bln, idx) => (
                  <option key={bln} value={idx + 1}>
                    {bln}
                  </option>
                ))}
              </select>
              <select
                aria-label="Pilih Tahun Laporan"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              >
                {[2024, 2025, 2026, 2027].map((thn) => (
                  <option key={thn} value={thn}>
                    {thn}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Tugas:</span>
              <select
                aria-label="Saring Berdasarkan Jenis Tugas"
                value={filterKegiatan}
                onChange={(e) => setFilterKegiatan(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 max-w-xs font-medium"
              >
                <option value="semua">Semua Master Kegiatan ({masterKegiatan.length})</option>
                {Array.from(new Set(masterKegiatan.map((m) => m.kategori))).map((kat) => (
                  <optgroup key={kat} label={kat}>
                    {masterKegiatan
                      .filter((m) => m.kategori === kat)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.id}] {m.nama.slice(0, 40)}...
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredData.length}</strong> catatan harian periode{' '}
            <strong>
              {NAMA_BULAN[selectedBulan - 1]} {selectedTahun}
            </strong>
          </span>
          {terkunci && (
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Status Periode Terkunci (Hanya Baca)
            </span>
          )}
        </div>
      </div>

      {/* Toolbar Aksi Massal (Muncul jika ada item terpilih) */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </div>
            <div>
              <span className="font-bold text-xs text-rose-950 block">
                {selectedIds.length} Catatan Kegiatan Terpilih
              </span>
              <span className="text-[11px] text-rose-700">
                Pilih opsi di samping untuk membatalkan seleksi atau menghapus sekaligus secara aman
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
            >
              Batal Pilih
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              disabled={terkunci}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition ${
                terkunci
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabel Data Laporan Harian */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeFilteredSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    disabled={filteredData.length === 0 || terkunci}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer w-3.5 h-3.5"
                    title={isAllFilteredSelected ? 'Batal pilih semua' : 'Pilih semua'}
                  />
                </th>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 w-28">Hari / Tanggal</th>
                <th className="p-3 w-52">Jenis Kegiatan (Master)</th>
                <th className="p-3">Uraian Rinci Kegiatan</th>
                <th className="p-3 w-44">Output / Hasil</th>
                <th className="p-3 w-44">Bukti Dokumen</th>
                <th className="p-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data laporan harian untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isSelected
                          ? 'bg-emerald-50/80 hover:bg-emerald-100/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(item.id)}
                          disabled={terkunci}
                          className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer w-3.5 h-3.5"
                        />
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500 font-bold">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        <div className="font-bold text-emerald-900">{item.hari}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {formatTanggalIndo(item.tanggal)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            {item.idKegiatan}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {masterMap[item.idKegiatan]?.kategori?.replace('Bidang ', '')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 line-clamp-2 mt-0.5">
                          {masterMap[item.idKegiatan]?.nama || item.idKegiatan}
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 leading-relaxed font-sans">
                        {item.uraianKegiatan}
                      </td>
                      <td className="p-3 text-slate-600">
                        {item.output || '-'}
                      </td>
                      <td className="p-3 text-slate-600">
                        <div className="font-medium text-slate-700">{item.buktiDokumen || 'Dokumen'}</div>
                        {item.linkDrive && (
                          <a
                            href={item.linkDrive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 mt-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Berkas</span>
                          </a>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            disabled={terkunci}
                            className={`p-1.5 rounded transition ${
                              terkunci
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-emerald-800 hover:bg-slate-100'
                            }`}
                            title="Edit Catatan Kegiatan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            disabled={terkunci}
                            className={`p-1.5 rounded transition ${
                              terkunci
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90'
                            }`}
                            title="Hapus Catatan Kegiatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Tunggal (In-App Modal Tanpa window.confirm) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Konfirmasi Hapus Laporan Harian
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apakah Anda yakin ingin menghapus catatan kegiatan ini secara permanen?
                </p>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kotak Ringkasan Data yang Akan Dihapus */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Hari / Tanggal:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {itemToDelete.hari}, {formatTanggalIndo(itemToDelete.tanggal)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Kegiatan Master:</span>
                <span className="font-semibold text-emerald-900 text-[11px]">
                  [{itemToDelete.idKegiatan}] {masterMap[itemToDelete.idKegiatan]?.nama || itemToDelete.idKegiatan}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Uraian Kegiatan:</span>
                <p className="text-slate-700 italic line-clamp-3 mt-0.5">
                  "{itemToDelete.uraianKegiatan}"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Output:</span>
                  <span className="font-medium text-slate-700">{itemToDelete.output || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bukti:</span>
                  <span className="font-medium text-slate-700">{itemToDelete.buktiDokumen || '-'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
              Tindakan ini akan menghapus data dari basis data dan memperbarui rekapitulasi capaian bulanan (Lampiran II).
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Kegiatan Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Massal (Bulk Delete) */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Konfirmasi Hapus Massal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anda akan menghapus <strong>{selectedIds.length}</strong> catatan kegiatan harian sekaligus.
                </p>
              </div>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1.5">
              <p className="font-semibold">
                Perhatian: Seluruh {selectedIds.length} data yang dipilih akan dihapus secara permanen.
              </p>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Tindakan ini juga akan otomatis memutakhirkan rekapitulasi volume pada Lampiran II untuk periode yang bersangkutan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus {selectedIds.length} Kegiatan Terpilih</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Kegiatan */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  Edit Catatan Laporan Harian
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">ID: {editingItem.id}</span>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={editingItem.tanggal}
                    onChange={(e) => {
                      const tgl = e.target.value;
                      setEditingItem({
                        ...editingItem,
                        tanggal: tgl,
                        hari: getHariIndonesia(tgl),
                      });
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Hari (Otomatis)
                  </label>
                  <input
                    type="text"
                    value={editingItem.hari}
                    disabled
                    className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Jenis Kegiatan Master *
                </label>
                <select
                  value={editingItem.idKegiatan}
                  onChange={(e) => setEditingItem({ ...editingItem, idKegiatan: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  required
                >
                  {masterKegiatan.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Uraian Rinci Kegiatan *
                </label>
                <textarea
                  rows={4}
                  value={editingItem.uraianKegiatan}
                  onChange={(e) => setEditingItem({ ...editingItem, uraianKegiatan: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed font-sans"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Output / Hasil Kegiatan
                </label>
                <input
                  type="text"
                  value={editingItem.output}
                  onChange={(e) => setEditingItem({ ...editingItem, output: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Bukti Dokumen Fisik *
                  </label>
                  <input
                    type="text"
                    value={editingItem.buktiDokumen}
                    onChange={(e) => setEditingItem({ ...editingItem, buktiDokumen: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Tautan Bukti Digital
                  </label>
                  <input
                    type="url"
                    value={editingItem.linkDrive || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, linkDrive: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
