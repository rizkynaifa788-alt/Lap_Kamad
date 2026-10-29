import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Calendar,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  ArrowRight,
  ListPlus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHariIndonesia, getTodayString } from '../utils/dateUtils';

export const InputHarianView: React.FC = () => {
  const {
    masterKegiatan,
    addLaporanHarian,
    setActiveMenu,
    isBulanTerkunci,
    laporanHarian,
  } = useApp();

  const [tanggal, setTanggal] = useState<string>(getTodayString());
  const [hari, setHari] = useState<string>(getHariIndonesia(getTodayString()));
  const [idKegiatan, setIdKegiatan] = useState<string>('KEG-002');
  const [uraianKegiatan, setUraianKegiatan] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [buktiDokumen, setBuktiDokumen] = useState<string>('');
  const [linkDrive, setLinkDrive] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [terusInput, setTerusInput] = useState<boolean>(true);

  // Update Hari otomatis saat tanggal berubah
  useEffect(() => {
    if (tanggal) {
      setHari(getHariIndonesia(tanggal));
    }
  }, [tanggal]);

  // Cek apakah tanggal/bulan terkunci
  const [thn, bln] = (tanggal || '').split('-');
  const isLocked = isBulanTerkunci(Number(bln), Number(thn));

  // Ambil detail master kegiatan terpilih
  const selectedMaster = masterKegiatan.find((m) => m.id === idKegiatan);

  // Cek jika sudah ada kegiatan serupa di tanggal yang sama (peringatan duplikasi)
  const existingSameDateEntries = laporanHarian.filter(
    (l) => l.tanggal === tanggal && l.idKegiatan === idKegiatan
  );

  // Auto-fill template uraian dari master jika user mengklik "Gunakan Contoh Uraian"
  const handleUsePreset = () => {
    if (selectedMaster) {
      if (selectedMaster.contohUraian) {
        setUraianKegiatan(selectedMaster.contohUraian);
      }
      if (selectedMaster.defaultBukti) {
        setBuktiDokumen(selectedMaster.defaultBukti);
      }
      setOutput(`Terlaksananya ${selectedMaster.nama.toLowerCase()} dengan bukti terverifikasi`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal || !uraianKegiatan.trim() || !idKegiatan) {
      setFeedback({ type: 'error', message: 'Tanggal, jenis kegiatan, dan uraian kegiatan wajib diisi!' });
      return;
    }

    const result = addLaporanHarian({
      tanggal,
      hari,
      idKegiatan,
      uraianKegiatan: uraianKegiatan.trim(),
      output: output.trim(),
      buktiDokumen: buktiDokumen.trim() || selectedMaster?.defaultBukti || 'Dokumen',
      linkDrive: linkDrive.trim(),
      statusValidasi: 'Terverifikasi',
    });

    if (result.success) {
      setFeedback({ type: 'success', message: 'Kegiatan harian berhasil dicatat ke Lampiran I!' });
      // Reset form uraian dan bukti jika mode terus input aktif
      if (terusInput) {
        setUraianKegiatan('');
        setOutput('');
        setBuktiDokumen('');
        setLinkDrive('');
      } else {
        setTimeout(() => setActiveMenu('data-harian'), 1000);
      }
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Input Laporan Kinerja Harian (Lampiran I)
            </h2>
            <p className="text-xs text-slate-500">
              Pencatatan aktivitas tugas kedinasan harian Kepala Madrasah terintegrasi otomatis ke Capaian Bulanan
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveMenu('data-harian')}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
        >
          <span>Buka Data Laporan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alert Penguncian Periode */}
      {isLocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Periode Laporan {bln}/{thn} Sedang Terkunci!</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Data bulan ini telah diarsipkan secara resmi. Pengisian atau pengubahan dinonaktifkan sementara.
            </p>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulir Input Utama */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Baris 1: Tanggal & Hari Otomatis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tanggal Kegiatan *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full pl-3 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hari Pelaksanaan (Otomatis)
              </label>
              <div className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-bold text-emerald-900 font-sans">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{hari || 'Pilih tanggal dahulu'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Peringatan Duplikasi
              </label>
              <div className="px-3 py-2 text-[11px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-slate-600">
                <span>Di tanggal ini:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {existingSameDateEntries.length} tercatat
                </span>
              </div>
            </div>
          </div>

          {/* Baris 2: Pilihan Master Kegiatan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Jenis Kegiatan (Master Tugas Kepala Madrasah) *
              </label>
              <button
                type="button"
                onClick={handleUsePreset}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Gunakan Draf Rekomendasi</span>
              </button>
            </div>
            <select
              value={idKegiatan}
              onChange={(e) => setIdKegiatan(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            >
              {Array.from(new Set(masterKegiatan.map((m) => m.kategori))).map((kategori) => {
                const itemsInCat = masterKegiatan.filter(
                  (m) => m.kategori === kategori && m.status === 'aktif'
                );
                if (itemsInCat.length === 0) return null;
                return (
                  <optgroup key={kategori} label={`── ${kategori} ──`}>
                    {itemsInCat.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.id}] {m.nama} ({m.satuan} · {m.metodeHitung})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            {selectedMaster && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-emerald-800">
                  Kategori: {selectedMaster.kategori}
                </span>
                <span>·</span>
                <span>Satuan: <strong>{selectedMaster.satuan}</strong></span>
                <span>·</span>
                <span>Aturan Volume: <strong>{selectedMaster.metodeHitung}</strong></span>
              </div>
            )}
          </div>

          {/* Baris 3: Uraian Kegiatan Rinci */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Uraian Rinci Kegiatan Kedinasan *
            </label>
            <textarea
              required
              rows={3}
              value={uraianKegiatan}
              onChange={(e) => setUraianKegiatan(e.target.value)}
              placeholder="Tuliskan secara jelas, terperinci, dan faktual aktivitas yang dilaksanakan..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed font-sans"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Contoh: &quot;Melaksanakan supervisi klinis pembelajaran Matematika kelas X-1 oleh Ibu Guru Dra. Aminah&quot;
            </span>
          </div>

          {/* Baris 4: Output / Hasil Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Output / Hasil / Produk Kegiatan
            </label>
            <input
              type="text"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Contoh: Instrumen supervisi terisi lengkap dan catatan rekomendasi perbaikan pedagogik"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Baris 5: Bukti Dokumen & Tautan Cloud */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bukti Fisik / Nomor Dokumen Pendukung *
              </label>
              <input
                type="text"
                value={buktiDokumen}
                onChange={(e) => setBuktiDokumen(e.target.value)}
                placeholder="Contoh: Instrumen Supervisi No. 12/SUP/X/2026, Foto Kegiatan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tautan Berkas Pendukung (Google Drive / Cloud)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={linkDrive}
                  onChange={(e) => setLinkDrive(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Baris Tombol Aksi & Mode Pengisian Beruntun */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={terusInput}
                onChange={(e) => setTerusInput(e.target.checked)}
                className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
              <span className="font-medium">Tetap di formulir ini setelah simpan (Mode Input Cepat)</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="submit"
                disabled={isLocked}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold shadow transition ${
                  isLocked
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Simpan ke Laporan Harian</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
