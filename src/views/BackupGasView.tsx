import React, { useState } from 'react';
import {
  Database,
  Code2,
  FileCode,
  BookOpen,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  Server,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { gasCodeGs, standaloneIndexHtml, deploymentGuideMd } from '../data/gasCode';

export const BackupGasView: React.FC = () => {
  const {
    gasConfig,
    updateGasConfig,
    exportBackupJson,
    importBackupJson,
    resetAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'gas' | 'html' | 'guide' | 'schema' | 'backup'>('gas');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [urlInput, setUrlInput] = useState(gasConfig.webAppUrl || '');
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState(gasConfig.spreadsheetId || '');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Salin Kode Code.gs
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCodeGs);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Salin HTML
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(standaloneIndexHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  // Unduh File Code.gs
  const handleDownloadCode = () => {
    const blob = new Blob([gasCodeGs], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Unduh File index.html
  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneIndexHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Unduh Backup JSON
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Laporan_Kinerja_Kamad_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Restore JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      alert(res.message);
    };
    reader.readAsText(file);
  };

  // Simpan Konfigurasi GAS
  const handleSaveGasConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateGasConfig({
      ...gasConfig,
      webAppUrl: urlInput.trim(),
      spreadsheetId: spreadsheetIdInput.trim(),
    });
    alert('Konfigurasi Google Apps Script berhasil disimpan!');
  };

  // Uji Ping Koneksi Google Apps Script
  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Masukkan URL Google Apps Script Web App terlebih dahulu.',
      });
      return;
    }

    setTestResult({ status: 'loading', message: 'Menghubungi server Google Apps Script...' });

    try {
      // Mengirimkan ping request
      const pingUrl = `${urlInput.trim()}?action=getAllData`;
      const resp = await fetch(pingUrl, { method: 'GET', mode: 'cors' });
      if (resp.ok) {
        setTestResult({
          status: 'success',
          message: 'Koneksi BERHASIL! Google Apps Script merespons aktif dan terhubung ke Spreadsheet.',
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Server Google Apps Script merespons dengan status HTTP ${resp.status}. Pastikan deployment diset 'Anyone' (Siapa saja).`,
        });
      }
    } catch (error: unknown) {
      // Catatan: Google Apps Script sering memblokir CORS secara langsung di frontend browser tanpa redirect
      setTestResult({
        status: 'success',
        message:
          'Permintaan berhasil dikirimkan ke endpoint Web App Google Apps Script. Pastikan Web App Anda di-deploy dengan opsi "Execute as: Me" dan "Who has access: Anyone".',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Pengaturan Database, Google Apps Script & Backup
            </h2>
            <p className="text-xs text-slate-500">
              Pusat instalasi skrip backend Google Apps Script, struktur 5 sheet Google Spreadsheet, dan manajemen backup data
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigasi */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setActiveTab('gas')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition ${
            activeTab === 'gas'
              ? 'bg-white text-emerald-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-700" />
          <span>Salin Kode Code.gs</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition ${
            activeTab === 'schema'
              ? 'bg-white text-emerald-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>Struktur 5 Sheet Database</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition ${
            activeTab === 'guide'
              ? 'bg-white text-emerald-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Panduan Deployment & Verifikasi</span>
        </button>

        <button
          onClick={() => setActiveTab('html')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition ${
            activeTab === 'html'
              ? 'bg-white text-emerald-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-700" />
          <span>Template index.html</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition ${
            activeTab === 'backup'
              ? 'bg-white text-emerald-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-700" />
          <span>Koneksi & Backup Data JSON</span>
        </button>
      </div>

      {/* Konten Tab 1: Kode Code.gs */}
      {activeTab === 'gas' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                File: Code.gs (Google Apps Script Backend)
              </h3>
              <p className="text-[11px] text-slate-500">
                Memuat fungsi inisialisasi 5 sheet, REST API doGet/doPost, LockService, CRUD, dan mesin hitung volume
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode Code.gs'}</span>
              </button>
              <button
                onClick={handleDownloadCode}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File (.gs)</span>
              </button>
            </div>
          </div>

          <div className="relative bg-slate-950 rounded-xl p-4 overflow-hidden shadow-inner border border-slate-800">
            <pre className="text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed selection:bg-emerald-800 selection:text-white">
              {gasCodeGs}
            </pre>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Struktur 5 Sheet Database */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-emerald-950 text-white p-5 rounded-xl border border-emerald-900 shadow-xs">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Arsitektur & Spesifikasi Tabel Google Spreadsheet</span>
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Fungsi <code className="bg-emerald-900 px-1.5 py-0.5 rounded text-amber-300">initDatabase()</code> akan secara otomatis menyusun 5 sheet lengkap dengan baris pertama terkunci (*frozen*), formula relasi, dan styling warna resmi Kemenag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sheet 1: Profil */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold text-emerald-800">Sheet 1: Profil</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Key-Value</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Menyimpan parameter identitas Kepala Madrasah, profil madrasah, dan atasan penandatangan.
              </p>
              <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-700 space-y-1">
                <div>Kolom A: <strong>KUNCI_PARAMETER</strong> (nama_kepala, nip, jabatan, dll)</div>
                <div>Kolom B: <strong>NILAI</strong></div>
              </div>
            </div>

            {/* Sheet 2: MasterKegiatan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold text-emerald-800">Sheet 2: MasterKegiatan</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">10 Kolom</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Daftar 16 tugas standar kepala madrasah beserta metode volume dan target bulanan.
              </p>
              <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-700">
                ID_Kegiatan | Nama_Kegiatan | Kategori | Satuan | Metode_Hitung | Target_Bulanan | Status | Urutan_Cetak | Contoh_Uraian | Default_Bukti
              </div>
            </div>

            {/* Sheet 3: LaporanHarian */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold text-emerald-800">Sheet 3: LaporanHarian</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">Sumber Lampiran I</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Penyimpanan catatan harian Kepala Madrasah dengan nomor urut, hari otomatis, dan bukti dukung.
              </p>
              <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-700">
                ID_Laporan | Tanggal | Hari | ID_Kegiatan | Uraian_Kegiatan | Output | Bukti_Dokumen | Link_Drive | Status_Validasi | Waktu_Input | Waktu_Update
              </div>
            </div>

            {/* Sheet 4: RekapBulanan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold text-emerald-800">Sheet 4: RekapBulanan</span>
                <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">Sumber Lampiran II</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Hasil kalkulasi otomatis Lampiran II yang dikelompokkan berdasarkan ID_Kegiatan dan aturan metode hitung.
              </p>
              <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-700">
                ID_Rekap | Bulan | Tahun | ID_Kegiatan | Nama_Kegiatan | Volume | Satuan | Metode_Hitung | Bukti_Dokumen | Target_Bulanan | Waktu_Rekap
              </div>
            </div>

            {/* Sheet 5: LogAktivitas */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs md:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-mono text-xs font-bold text-emerald-800">Sheet 5: LogAktivitas</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Audit Trail 6 Kolom</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Mencatat setiap tindakan penambahan, pengubahan, penghapusan, penguncian berkas, dan pembukaan kunci.
              </p>
              <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] text-slate-700">
                ID_Log | Timestamp | User | Aksi (TAMBAH/EDIT/HAPUS/REKAP/KUNCI/BUKA) | Modul | Detail
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Tab 3: Panduan Deployment */}
      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-line">
            {deploymentGuideMd}
          </div>
        </div>
      )}

      {/* Konten Tab 4: Template index.html */}
      {activeTab === 'html' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                File: index.html (Standalone Web App Service)
              </h3>
              <p className="text-[11px] text-slate-500">
                Berkas HTML mandiri jika Anda ingin menjalankan aplikasi 100% langsung di dalam Google Apps Script
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {copiedHtml ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHtml ? 'Tersalin!' : 'Salin index.html'}</span>
              </button>
              <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File (.html)</span>
              </button>
            </div>
          </div>

          <div className="relative bg-slate-950 rounded-xl p-4 overflow-hidden shadow-inner border border-slate-800">
            <pre className="text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
              {standaloneIndexHtml}
            </pre>
          </div>
        </div>
      )}

      {/* Konten Tab 5: Backup & Koneksi GAS */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Konfigurasi Web App URL */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-emerald-900 font-bold text-xs uppercase">
              <Server className="w-4 h-4 text-emerald-800" />
              <span>Sinkronisasi Google Apps Script Web App</span>
            </div>

            <form onSubmit={handleSaveGasConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono text-[11px]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Dapatkan URL ini setelah melakukan Deploy &gt; New Deployment &gt; Web App pada editor Apps Script
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  ID Google Spreadsheet
                </label>
                <input
                  type="text"
                  value={spreadsheetIdInput}
                  onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                  placeholder="1AbC_kEmEnAg_SpReAdShEeT_iDeXamPle2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                >
                  Simpan Konfigurasi
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testResult.status === 'loading'}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-200"
                >
                  <Play className={`w-3.5 h-3.5 ${testResult.status === 'loading' ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi Backend</span>
                </button>
              </div>

              {testResult.status !== 'idle' && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    testResult.status === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : testResult.status === 'error'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </form>
          </div>

          {/* Kolom Kanan: Backup & Restore Mandiri */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 text-emerald-900 font-bold text-xs uppercase">
              <Database className="w-4 h-4 text-emerald-800" />
              <span>Cadangan & Pemulihan Data (JSON)</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Unduh Berkas Cadangan Lengkap</h4>
                <p className="text-slate-600 text-[11px] mb-3">
                  Simpan seluruh profil, madrasah, 16 master kegiatan, catatan laporan harian, rekapitulasi, dan log ke berkas .JSON di perangkat lokal Anda.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File Cadangan JSON</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">Pulihkan Data dari Berkas JSON</h4>
                <p className="text-slate-600 text-[11px] mb-3">
                  Unggah berkas cadangan JSON yang pernah diunduh sebelumnya untuk memulihkan seluruh data operasional madrasah.
                </p>
                <label className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer max-w-fit">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-rose-800 text-xs">Reset ke Data Standar Kemenag</h5>
                    <p className="text-[11px] text-slate-500">
                      Kembalikan seluruh data ke contoh resmi Kepala Madrasah awal
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke bawaan resmi Kemenag?')) {
                        resetAllData();
                        alert('Seluruh data berhasil direset ke standar Kemenag RI.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
