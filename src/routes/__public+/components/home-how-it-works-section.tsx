import { Calendar, ShoppingBag, Sparkles, Truck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Pilih Event / Kirim Foto',
    desc: 'Pilih jadwal event aktif kami atau kirimkan foto dan spesifikasi barang yang Anda cari.',
    icon: Calendar,
  },
  {
    step: '02',
    title: 'Konfirmasi Biaya & DP',
    desc:
      'Admin menghitungkan estimasi harga barang, fee jastip, serta detail transfer ' +
      'DP / Lunas.',
    icon: ShoppingBag,
  },
  {
    step: '03',
    title: 'Shopper Live Hunting',
    desc:
      'Tim kami belanja langsung di pameran. Anda bisa memantau prosesnya via Instagram & ' +
      'WhatsApp.',
    icon: Sparkles,
  },
  {
    step: '04',
    title: 'Pelunasan & Dikirim',
    desc:
      'Barang dicek QC di Hub Warehouse, dikemas aman, lalu dikirim via kurir instant atau ' +
      'ekspedisi.',
    icon: Truck,
  },
];

export function HomeHowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-black uppercase tracking-wider text-rose-600">
          Alur Pemesanan
        </span>
        <h2 className="mt-2 text-3xl font-black text-slate-900">
          4 Langkah Mudah Titip Belanja
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Proses cepat, santai, dan terpantau jelas di setiap langkahnya.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => (
          <div
            key={item.step}
            className={
              'relative rounded-3xl border border-slate-200 bg-white p-6 ' +
              'shadow-sm transition hover:shadow-md'
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-rose-500">{item.step}</span>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-xl ' +
                  'bg-rose-50 text-rose-600'
                }
              >
                <item.icon size={20} />
              </div>
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
