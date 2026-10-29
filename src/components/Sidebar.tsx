import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  ListTodo,
  PlusCircle,
  FileSpreadsheet,
  Calculator,
  Printer,
  FileText,
  Archive,
  PenTool,
  Database,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface MenuItem {
  id: string;
  nomor: number;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const menuItems: MenuItem[] = [
  { id: 'dashboard', nomor: 1, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'identitas-kamad', nomor: 2, label: 'Identitas Kepala Madrasah', icon: UserCheck },
  { id: 'pengaturan-madrasah', nomor: 3, label: 'Pengaturan Madrasah', icon: Building2 },
  { id: 'master-kegiatan', nomor: 4, label: 'Master Jenis Kegiatan', icon: ListTodo },
  { id: 'input-harian', nomor: 5, label: 'Input Laporan Harian', icon: PlusCircle },
  { id: 'data-harian', nomor: 6, label: 'Data Laporan Harian', icon: FileSpreadsheet },
  { id: 'rekap-bulanan', nomor: 7, label: 'Rekapitulasi Kinerja Bulanan', icon: Calculator },
  { id: 'cetak-lampiran-1', nomor: 8, label: 'Cetak Lampiran I', icon: Printer },
  { id: 'cetak-lampiran-2', nomor: 9, label: 'Cetak Lampiran II', icon: FileText },
  { id: 'arsip-laporan', nomor: 10, label: 'Arsip Laporan', icon: Archive },
  { id: 'pengaturan-ttd', nomor: 11, label: 'Pengaturan Penandatangan', icon: PenTool },
  { id: 'backup-gas', nomor: 12, label: 'Backup & Google Apps Script', icon: Database },
];

export const Sidebar: React.FC<{ isMobileOpen?: boolean; onCloseMobile?: () => void }> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { activeMenu, setActiveMenu, laporanHarian, selectedBulan, selectedTahun } = useApp();

  // Hitung jumlah kegiatan di bulan terpilih
  const currentMonthCount = laporanHarian.filter((l) => {
    const [y, m] = l.tanggal.split('-');
    return Number(y) === selectedTahun && Number(m) === selectedBulan;
  }).length;

  const handleSelect = (id: string) => {
    setActiveMenu(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 print-hide ${
        isMobileOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'hidden md:flex'
      }`}
    >
      {/* Title Sidebar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Menu Utama Kinerja
        </span>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
          12 Modul
        </span>
      </div>

      {/* Daftar Menu 1 s/d 12 */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          // Tambahkan badge dinamis pada menu tertentu
          let badgeText: string | number | null = null;
          if (item.id === 'data-harian') {
            badgeText = currentMonthCount;
          }

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isActive ? 'bg-amber-400 text-emerald-950 font-bold' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.nomor}
                </span>
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-emerald-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                {badgeText !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                      isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">Database:</span>
          <span className="text-emerald-700 font-mono text-[10px] font-semibold">Google Sheets Sync</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">Standar Permenag No. 58/2017 & Juknis Kinerja ASN</p>
      </div>
    </aside>
  );
};
