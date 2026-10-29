import React, { useState } from 'react';
import { PenTool, Save, CheckCircle2, Shield, User, MapPin, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PenandatanganInfo } from '../types';

export const PenandatanganView: React.FC = () => {
  const { penandatangan, updatePenandatangan } = useApp();
  const [formData, setFormData] = useState<PenandatanganInfo>(penandatangan);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePenandatangan(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Pengaturan Pejabat Penandatangan Dokumen
            </h2>
            <p className="text-xs text-slate-500">
              Pengaturan identitas atasan langsung (Pejabat Penilai Kinerja) dan Pengawas Pembina madrasah
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Penandatangan Berhasil Disimpan</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seksi 1: Pejabat Penilai Kinerja (Atasan Langsung) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-emerald-900 font-bold text-xs uppercase">
              <Shield className="w-4 h-4 text-emerald-800" />
              <span>Pejabat Penilai Kinerja (Atasan Langsung)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Pejabat (Beserta Gelar) *
              </label>
              <input
                type="text"
                name="pejabatNama"
                required
                value={formData.pejabatNama}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                placeholder="H. Zulkifli, S.Ag., M.Si."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP Pejabat *
                </label>
                <input
                  type="text"
                  name="pejabatNip"
                  required
                  value={formData.pejabatNip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="197203151998031004"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pangkat / Golongan
                </label>
                <input
                  type="text"
                  name="pejabatPangkatGol"
                  value={formData.pejabatPangkatGol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Pembina Utama Muda (IV/c)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Jabatan Kedinasan *
              </label>
              <input
                type="text"
                name="pejabatJabatan"
                required
                value={formData.pejabatJabatan}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="Kepala Kantor Kementerian Agama Kota Jakarta Timur"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Instansi Pembina *
              </label>
              <input
                type="text"
                name="pejabatInstansi"
                required
                value={formData.pejabatInstansi}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="Kantor Kementerian Agama Kota Jakarta Timur"
              />
            </div>
          </div>

          {/* Seksi 2: Pengawas Madrasah Pembina */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-emerald-900 font-bold text-xs uppercase">
              <User className="w-4 h-4 text-emerald-800" />
              <span>Pengawas Madrasah Pembina</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Pengawas (Beserta Gelar) *
              </label>
              <input
                type="text"
                name="pengawasNama"
                required
                value={formData.pengawasNama}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                placeholder="Dra. Hj. Nurjanah, M.Pd."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP Pengawas *
                </label>
                <input
                  type="text"
                  name="pengawasNip"
                  required
                  value={formData.pengawasNip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="196908201995032001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pangkat / Golongan
                </label>
                <input
                  type="text"
                  name="pengawasPangkatGol"
                  value={formData.pengawasPangkatGol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Pembina Tingkat I (IV/b)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Jabatan Pengawas
              </label>
              <input
                type="text"
                name="pengawasJabatan"
                value={formData.pengawasJabatan}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="Pengawas Madrasah Ahli Madya"
              />
            </div>

            {/* Lokasi & Tanggal TTD */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lokasi Kota Tanda Tangan *
                </label>
                <input
                  type="text"
                  name="lokasiTtd"
                  required
                  value={formData.lokasiTtd}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Jakarta Timur"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Format Tanggal Cetak
                </label>
                <input
                  type="text"
                  name="formatTanggal"
                  value={formData.formatTanggal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="31 Oktober 2026"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Penandatangan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
