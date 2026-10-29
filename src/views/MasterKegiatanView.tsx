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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MasterKegiatan, MetodeHitung, KategoriKegiatan, SatuanVolume, DAFTAR_12_BIDANG } from '../types';

export const MasterKegiatanView: React.FC = () => {
  const { masterKegiatan, addMasterKegiatan, updateMasterKegiatan, deleteMasterKegiatan, toggleMasterStatus } =
    useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterKegiatan | null>(null);

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

  const handleOpenAdd = () => {
    setEditingItem(null);
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
    setFormData(item);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama kegiatan wajib diisi.');
      return;
    }

    if (editingItem) {
      updateMasterKegiatan(formData);
    } else {
      addMasterKegiatan(formData);
    }
    setModalOpen(false);
  };

  const filteredItems = masterKegiatan
    .filter((k) => filterKategori === 'semua' || k.kategori === filterKategori)
    .sort((a, b) => a.urutanCetak - b.urutanCetak);

  return (
    <div className="space-y-6">
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
              Konfigurasi tugas standar, satuan volume, dan aturan integrasi otomatis ke Lampiran II
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jenis Kegiatan</span>
        </button>
      </div>

      {/* Penjelasan 4 Aturan Penghitungan Volume */}
      <div className="bg-emerald-950 text-white p-5 rounded-xl shadow-xs border border-emerald-900 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>Aturan Resmi Penghitungan Volume (Integrasi Lampiran I ke Lampiran II)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-emerald-100">
          <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-white block mb-1">1. Jumlah Pelaksanaan</span>
            <p className="text-[11px] leading-relaxed text-emerald-200">
              Setiap catatan harian valid dihitung 1 kali volume. Contoh: 4 kali supervisi kelas = 4 Kegiatan.
            </p>
          </div>
          <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-white block mb-1">2. Tanggal Unik (Hari)</span>
            <p className="text-[11px] leading-relaxed text-emerald-200">
              Dihitung berdasarkan jumlah tanggal unik. Kegiatan serupa dalam hari yang sama dihitung 1 Hari.
            </p>
          </div>
          <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-white block mb-1">3. Output Dokumen</span>
            <p className="text-[11px] leading-relaxed text-emerald-200">
              Dihitung berdasarkan jumlah produk fisik/digital dokumen sah yang dihasilkan dalam periode laporan.
            </p>
          </div>
          <div className="bg-emerald-900/60 p-3 rounded-lg border border-emerald-800/60">
            <span className="font-bold text-white block mb-1">4. Manual Terverifikasi</span>
            <p className="text-[11px] leading-relaxed text-emerald-200">
              Untuk tugas khusus yang membutuhkan verifikasi instrumen atau penetapan angka mandiri.
            </p>
          </div>
        </div>
      </div>

      {/* Filter 12 Bidang Tugas Pokok Kepala Madrasah */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Saring Berdasarkan 12 Bidang Tugas Pokok Kepala Madrasah:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Menampilkan {filteredItems.length} dari {masterKegiatan.length} Jenis Kegiatan
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setFilterKategori('semua')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              filterKategori === 'semua'
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Bidang ({masterKegiatan.length})
          </button>
          {DAFTAR_12_BIDANG.map((bidang, idx) => {
            const shortName = bidang.replace('Bidang ', '');
            const count = masterKegiatan.filter((m) => m.kategori === bidang).length;
            return (
              <button
                key={bidang}
                onClick={() => setFilterKategori(bidang)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                  filterKategori === bidang
                    ? 'bg-emerald-800 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={bidang}
              >
                <span>{idx + 1}. {shortName}</span>
                <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
          <button
            onClick={() => setFilterKategori('Tugas Kedinasan Lainnya')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              filterKategori === 'Tugas Kedinasan Lainnya'
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Kedinasan Lainnya ({masterKegiatan.filter((m) => m.kategori === 'Tugas Kedinasan Lainnya').length})
          </button>
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
                <th className="p-3">Nama Kegiatan Standar</th>
                <th className="p-3 w-44">Kategori Tugas</th>
                <th className="p-3 w-24">Satuan</th>
                <th className="p-3 w-36">Metode Hitung</th>
                <th className="p-3 w-20 text-center">Target</th>
                <th className="p-3 w-24 text-center">Status</th>
                <th className="p-3 w-24 text-center">Aksi</th>
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
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-500 hover:text-emerald-700 rounded hover:bg-slate-100 transition"
                        title="Edit Master Kegiatan"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus master kegiatan "${item.nama}"?`)) {
                            deleteMasterKegiatan(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition"
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    ID Kegiatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Urutan Cetak
                  </label>
                  <input
                    type="number"
                    value={formData.urutanCetak}
                    onChange={(e) => setFormData({ ...formData, urutanCetak: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nama Kegiatan Standar (Lampiran II) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Melaksanakan supervisi manajerial tata usaha"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Kategori Tugas
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriKegiatan })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  >
                    {DAFTAR_12_BIDANG.map((bidang, idx) => (
                      <option key={bidang} value={bidang}>
                        {idx + 1}. {bidang}
                      </option>
                    ))}
                    <option value="Tugas Kedinasan Lainnya">13. Tugas Kedinasan Lainnya</option>
                  </select>
                </div>

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
                    <option value="Dokumen">Dokumen</option>
                    <option value="Hari">Hari</option>
                    <option value="Laporan">Laporan</option>
                    <option value="Rapat">Rapat</option>
                    <option value="Berkas">Berkas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Metode Penghitungan Volume *
                  </label>
                  <select
                    value={formData.metodeHitung}
                    onChange={(e) => setFormData({ ...formData, metodeHitung: e.target.value as MetodeHitung })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                  >
                    <option value="pelaksanaan">Jumlah Pelaksanaan (1 Catatan = 1 Volume)</option>
                    <option value="tanggal_unik">Jumlah Tanggal Unik (Hari Kalender)</option>
                    <option value="output_dokumen">Jumlah Output / Dokumen Fisik</option>
                    <option value="manual">Manual Terverifikasi</option>
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
