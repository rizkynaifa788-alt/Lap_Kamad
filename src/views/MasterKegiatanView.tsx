import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Layers,
  Calculator,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MasterKegiatan, MetodeHitung, KategoriKegiatan, SatuanVolume, DAFTAR_12_BIDANG } from '../types';

export const MasterKegiatanView: React.FC = () => {
  const { masterKegiatan, addMasterKegiatan, updateMasterKegiatan, deleteMasterKegiatan, toggleMasterStatus } =
    useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterKegiatan | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MasterKegiatan | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter Kategori
  const [filterKategori, setFilterKategori] = useState<string>('semua');

  // Form State
  const [formData, setFormData] = useState<MasterKegiatan>({
    id: `KEG-${String(masterKegiatan.length + 1).padStart(3, '0')}`,
    nama: '',
    kategori: 'Bidang Perencanaan dan Pengembangan Madrasah',
    satuan: 'Kegiatan',
    metodeHitung: 'pelaksanaan',
    targetBulanan: 2,
    status: 'aktif',
    urutanCetak: masterKegiatan.length + 1,
    keterangan: '',
    contohUraian: '',
    defaultBukti: 'Dokumen',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setFormData({
      id: `KEG-${String(masterKegiatan.length + 1).padStart(3, '0')}`,
      nama: '',
      kategori: 'Bidang Perencanaan dan Pengembangan Madrasah',
      satuan: 'Kegiatan',
      metodeHitung: 'pelaksanaan',
      targetBulanan: 2,
      status: 'aktif',
      urutanCetak: masterKegiatan.length + 1,
      keterangan: '',
      contohUraian: '',
      defaultBukti: 'Dokumen',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MasterKegiatan) => {
    setEditingItem(item);
    setFormError(null);
    setFormData(item);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      setFormError('Nama uraian tugas / kegiatan wajib diisi.');
      return;
    }

    if (editingItem) {
      updateMasterKegiatan(formData);
      showToast('success', `Master kegiatan "${formData.nama}" berhasil diperbarui.`);
    } else {
      addMasterKegiatan(formData);
      showToast('success', `Master kegiatan "${formData.nama}" berhasil ditambahkan.`);
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const res = deleteMasterKegiatan(itemToDelete.id);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
    setItemToDelete(null);
  };

  const filteredItems = masterKegiatan
    .filter((k) => filterKategori === 'semua' || k.kategori === filterKategori)
    .sort((a, b) => a.urutanCetak - b.urutanCetak);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notifikasi */}
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
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Master Jenis Kegiatan Kepala Madrasah
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi 12 bidang tugas standar, satuan volume, dan aturan integrasi otomatis ke Lampiran II
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jenis Kegiatan</span>
        </button>
      </div>

      {/* Filter Kategori 12 Bidang */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <Layers className="w-4 h-4 text-emerald-800 shrink-0" />
          <span className="font-semibold text-slate-700 shrink-0">Filter Bidang Tugas:</span>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium w-full sm:w-80"
          >
            <option value="semua">Semua Bidang ({masterKegiatan.length} Kegiatan)</option>
            {DAFTAR_12_BIDANG.map((b) => {
              const count = masterKegiatan.filter((k) => k.kategori === b).length;
              return (
                <option key={b} value={b}>
                  {b} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Menampilkan <strong>{filteredItems.length}</strong> kegiatan master aktif & siap dipakai
        </div>
      </div>

      {/* Tabel Master Kegiatan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">Urut</th>
                <th className="p-3 w-20">Kode</th>
                <th className="p-3">Uraian Tugas / Kegiatan Standar</th>
                <th className="p-3 w-52">Bidang / Kategori</th>
                <th className="p-3 w-24">Satuan</th>
                <th className="p-3 w-28">Metode Hitung</th>
                <th className="p-3 w-20 text-center">Target</th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-center font-mono font-bold text-slate-500">
                    {item.urutanCetak}
                  </td>
                  <td className="p-3 font-mono text-[11px] font-semibold text-emerald-800">
                    {item.id}
                  </td>
                  <td className="p-3 font-medium text-slate-800">
                    <div>{item.nama}</div>
                    {item.keterangan && (
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {item.keterangan}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600">
                    <span className="text-[11px] font-medium text-slate-700">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {item.satuan}
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] capitalize text-slate-700">
                      {item.metodeHitung.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-medium text-slate-800">
                    {item.targetBulanan > 0 ? item.targetBulanan : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleMasterStatus(item.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        item.status === 'aktif'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 rounded hover:bg-slate-100 transition"
                        title="Edit Master Kegiatan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition active:scale-90"
                        title="Hapus Master Kegiatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Master Kegiatan (In-App Modal Tanpa window.confirm) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Konfirmasi Hapus Master Kegiatan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apakah Anda yakin ingin menghapus referensi jenis kegiatan ini?
                </p>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Kode Kegiatan:</span>
                <span className="font-bold text-emerald-800 font-mono">{itemToDelete.id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Nama Tugas:</span>
                <span className="font-bold text-slate-900 block mt-0.5">{itemToDelete.nama}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Bidang:</span>
                  <span className="font-medium text-slate-700">{itemToDelete.kategori}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Satuan / Metode:</span>
                  <span className="font-medium text-slate-700">
                    {itemToDelete.satuan} ({itemToDelete.metodeHitung})
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              Catatan historis laporan harian yang sudah menggunakan kode ini akan tetap tersimpan aman di arsip, namun kegiatan ini tidak lagi muncul sebagai opsi formulir baru.
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
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Master Kegiatan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingItem ? 'Edit Master Kegiatan' : 'Tambah Jenis Kegiatan Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    ID / Kode Kegiatan
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled={!!editingItem}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Urutan Cetak (Lampiran II)
                  </label>
                  <input
                    type="number"
                    value={formData.urutanCetak}
                    onChange={(e) => setFormData({ ...formData, urutanCetak: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Uraian Tugas / Kegiatan *
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => {
                    setFormData({ ...formData, nama: e.target.value });
                    if (formError) setFormError(null);
                  }}
                  placeholder="Contoh: Melaksanakan supervisi akademik pembelajaran guru"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Bidang Tugas (12 Bidang Kemenag RI) *
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriKegiatan })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                >
                  {DAFTAR_12_BIDANG.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Satuan Volume *
                  </label>
                  <select
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value as SatuanVolume })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Laporan">Laporan</option>
                    <option value="Dokumen">Dokumen</option>
                    <option value="Berkas">Berkas</option>
                    <option value="Surat">Surat</option>
                    <option value="Paket">Paket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Metode Perhitungan
                  </label>
                  <select
                    value={formData.metodeHitung}
                    onChange={(e) => setFormData({ ...formData, metodeHitung: e.target.value as MetodeHitung })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="pelaksanaan">Jumlah Pelaksanaan</option>
                    <option value="hari_kerja">Hari Kerja Berbeda</option>
                    <option value="tetap_satu">Tetap 1 Kali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Target Bulanan
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.targetBulanan}
                    onChange={(e) => setFormData({ ...formData, targetBulanan: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Default Bukti Dokumen
                </label>
                <input
                  type="text"
                  value={formData.defaultBukti}
                  onChange={(e) => setFormData({ ...formData, defaultBukti: e.target.value })}
                  placeholder="Instrumen Supervisi & Dokumentasi"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Master Kegiatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
