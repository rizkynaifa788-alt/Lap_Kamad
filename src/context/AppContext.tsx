import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ProfileKepala,
  MadrasahInfo,
  PenandatanganInfo,
  MasterKegiatan,
  LaporanHarian,
  RekapBulananItem,
  ArsipLaporan,
  LogAktivitas,
  GasConfig,
} from '../types';
import {
  defaultProfile,
  defaultMadrasah,
  defaultPenandatangan,
  defaultMasterKegiatan,
  defaultLaporanHarian,
  defaultArsipList,
  defaultLogAktivitas,
  defaultGasConfig,
} from '../data/initialData';

interface AppContextType {
  profile: ProfileKepala;
  updateProfile: (data: ProfileKepala) => void;
  madrasah: MadrasahInfo;
  updateMadrasah: (data: MadrasahInfo) => void;
  penandatangan: PenandatanganInfo;
  updatePenandatangan: (data: PenandatanganInfo) => void;
  masterKegiatan: MasterKegiatan[];
  addMasterKegiatan: (item: MasterKegiatan) => void;
  updateMasterKegiatan: (item: MasterKegiatan) => void;
  deleteMasterKegiatan: (id: string) => { success: boolean; message: string };
  toggleMasterStatus: (id: string) => void;
  laporanHarian: LaporanHarian[];
  addLaporanHarian: (item: Omit<LaporanHarian, 'id' | 'waktuInput' | 'waktuUpdate'>) => { success: boolean; message: string };
  updateLaporanHarian: (item: LaporanHarian) => { success: boolean; message: string };
  deleteLaporanHarian: (id: string) => { success: boolean; message: string };
  deleteMultipleLaporanHarian: (ids: string[]) => { success: boolean; count: number; message: string };
  arsipList: ArsipLaporan[];
  kunciLaporanBulanan: (bulan: number, tahun: number, catatan?: string) => void;
  bukaLaporanBulanan: (bulan: number, tahun: number, alasan: string) => void;
  isBulanTerkunci: (bulan: number, tahun: number) => boolean;
  logs: LogAktivitas[];
  gasConfig: GasConfig;
  updateGasConfig: (data: GasConfig) => void;
  selectedBulan: number;
  setSelectedBulan: (bulan: number) => void;
  selectedTahun: number;
  setSelectedTahun: (tahun: number) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  rekapBulanan: RekapBulananItem[];
  rekapTimestamp: string;
  perbaruiRekap: () => void;
  resetAllData: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'kamad_kemenag_profile_v1',
  MADRASAH: 'kamad_kemenag_madrasah_v1',
  PENANDATANGAN: 'kamad_kemenag_penandatangan_v1',
  MASTER: 'kamad_kemenag_master_v1',
  HARIAN: 'kamad_kemenag_harian_v1',
  ARSIP: 'kamad_kemenag_arsip_v1',
  LOGS: 'kamad_kemenag_logs_v1',
  GAS: 'kamad_kemenag_gas_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profil
  const [profile, setProfile] = useState<ProfileKepala>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  // 2. Madrasah
  const [madrasah, setMadrasah] = useState<MadrasahInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MADRASAH);
    return saved ? JSON.parse(saved) : defaultMadrasah;
  });

  // 3. Penandatangan
  const [penandatangan, setPenandatangan] = useState<PenandatanganInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PENANDATANGAN);
    return saved ? JSON.parse(saved) : defaultPenandatangan;
  });

  // 4. Master Kegiatan
  const [masterKegiatan, setMasterKegiatan] = useState<MasterKegiatan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MASTER);
    if (!saved) return defaultMasterKegiatan;
    try {
      const parsed: MasterKegiatan[] = JSON.parse(saved);
      // Migrate old categories to new 12 Bidang if needed
      const categoryMigration: Record<string, string> = {
        'Manajerial': 'Bidang Perencanaan dan Pengembangan Madrasah',
        'Supervisi Guru & Tendik': 'Bidang Supervisi Akademik dan Manajerial',
        'Pengembangan Kewirausahaan': 'Bidang Pengembangan Kewirausahaan dan Inovasi',
        'Tugas Tambahan / Kedinasan': 'Bidang Hubungan Masyarakat dan Kemitraan',
      };
      const migrated = parsed.map((k) => {
        const defaultMatch = defaultMasterKegiatan.find((d) => d.id === k.id);
        const mappedCat = defaultMatch ? defaultMatch.kategori : (categoryMigration[k.kategori] || k.kategori);
        return {
          ...k,
          kategori: mappedCat as MasterKegiatan['kategori'],
        };
      });
      // Add any missing new items (e.g. KEG-017 s/d KEG-020)
      const existingIds = new Set(migrated.map((m) => m.id));
      defaultMasterKegiatan.forEach((def) => {
        if (!existingIds.has(def.id)) {
          migrated.push(def);
        }
      });
      return migrated;
    } catch {
      return defaultMasterKegiatan;
    }
  });

  // 5. Laporan Harian
  const [laporanHarian, setLaporanHarian] = useState<LaporanHarian[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HARIAN);
    return saved ? JSON.parse(saved) : defaultLaporanHarian;
  });

  // 6. Arsip
  const [arsipList, setArsipList] = useState<ArsipLaporan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARSIP);
    return saved ? JSON.parse(saved) : defaultArsipList;
  });

  // 7. Logs
  const [logs, setLogs] = useState<LogAktivitas[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : defaultLogAktivitas;
  });

  // 8. Gas Config
  const [gasConfig, setGasConfig] = useState<GasConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAS);
    return saved ? JSON.parse(saved) : defaultGasConfig;
  });

  // Filter Bulan & Tahun Aktif (Default Oktober 2026)
  const [selectedBulan, setSelectedBulan] = useState<number>(10);
  const [selectedTahun, setSelectedTahun] = useState<number>(2026);

  // Active Menu
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  // Trigger untuk refresh perhitungan rekap
  const [rekapCounter, setRekapCounter] = useState<number>(0);
  const [rekapTimestamp, setRekapTimestamp] = useState<string>(() => new Date().toLocaleString('id-ID'));

  // Sinkronisasi ke LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MADRASAH, JSON.stringify(madrasah));
  }, [madrasah]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PENANDATANGAN, JSON.stringify(penandatangan));
  }, [penandatangan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MASTER, JSON.stringify(masterKegiatan));
  }, [masterKegiatan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HARIAN, JSON.stringify(laporanHarian));
  }, [laporanHarian]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARSIP, JSON.stringify(arsipList));
  }, [arsipList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAS, JSON.stringify(gasConfig));
  }, [gasConfig]);

  // Helper Tambah Log
  const tambahLog = (aksi: LogAktivitas['aksi'], modul: string, detail: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const newLog: LogAktivitas = {
      id: `LOG-${Date.now()}`,
      timestamp: timeStr,
      user: profile.nama.split(',')[0] || 'Kepala Madrasah',
      aksi,
      modul,
      detail,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const isBulanTerkunci = (bulan: number, tahun: number) => {
    const arsip = arsipList.find((a) => a.bulan === bulan && a.tahun === tahun);
    return arsip?.status === 'Terkunci' || arsip?.status === 'Disetujui';
  };

  // 1. Profil Updater
  const updateProfile = (data: ProfileKepala) => {
    setProfile(data);
    tambahLog('EDIT', 'Identitas Kepala Madrasah', 'Memperbarui profil Kepala Madrasah: ' + data.nama);
  };

  // 2. Madrasah Updater
  const updateMadrasah = (data: MadrasahInfo) => {
    setMadrasah(data);
    tambahLog('EDIT', 'Pengaturan Madrasah', 'Memperbarui data madrasah: ' + data.namaMadrasah);
  };

  // 3. Penandatangan Updater
  const updatePenandatangan = (data: PenandatanganInfo) => {
    setPenandatangan(data);
    tambahLog('EDIT', 'Pengaturan Penandatangan', 'Memperbarui penandatangan: ' + data.pejabatNama);
  };

  // 4. Master Kegiatan CRUD
  const addMasterKegiatan = (item: MasterKegiatan) => {
    setMasterKegiatan((prev) => [...prev, item]);
    tambahLog('TAMBAH', 'Master Kegiatan', 'Menambahkan master kegiatan baru: ' + item.nama);
  };

  const updateMasterKegiatan = (item: MasterKegiatan) => {
    setMasterKegiatan((prev) => prev.map((k) => (k.id === item.id ? item : k)));
    tambahLog('EDIT', 'Master Kegiatan', 'Memperbarui master kegiatan: ' + item.nama);
  };

  const deleteMasterKegiatan = (id: string) => {
    const target = masterKegiatan.find((k) => k.id === id);
    if (!target) {
      return { success: false, message: 'Master kegiatan tidak ditemukan.' };
    }
    setMasterKegiatan((prev) => prev.filter((k) => k.id !== id));
    tambahLog('HAPUS', 'Master Kegiatan', 'Menghapus master kegiatan: ' + (target.nama || id));
    return { success: true, message: `Master kegiatan "${target.nama}" berhasil dihapus.` };
  };

  const toggleMasterStatus = (id: string) => {
    setMasterKegiatan((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, status: k.status === 'aktif' ? 'nonaktif' : 'aktif' } : k
      )
    );
  };

  // 5. Laporan Harian CRUD
  const addLaporanHarian = (item: Omit<LaporanHarian, 'id' | 'waktuInput' | 'waktuUpdate'>) => {
    const [thn, bln] = item.tanggal.split('-');
    if (isBulanTerkunci(Number(bln), Number(thn))) {
      return {
        success: false,
        message: `Laporan bulan ${bln}/${thn} sudah terkunci/diarsipkan. Buka kunci terlebih dahulu jika ingin menambah kegiatan.`,
      };
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const newId = `LH-${thn}${bln}-${Date.now().toString().slice(-4)}`;

    const newItem: LaporanHarian = {
      ...item,
      id: newId,
      waktuInput: nowStr,
      waktuUpdate: nowStr,
    };

    setLaporanHarian((prev) => [newItem, ...prev]);
    tambahLog('TAMBAH', 'Laporan Harian', `Menambahkan kegiatan ${item.tanggal} (${item.hari}): ${item.uraianKegiatan.slice(0, 40)}...`);
    return { success: true, message: 'Laporan harian berhasil disimpan.' };
  };

  const updateLaporanHarian = (item: LaporanHarian) => {
    const [thn, bln] = item.tanggal.split('-');
    if (isBulanTerkunci(Number(bln), Number(thn))) {
      return {
        success: false,
        message: `Laporan bulan ${bln}/${thn} terkunci. Perubahan tidak diizinkan.`,
      };
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    setLaporanHarian((prev) =>
      prev.map((l) => (l.id === item.id ? { ...item, waktuUpdate: nowStr } : l))
    );
    tambahLog('EDIT', 'Laporan Harian', `Memperbarui kegiatan ID ${item.id} (${item.tanggal})`);
    return { success: true, message: 'Catatan kegiatan berhasil diperbarui.' };
  };

  const deleteLaporanHarian = (id: string) => {
    const target = laporanHarian.find((l) => l.id === id);
    if (!target) {
      return { success: false, message: 'Data kegiatan tidak ditemukan.' };
    }
    const [thn, bln] = target.tanggal.split('-');
    if (isBulanTerkunci(Number(bln), Number(thn))) {
      return {
        success: false,
        message: `Laporan bulan ${bln}/${thn} terkunci. Penghapusan tidak diizinkan.`,
      };
    }
    setLaporanHarian((prev) => prev.filter((l) => l.id !== id));
    tambahLog('HAPUS', 'Laporan Harian', `Menghapus laporan harian ID ${id}: ${target.uraianKegiatan.slice(0, 40)}...`);
    return { success: true, message: 'Data kegiatan harian berhasil dihapus.' };
  };

  const deleteMultipleLaporanHarian = (ids: string[]) => {
    if (!ids || ids.length === 0) {
      return { success: false, count: 0, message: 'Tidak ada item yang dipilih untuk dihapus.' };
    }
    const targets = laporanHarian.filter((l) => ids.includes(l.id));
    const lockedItems = targets.filter((l) => {
      const [thn, bln] = l.tanggal.split('-');
      return isBulanTerkunci(Number(bln), Number(thn));
    });

    if (lockedItems.length > 0) {
      return {
        success: false,
        count: 0,
        message: `${lockedItems.length} kegiatan berada pada periode bulan yang terkunci dan tidak dapat dihapus.`,
      };
    }

    const idsSet = new Set(ids);
    setLaporanHarian((prev) => prev.filter((l) => !idsSet.has(l.id)));
    tambahLog('HAPUS', 'Laporan Harian', `Menghapus massal ${targets.length} data kegiatan harian`);
    return {
      success: true,
      count: targets.length,
      message: `${targets.length} data kegiatan harian berhasil dihapus.`,
    };
  };

  // 6. Kunci & Buka Arsip
  const kunciLaporanBulanan = (bulan: number, tahun: number, catatan?: string) => {
    const totalKeg = laporanHarian.filter((l) => {
      const [tY, tM] = l.tanggal.split('-');
      return Number(tY) === tahun && Number(tM) === bulan;
    }).length;

    const arsipId = `ARS-${tahun}-${String(bulan).padStart(2, '0')}`;
    const now = new Date().toLocaleString('id-ID');

    setArsipList((prev) => {
      const filtered = prev.filter((a) => !(a.bulan === bulan && a.tahun === tahun));
      return [
        ...filtered,
        {
          id: arsipId,
          bulan,
          tahun,
          totalKegiatan: totalKeg,
          totalVolume: totalKeg,
          status: 'Terkunci',
          tanggalKunci: now,
          catatanEvaluasi: catatan || 'Laporan bulanan telah difinalisasi dan dikunci untuk pencetakan resmi.',
        },
      ];
    });
    tambahLog('KUNCI', 'Arsip Laporan', `Mengunci laporan periode ${bulan}/${tahun} (${totalKeg} kegiatan)`);
  };

  const bukaLaporanBulanan = (bulan: number, tahun: number, alasan: string) => {
    setArsipList((prev) =>
      prev.map((a) =>
        a.bulan === bulan && a.tahun === tahun
          ? { ...a, status: 'Draft', alasanBuka: alasan }
          : a
      )
    );
    tambahLog('BUKA', 'Arsip Laporan', `Membuka kunci laporan periode ${bulan}/${tahun}. Alasan: ${alasan}`);
  };

  // 7. Engine Rekapitulasi Otomatis (Lampiran I -> Lampiran II)
  const perbaruiRekap = () => {
    setRekapCounter((c) => c + 1);
    setRekapTimestamp(new Date().toLocaleString('id-ID'));
    tambahLog('REKAP', 'Rekapitulasi Bulanan', `Menghitung ulang rekapitulasi Lampiran II periode ${selectedBulan}/${selectedTahun}`);
  };

  const rekapBulanan = useMemo(() => {
    // Saring laporan harian pada bulan dan tahun terpilih
    const prefix = `${selectedTahun}-${String(selectedBulan).padStart(2, '0')}`;
    const entries = laporanHarian.filter((item) => item.tanggal.startsWith(prefix));

    // Petakan ke master kegiatan
    const groups: Record<string, LaporanHarian[]> = {};
    entries.forEach((e) => {
      if (!groups[e.idKegiatan]) {
        groups[e.idKegiatan] = [];
      }
      groups[e.idKegiatan].push(e);
    });

    const result: RekapBulananItem[] = [];
    const sortedMasters = [...masterKegiatan].sort((a, b) => a.urutanCetak - b.urutanCetak);

    let no = 1;
    sortedMasters.forEach((master) => {
      const rowEntries = groups[master.id] || [];
      if (rowEntries.length === 0) return; // Hanya tampilkan yang terlaksana nyata

      let volume = 0;
      switch (master.metodeHitung) {
        case 'pelaksanaan':
          // Setiap catatan kegiatan valid = 1 kali pelaksanaan
          volume = rowEntries.length;
          break;
        case 'tanggal_unik':
          // Dihitung berdasarkan tanggal kalender unik
          const uniqueDays = new Set(rowEntries.map((e) => e.tanggal));
          volume = uniqueDays.size;
          break;
        case 'output_dokumen':
          // Dihitung berdasarkan jumlah dokumen atau output terverifikasi
          volume = rowEntries.length;
          break;
        case 'manual':
          // Volume manual jika ditentukan atau 1 jika ada entri
          const manualSum = rowEntries.reduce((sum, e) => sum + (e.manualVolume || 1), 0);
          volume = manualSum;
          break;
        default:
          volume = rowEntries.length;
      }

      // Kumpulkan ringkasan dokumen bukti
      const buktiSet = new Set<string>();
      rowEntries.forEach((e) => {
        if (e.buktiDokumen && e.buktiDokumen.trim() !== '') {
          buktiSet.add(e.buktiDokumen.trim());
        }
      });
      const buktiList = Array.from(buktiSet);
      const buktiRingkas = buktiList.length > 0 ? buktiList.slice(0, 3).join(', ') : master.defaultBukti || 'Dokumen';

      const persen = master.targetBulanan > 0 ? Math.min(Math.round((volume / master.targetBulanan) * 100), 100) : 100;

      result.push({
        no: no++,
        idKegiatan: master.id,
        namaKegiatan: master.nama,
        kategori: master.kategori,
        volume,
        satuan: master.satuan,
        metodeHitung: master.metodeHitung,
        targetBulanan: master.targetBulanan,
        persenCapaian: persen,
        buktiDokumen: buktiRingkas,
        rincianHarian: rowEntries,
      });
    });

    return result;
  }, [laporanHarian, masterKegiatan, selectedBulan, selectedTahun, rekapCounter]);

  // 8. Update GAS config
  const updateGasConfig = (data: GasConfig) => {
    setGasConfig(data);
    tambahLog('SYNC', 'Pengaturan GAS', 'Memperbarui konfigurasi Google Apps Script');
  };

  // 9. Reset Semua Data ke Default Kemenag
  const resetAllData = () => {
    setProfile(defaultProfile);
    setMadrasah(defaultMadrasah);
    setPenandatangan(defaultPenandatangan);
    setMasterKegiatan(defaultMasterKegiatan);
    setLaporanHarian(defaultLaporanHarian);
    setArsipList(defaultArsipList);
    setLogs(defaultLogAktivitas);
    setGasConfig(defaultGasConfig);
    setSelectedBulan(10);
    setSelectedTahun(2026);
    localStorage.clear();
    tambahLog('BACKUP', 'Sistem', 'Mereset seluruh data ke data standar resmi Kemenag RI');
  };

  // 10. Backup & Restore JSON
  const exportBackupJson = () => {
    const backupObj = {
      app: 'SISTEM_INFORMASI_LAPORAN_KINERJA_KAMAD_KEMENAG',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      madrasah,
      penandatangan,
      masterKegiatan,
      laporanHarian,
      arsipList,
      logs,
      gasConfig,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importBackupJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.profile || !data.masterKegiatan || !data.laporanHarian) {
        return { success: false, message: 'Format berkas JSON cadangan tidak sesuai atau tidak lengkap.' };
      }
      setProfile(data.profile);
      if (data.madrasah) setMadrasah(data.madrasah);
      if (data.penandatangan) setPenandatangan(data.penandatangan);
      setMasterKegiatan(data.masterKegiatan);
      setLaporanHarian(data.laporanHarian);
      if (data.arsipList) setArsipList(data.arsipList);
      if (data.logs) setLogs(data.logs);
      if (data.gasConfig) setGasConfig(data.gasConfig);

      tambahLog('BACKUP', 'Sistem', 'Memulihkan data sistem dari berkas cadangan JSON.');
      return { success: true, message: 'Data cadangan berhasil dipulihkan secara utuh.' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: 'Gagal membaca berkas JSON: ' + errorMsg };
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        madrasah,
        updateMadrasah,
        penandatangan,
        updatePenandatangan,
        masterKegiatan,
        addMasterKegiatan,
        updateMasterKegiatan,
        deleteMasterKegiatan,
        toggleMasterStatus,
        laporanHarian,
        addLaporanHarian,
        updateLaporanHarian,
        deleteLaporanHarian,
        deleteMultipleLaporanHarian,
        arsipList,
        kunciLaporanBulanan,
        bukaLaporanBulanan,
        isBulanTerkunci,
        logs,
        gasConfig,
        updateGasConfig,
        selectedBulan,
        setSelectedBulan,
        selectedTahun,
        setSelectedTahun,
        activeMenu,
        setActiveMenu,
        rekapBulanan,
        rekapTimestamp,
        perbaruiRekap,
        resetAllData,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
