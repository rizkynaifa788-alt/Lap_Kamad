import React, { useState } from 'react';
import { UserCheck, Save, CheckCircle2, Shield, Mail, Phone, GraduationCap, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProfileKepala } from '../types';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile } = useApp();
  const [formData, setFormData] = useState<ProfileKepala>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Identitas Kepala Madrasah
            </h2>
            <p className="text-xs text-slate-500">
              Data aparatur sipil negara (ASN) yang otomatis mengisi header Lampiran I & Lampiran II
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Perubahan Identitas Berhasil Disimpan</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Formulir Pengisian */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nama Lengkap (Beserta Gelar) *
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                placeholder="Contoh: Dr. H. Ahmad Fauzi, M.Pd.I"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Gunakan ejaan resmi sesuai SK Pengangkatan Kepala Madrasah
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP Pegawai (18 Digit) *
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="197805122003121002"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pangkat / Golongan Ruang *
                </label>
                <input
                  type="text"
                  name="pangkatGol"
                  value={formData.pangkatGol}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Pembina Tingkat I (IV/b)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jabatan Kedinasan *
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="Kepala Madrasah Aliyah Negeri"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Unit Kerja / Madrasah *
                </label>
                <input
                  type="text"
                  name="unitKerja"
                  value={formData.unitKerja}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="MAN 1 Kota Jakarta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Dinas / Google Account
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="kamad@kemenag.go.id"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor Kontak / WhatsApp
                </label>
                <input
                  type="text"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="0812-3456-7890"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Kualifikasi Pendidikan Terakhir
              </label>
              <input
                type="text"
                name="pendidikanTerakhir"
                value={formData.pendidikanTerakhir}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                placeholder="S3 Manajemen Pendidikan Islam"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Identitas Pegawai</span>
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Pratinjau Kartu Pegawai */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
                Kartu Identitas ASN Kemenag
              </span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Nama Pejabat:</span>
                <span className="text-sm font-bold text-white block">{formData.nama || '-'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">NIP:</span>
                  <span className="font-mono text-emerald-300">{formData.nip || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Pangkat/Gol:</span>
                  <span className="text-slate-200">{formData.pangkatGol || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Jabatan:</span>
                <span className="text-xs text-slate-200 font-medium">{formData.jabatan || '-'}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Unit Kerja:</span>
                <span className="text-xs text-amber-300 font-medium">{formData.unitKerja || '-'}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>{formData.pendidikanTerakhir || 'Pendidikan terdaftar'}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-950 mb-1">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>Otomatisasi Dokumen Kedinasan</span>
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Data identitas ini diinjeksikan secara real-time ke kop dan lembar pengesahan pada <strong>Lampiran I</strong> (Laporan Harian) dan <strong>Lampiran II</strong> (Laporan Bulanan) saat dicetak ukuran A4.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
