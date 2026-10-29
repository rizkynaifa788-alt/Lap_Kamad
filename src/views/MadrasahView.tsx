import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, MapPin, Globe, Mail, Phone, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MadrasahInfo } from '../types';

export const MadrasahView: React.FC = () => {
  const { madrasah, updateMadrasah } = useApp();
  const [formData, setFormData] = useState<MadrasahInfo>(madrasah);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMadrasah(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Pengaturan Satuan Kerja Madrasah
            </h2>
            <p className="text-xs text-slate-500">
              Pengaturan profil madrasah, nomor statistik, alamat kantor, dan format kop surat resmi
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Madrasah Berhasil Disimpan</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Pengaturan */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Resmi Satuan Kerja / Madrasah *
              </label>
              <input
                type="text"
                name="namaMadrasah"
                value={formData.namaMadrasah}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
                placeholder="Contoh: Madrasah Aliyah Negeri (MAN) 1 Kota Jakarta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jenjang Pendidikan
                </label>
                <select
                  name="jenjang"
                  value={formData.jenjang}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="MI">MI (Madrasah Ibtidaiyah)</option>
                  <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
                  <option value="MA">MA (Madrasah Aliyah)</option>
                  <option value="MAK">MAK (Madrasah Aliyah Kejuruan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NSM (Nomor Statistik)
                </label>
                <input
                  type="text"
                  name="nsm"
                  value={formData.nsm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="131131750001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NPSN (Nasional)
                </label>
                <input
                  type="text"
                  name="npsn"
                  value={formData.npsn}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="20107299"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alamat Lengkap Madrasah *
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="Jl. Rawa Jaya No. 1, Pondok Kopi, Duren Sawit"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  type="text"
                  name="kotaKabupaten"
                  value={formData.kotaKabupaten}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Kota Jakarta Timur"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="DKI Jakarta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="kodePos"
                  value={formData.kodePos}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="13460"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Madrasah
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Website Resmi
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Teks Kop Surat Dinas (Header Dokumen Cetak)
              </label>
              <textarea
                name="kopSuratTeks"
                rows={4}
                value={formData.kopSuratTeks}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs font-serif border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="KEMENTERIAN AGAMA REPUBLIK INDONESIA..."
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Teks ini akan dicetak di bagian paling atas kop Lampiran I dan Lampiran II
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Madrasah</span>
              </button>
            </div>
          </form>
        </div>

        {/* Pratinjau Kop Surat Cetak */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Pratinjau Kop Dokumen Cetak</span>
            </h3>

            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 text-center font-serif text-[11px] text-slate-900 leading-tight">
              <div className="whitespace-pre-line font-bold">
                {formData.kopSuratTeks || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA\nKANTOR KEMENTERIAN AGAMA'}
              </div>
              <div className="h-0.5 bg-black my-2" />
              <div className="h-px bg-black mb-2" />
              <span className="text-[10px] font-sans text-slate-500 italic">
                (Garis Kop Ganda Standar Tata Naskah Dinas Kemenag)
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formData.kotaKabupaten}, {formData.provinsi}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formData.telepon || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{formData.website || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
