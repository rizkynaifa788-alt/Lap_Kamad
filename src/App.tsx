import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { MadrasahView } from './views/MadrasahView';
import { MasterKegiatanView } from './views/MasterKegiatanView';
import { InputHarianView } from './views/InputHarianView';
import { DataHarianView } from './views/DataHarianView';
import { RekapBulananView } from './views/RekapBulananView';
import { CetakLampiran1View } from './views/CetakLampiran1View';
import { CetakLampiran2View } from './views/CetakLampiran2View';
import { ArsipLaporanView } from './views/ArsipLaporanView';
import { PenandatanganView } from './views/PenandatanganView';
import { BackupGasView } from './views/BackupGasView';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeMenu } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'identitas-kamad':
        return <ProfileView />;
      case 'pengaturan-madrasah':
        return <MadrasahView />;
      case 'master-kegiatan':
        return <MasterKegiatanView />;
      case 'input-harian':
        return <InputHarianView />;
      case 'data-harian':
        return <DataHarianView />;
      case 'rekap-bulanan':
        return <RekapBulananView />;
      case 'cetak-lampiran-1':
        return <CetakLampiran1View />;
      case 'cetak-lampiran-2':
        return <CetakLampiran2View />;
      case 'arsip-laporan':
        return <ArsipLaporanView />;
      case 'pengaturan-ttd':
        return <PenandatanganView />;
      case 'backup-gas':
        return <BackupGasView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header Utama Kemenag */}
      <Header />

      {/* Bar Navigasi Mobile (Hanya tampil di layar kecil) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between no-print">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200"
        >
          <Menu className="w-4 h-4 text-emerald-800" />
          <span>Daftar 12 Menu Kinerja</span>
        </button>
      </div>

      {/* Body Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigasi */}
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Backdrop untuk Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          />
        )}

        {/* Konten Utama */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Footer Hak Cipta & Standar Kemenag */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Sistem Informasi Laporan Kinerja Kepala Madrasah · Kementerian Agama Republik Indonesia
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Standar Dokumen Formal Lampiran I & Lampiran II (A4)
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
