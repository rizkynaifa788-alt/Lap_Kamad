import React from 'react';
import { X, ExternalLink, Calendar, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { RekapBulananItem } from '../types';
import { formatTanggalIndo } from '../utils/dateUtils';

interface DrillDownModalProps {
  item: RekapBulananItem | null;
  onClose: () => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const getMethodExplanation = (method: string) => {
    switch (method) {
      case 'pelaksanaan':
        return 'Volume dihitung berdasarkan total catatan kegiatan valid yang dilaksanakan pada periode ini (1 baris catatan = 1 Kegiatan).';
      case 'tanggal_unik':
        return 'Volume dihitung berdasarkan jumlah tanggal kalender unik terlaksananya kegiatan (beberapa catatan pada hari yang sama dihitung 1 Hari).';
      case 'output_dokumen':
        return 'Volume dihitung berdasarkan jumlah dokumen atau output terverifikasi yang dihasilkan.';
      case 'manual':
        return 'Volume dihitung berdasarkan verifikasi berkas manual dengan catatan tindak lanjut.';
      default:
        return 'Volume dihitung berdasarkan pelaksanaan kegiatan.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print-hide">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono bg-emerald-800 text-amber-300 px-1.5 py-0.5 rounded">
                  {item.idKegiatan}
                </span>
                <span className="text-xs text-emerald-200 uppercase font-semibold">
                  {item.kategori}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{item.namaKegiatan}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ringkasan Perhitungan */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 block text-[11px]">Hasil Volume:</span>
              <span className="text-base font-bold text-emerald-800 font-mono">
                {item.volume} {item.satuan}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[11px]">Metode Perhitungan:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {item.metodeHitung.replace('_', ' ')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block text-[11px]">Target Bulanan:</span>
              <span className="font-medium text-slate-700">
                {item.targetBulanan > 0 ? `${item.targetBulanan} ${item.satuan}` : 'Sesuai Kebutuhan'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-md text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Terintegrasi Otomatis dari Lampiran I</span>
          </div>
        </div>

        {/* Info Metode */}
        <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/50 flex items-start gap-2 text-[11px] text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>{getMethodExplanation(item.metodeHitung)}</p>
        </div>

        {/* Tabel Rincian Data Harian Penyusun Volume */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Catatan Harian Sumber ({item.rincianHarian.length} Catatan Terkait):
          </h4>

          {item.rincianHarian.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada catatan harian untuk jenis kegiatan ini pada bulan terpilih.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5 w-28">Tanggal & Hari</th>
                    <th className="p-2.5">Uraian Kegiatan Rinci</th>
                    <th className="p-2.5 w-44">Output / Hasil</th>
                    <th className="p-2.5 w-48">Bukti Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {item.rincianHarian.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-800">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span>{formatTanggalIndo(row.tanggal)}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block ml-4">{row.hari}</span>
                      </td>
                      <td className="p-2.5 text-slate-700 leading-relaxed">
                        {row.uraianKegiatan}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {row.output || '-'}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        <div>{row.buktiDokumen || 'Dokumen'}</div>
                        {row.linkDrive && (
                          <a
                            href={row.linkDrive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 mt-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Dokumen</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>ID Relasi Master: {item.idKegiatan}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
