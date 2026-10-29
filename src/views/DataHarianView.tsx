import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  X,
  Save,
  AlertCircle,
  FileDown,
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

  const terkunci = isBulanTerkunci(selectedBulan, selectedTahun);

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
      updateLaporanHarian(editingItem);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6">
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
              Kelola, verifikasi, dan pantau seluruh catatan tugas kedinasan harian Kepala Madrasah
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filteredData.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
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
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
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

      {/* Tabel Data Laporan Harian */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 w-28">Hari / Tanggal</th>
                <th className="p-3 w-48">Jenis Kegiatan (Master)</th>
                <th className="p-3">Uraian Rinci Kegiatan</th>
                <th className="p-3 w-48">Output / Hasil</th>
                <th className="p-3 w-48">Bukti Dokumen</th>
                <th className="p-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data laporan harian untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
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
                        <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1 py-0.2 rounded">
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
                      <div className="flex items-center justify-center gap-1.5">
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
                          onClick={() => {
                            if (confirm(`Hapus catatan kegiatan tanggal ${item.tanggal} (${item.hari})?`)) {
                              deleteLaporanHarian(item.id);
                            }
                          }}
                          disabled={terkunci}
                          className={`p-1.5 rounded transition ${
                            terkunci
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                          }`}
                          title="Hapus Catatan Kegiatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Tanggal Kegiatan *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingItem.tanggal}
                    onChange={(e) => {
                      const t = e.target.value;
                      setEditingItem({
                        ...editingItem,
                        tanggal: t,
                        hari: getHariIndonesia(t),
                      });
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Hari (Otomatis)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingItem.hari}
                    className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Jenis Kegiatan *
                </label>
                <select
                  value={editingItem.idKegiatan}
                  onChange={(e) => setEditingItem({ ...editingItem, idKegiatan: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                  Uraian Kegiatan Rinci *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.uraianKegiatan}
                  onChange={(e) => setEditingItem({ ...editingItem, uraianKegiatan: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed font-sans"
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
