import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Bagaimana cara titip belanja (jastip) di Worthtobuy?',
    a:
      'Caranya sangat mudah! 1) Pilih event yang sedang buka PO di menu "Event Berjalan" atau ' +
      'kirim foto barang yang Anda inginkan ke WhatsApp admin. 2) Admin akan memberikan estimasi ' +
      'total belanja beserta fee jastip transparan. 3) Transfer DP atau pembayaran penuh. ' +
      '4) Tim shopper kami akan hunting langsung di venue event. 5) Setelah barang tiba di HQ ' +
      'dan lolos QC, paket akan dikemas dan dikirimkan ke alamat Anda.',
  },
  {
    q: 'Apakah semua barang dijamin 100% original?',
    a:
      'Pasti! Kami hanya belanja langsung di official booth pameran resmi (seperti IMBEX, ' +
      'WILBEX, Big Bad Wolf Books) dan authorized store. Setiap pembelanjaan dilengkapi dengan ' +
      'dokumentasi live shopping dan struk resmi dari booth.',
  },
  {
    q: 'Bagaimana jika barang yang saya titip stoknya habis di event?',
    a:
      'Jika barang yang Anda cari kosong atau habis di venue event, kami akan ' +
      'segera menginfokan alternatif atau mengembalikan dana Anda 100%. Anda juga ' +
      'dapat memilih untuk menyimpan dana ke dalam saldo Deposit WORTHTOBUY untuk ' +
      'digunakan pada titipan event berikutnya.',
  },
  {
    q: 'Dari mana pengiriman dilakukan dan berapa lama estimasi sampai?',
    a:
      'Semua pesanan dikirim dari Hub Warehouse kami. Tersedia pengiriman instant same-day untuk ' +
      'area tertentu. Untuk luar kota dan luar pulau di seluruh Indonesia, kami bekerja sama ' +
      'dengan SiCepat, JNE, dan Paxel.',
  },
  {
    q: 'Berapa fee jastip di Worthtobuy?',
    a:
      'Fee jastip kami sangat terjangkau, flat dan transparan mulai dari Rp 10.000 - Rp 35.000 ' +
      'per barang tergantung ukuran dan kategori event. Tanpa biaya tersembunyi!',
  },
];

interface HomeFaqSectionProps {
  openFaq: number | null;
  setOpenFaq: (idx: number | null) => void;
}

export function HomeFaqSection({ openFaq, setOpenFaq }: HomeFaqSectionProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-wider text-rose-600">
          Tanya Jawab
        </span>
        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Semua hal yang perlu Anda ketahui tentang layanan jastip Worthtobuy.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              className={
                'overflow-hidden rounded-2xl border border-slate-200 ' +
                'bg-white shadow-xs transition'
              }
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className={
                  'flex w-full items-center justify-between p-5 text-left font-bold ' +
                  'text-slate-900 hover:text-rose-600 transition'
                }
              >
                <span className="text-sm sm:text-base font-extrabold">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={
                    'shrink-0 text-slate-400 transition-transform duration-200 ' +
                    (isOpen ? 'rotate-180 text-rose-600' : '')
                  }
                />
              </button>
              {isOpen && (
                <div
                  className={
                    'px-5 pb-5 pt-0 text-xs sm:text-sm leading-relaxed text-slate-600 ' +
                    'border-t border-slate-100 mt-2 pt-3'
                  }
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
