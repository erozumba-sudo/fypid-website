// Pythagorean letter values
const CHAR_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Javanese pasaran cycle — reference: Jan 1, 2000 = Sabtu Wage
const PASARAN = ['Kliwon', 'Legi', 'Pahing', 'Pon', 'Wage'];
const PASARAN_NEPTU = [8, 5, 9, 7, 4];
const PASARAN_REF_IDX = 4;

const HARI_JS_TO_JAVA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_NEPTU = [5, 4, 3, 7, 8, 6, 9];

const REF_DATE = new Date(2000, 0, 1);
const REF_JS_DAY = 6;

export function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d, 10), 0);
  }
  return n;
}

// Life Path = all digits of full birthdate
export function calcLifePath(dateStr: string): number {
  const digits = dateStr.replace(/-/g, '').split('').map(Number);
  return reduceToSingle(digits.reduce((a, d) => a + d, 0));
}

// Expression Number = all letters of full name (Pythagorean)
export function calcExpressionNumber(name: string): number {
  const clean = name.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  return reduceToSingle(clean.split('').reduce((a, c) => a + (CHAR_VALUES[c] || 0), 0));
}

// Soul Urge Number = vowels only
export function calcSoulUrgeNumber(name: string): number {
  const clean = name.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  const sum = clean.split('').filter(c => VOWELS.has(c)).reduce((a, c) => a + (CHAR_VALUES[c] || 0), 0);
  return reduceToSingle(sum || 1);
}

// Past Life Number = day + month digits only
export function calcPastLifeNumber(dateStr: string): number {
  const parts = dateStr.split('-');
  const month = parts[1] || '01';
  const day = parts[2] || '01';
  return reduceToSingle((month + day).split('').map(Number).reduce((a, d) => a + d, 0));
}

export function calcWeton(dateStr: string): { weton: string; neptu: number; wetonMakna: string } {
  const date = new Date(dateStr + 'T00:00:00');
  const daysSinceRef = Math.round((date.getTime() - REF_DATE.getTime()) / 86400000);

  const jsDay = ((REF_JS_DAY + daysSinceRef) % 7 + 7) % 7;
  const pasaranIdx = ((PASARAN_REF_IDX + daysSinceRef) % 5 + 5) % 5;

  const hari = HARI_JS_TO_JAVA[jsDay];
  const pasaran = PASARAN[pasaranIdx];
  const neptu = HARI_NEPTU[jsDay] + PASARAN_NEPTU[pasaranIdx];

  const WETON_MAKNA: Record<string, string> = {
    'Minggu Kliwon': 'Weton paling sakral dan berkharisma. Orang dengan weton ini diberkahi aura spiritual yang kuat, sangat mudah mendapat simpati, dan sering dijadikan panutan. Rezekinya datang dari berbagai arah tak terduga. Neptu gabungan yang tinggi memberi ketangguhan mental dan daya tarik alami.',
    'Minggu Legi': 'Berjiwa sosial tinggi dan disenangi banyak orang. Pintu rezeki terbuka lebar melalui jaringan pertemanan dan kepercayaan orang lain. Wataknya jujur, terbuka, dan memiliki semangat tinggi dalam membantu sesama.',
    'Minggu Pahing': 'Tekad baja dan pendirian yang kuat. Sukses melalui kerja keras dan ketekunan. Cocok memimpin dan mengambil keputusan besar. Wataknya tegas dan tidak mudah goyah oleh pengaruh luar.',
    'Minggu Pon': 'Karisma alami yang menarik perhatian banyak orang. Pandai berbisnis dan meraih keuntungan. Rezekinya mengalir dari kecerdasan dalam bergaul dan membangun relasi.',
    'Minggu Wage': 'Penuh semangat dan energi positif yang menular. Suka membantu dan dipercaya banyak orang. Sukses di bidang sosial dan pelayanan masyarakat.',
    'Senin Kliwon': 'Lembut namun berpengaruh besar. Memiliki intuisi tajam dan naluri bisnis yang kuat. Rezekinya datang dari hubungan yang harmonis dan kepercayaan orang-orang terdekat.',
    'Senin Legi': 'Menyenangkan dan sangat disukai banyak orang. Pintu karir terbuka dari koneksi dan komunikasi yang baik. Wataknya ramah dan mudah beradaptasi.',
    'Senin Pahing': 'Tangguh menghadapi rintangan dan tidak mudah menyerah. Keberhasilan datang setelah perjuangan keras. Loyal dan bisa diandalkan oleh siapa saja.',
    'Senin Pon': 'Cerdas dan sangat adaptif. Mudah menyesuaikan diri dengan situasi baru. Rezekinya datang dari kreativitas dan kemampuan berinovasi.',
    'Senin Wage': 'Pekerja keras yang tak kenal lelah. Dicintai keluarga dan lingkungan sekitar. Sukses melalui ketekunan, kejujuran, dan konsistensi.',
    'Selasa Kliwon': 'Berani dan tegas tanpa keraguan. Jiwa petarung yang kuat. Sukses di bidang yang penuh tantangan dan kompetisi tinggi.',
    'Selasa Legi': 'Energik dan penuh semangat yang membara. Cocok di bidang olahraga, seni, atau wirausaha yang aktif bergerak.',
    'Selasa Pahing': 'Keras kepala tapi sangat berprinsip. Tidak pernah menyerah. Sukses melalui daya juang dan keteguhan yang luar biasa.',
    'Selasa Pon': 'Karismatik dan sangat percaya diri. Mampu mempengaruhi orang lain secara positif. Cocok jadi pemimpin atau tokoh masyarakat.',
    'Selasa Wage': 'Jujur dan apa adanya, tidak suka berpura-pura. Dipercaya karena integritasnya yang tinggi. Rezeki datang dari kejujuran dan dedikasi.',
    'Rabu Kliwon': 'Cerdas dan bijaksana melebihi usianya. Disukai sebagai tempat curhat dan penasehat. Rezeki mengalir dari ilmu, kepintaran, dan wawasan luas.',
    'Rabu Legi': 'Komunikatif dan sangat pandai bergaul. Sukses di bidang perdagangan, komunikasi, dan media. Wataknya hangat dan mudah dipercaya.',
    'Rabu Pahing': 'Punya visi jauh ke depan dan sangat strategis. Sukses di bidang perencanaan, manajemen, dan kepemimpinan organisasi.',
    'Rabu Pon': 'Stabil dan selalu bisa diandalkan. Rezekinya datang perlahan namun pasti dan terus berlimpah sepanjang hidupnya.',
    'Rabu Wage': 'Kreatif dan inovatif, selalu punya ide segar. Sukses di bidang seni, desain, teknologi, dan inovasi produk.',
    'Kamis Kliwon': 'Weton penuh berkah dan kemurahan. Berbakat memimpin dan mengurus banyak hal sekaligus. Rezekinya berlimpah dan mudah.',
    'Kamis Legi': 'Berwibawa dan dihormati banyak orang. Sukses di dunia pemerintahan, pendidikan, atau organisasi besar.',
    'Kamis Pahing': 'Pantang menyerah dan tahan banting dalam segala cobaan. Sukses setelah melewati proses panjang yang mengajarkan banyak hal berharga.',
    'Kamis Pon': 'Penuh semangat dan optimis dalam memandang kehidupan. Mudah menemukan peluang di mana orang lain tidak melihatnya.',
    'Kamis Wage': 'Pengayom dan pelindung bagi orang-orang di sekitarnya. Dicintai keluarga besar. Sukses melalui jaringan kekeluargaan yang kuat.',
    'Jumat Kliwon': 'Weton paling berkah, terutama untuk perempuan. Penuh kasih sayang dan rezeki mengalir deras. Aura positif menarik orang-orang baik dan peluang emas.',
    'Jumat Legi': 'Lemah lembut namun sangat berpengaruh. Sukses di bidang sosial, pendidikan, keagamaan, dan pelayanan masyarakat.',
    'Jumat Pahing': 'Teguh pada prinsip dan nilai-nilai hidupnya. Rezeki datang dari kesetiaan, kejujuran, dan integritas yang tidak tergoyahkan.',
    'Jumat Pon': 'Penuh pesona dan daya tarik yang kuat. Mudah mendapat bantuan dan kepercayaan dari banyak pihak tanpa harus meminta.',
    'Jumat Wage': 'Suka berderma dan membantu orang lain dengan tulus. Rezeki berlipat ganda setiap kali memberi kepada sesama.',
    'Sabtu Kliwon': 'Misterius dan penuh kedalaman. Punya kemampuan analisis yang luar biasa tajam. Sukses di bidang riset, teknologi, atau spiritual.',
    'Sabtu Legi': 'Sangat mandiri dan pekerja keras sejati. Sukses atas kemampuan sendiri tanpa bergantung pada orang lain.',
    'Sabtu Pahing': 'Keras dan berprinsip sangat kuat. Tidak mudah goyah oleh tekanan apapun. Sukses di bidang hukum, advokasi, atau perlindungan.',
    'Sabtu Pon': 'Tekun dan sangat metodis dalam bekerja. Sukses melalui keahlian teknis dan ketelitian yang tinggi.',
    'Sabtu Wage': 'Penuh ide dan gagasan brilian. Bisa sukses di bidang apapun asal konsisten dan fokus pada satu tujuan utama.',
  };

  const wetonKey = `${hari} ${pasaran}`;
  const wetonMakna = WETON_MAKNA[wetonKey] || `Weton ${wetonKey} membawa energi unik. Neptu ${neptu} menunjukkan kekuatan vibrasi hidupmu di alam semesta.`;

  return { weton: wetonKey, neptu, wetonMakna };
}

// Name meaning lookup
const NAME_MEANINGS: Record<string, string> = {
  adi: 'pertama dan utama; sang pemimpin yang mulia dan terdepan',
  agus: 'baik, terpuji, mulia, dan penuh berkat dari langit',
  ahmad: 'yang paling terpuji, memiliki akhlak dan sifat-sifat terbaik',
  amir: 'pemimpin yang berwibawa, memerintah dengan keadilan dan kekuasaan',
  andi: 'pemberani yang teguh pendirian dan tidak mudah goyah',
  ani: 'hidup yang penuh semangat, kebaikan, dan kegembiraan',
  anisa: 'ramah, lemah lembut, dan selalu menghibur hati orang di sekitarnya',
  arya: 'mulia, terhormat, dan berjiwa besar seperti ksatria',
  ayu: 'cantik yang bersinar dari dalam, penuh pesona dan keanggunan',
  bima: 'kuat, gagah berani, dan tak tertandingi layaknya ksatria Pandawa',
  budi: 'berbudi luhur, bijaksana, bermartabat, dan penuh kebijakan',
  cahya: 'cahaya penerang yang membimbing jalan menuju kebaikan',
  candra: 'bulan yang menerangi kegelapan malam dengan cahaya lembutnya',
  dani: 'hakim yang adil, bijaksana, dan selalu berpegang pada kebenaran',
  dewi: 'bidadari cantik, suci, dan penuh anugerah dari kayangan',
  dian: 'cahaya lilin yang tak pernah padam meski diterpa angin',
  dina: 'hari yang penuh keberkahan dan kebaikan yang mengalir',
  dito: 'berani maju dan tak kenal gentar dalam menghadapi tantangan',
  eko: 'yang pertama, tunggal, dan istimewa di antara yang lainnya',
  eka: 'satu, utama, dan tidak tertandingi dalam keunggulannya',
  fajar: 'fajar baru yang membawa harapan, cahaya, dan awal yang cemerlang',
  fauzi: 'menang, berhasil, dan sukses dalam setiap perjuangan hidupnya',
  gilang: 'bersinar gemilang dan memancarkan kemakmuran yang menerangi sekitar',
  hana: 'bunga yang mekar penuh keindahan, kelembutan, dan kesegaran',
  hendra: 'pemimpin bijak, raja yang disegani dan dicintai rakyatnya',
  indah: 'cantik, menarik, dan memesona jiwa semua yang memandangnya',
  irfan: 'berpengetahuan luas, arif, dan bijaksana melampaui usianya',
  joko: 'anak pertama yang diunggulkan dan menjadi kebanggaan keluarga',
  kirana: 'sinar matahari yang hangat, cerah, dan menerangi hari-hari',
  lestari: 'lestari abadi, tak lekang dimakan waktu, selalu harum namanya',
  lila: 'permainan semesta yang indah, keindahan ilahi yang mempesona',
  maya: 'ilusi indah yang memukau, daya pikat yang sulit ditolak',
  nanda: 'bahagia, penuh suka cita sejati yang mengalir dari dalam hati',
  novi: 'baru, segar, dan penuh semangat mengawali lembaran hidup baru',
  putri: 'puteri cantik berjiwa bangsawan, anggun, dan penuh martabat',
  raka: 'matahari terbit, pemuda yang cemerlang dan bersemangat tinggi',
  rani: 'ratu yang cantik, berwibawa, dan dihormati di lingkungannya',
  ratna: 'permata berharga yang tak ternilai harganya oleh apapun',
  reza: 'ridho dan direstui semesta alam dalam setiap langkah hidupnya',
  rina: 'gembira, penuh keceriaan, dan tawa yang menular pada semua orang',
  rizal: 'lelaki sejati yang gagah, berani, dan tidak kenal menyerah',
  sari: 'intisari kehidupan, yang terbaik dan paling murni dari segalanya',
  sinta: 'cinta suci yang mendalam, tulus, dan abadi sepanjang masa',
  sri: 'kemuliaan, kemakmuran, dan keagungan yang memancar dari dalam',
  tara: 'bintang yang menerangi kegelapan malam dengan cahaya terangnya',
  tri: 'ketiga yang seimbang, harmonis, dan penuh keselarasan hidup',
  wati: 'wanita berbudi pekerti mulia yang menjadi suri tauladan',
  wahyu: 'wahyu ilahi, anugerah agung yang turun langsung dari langit',
  yudi: 'pejuang yang gagah, berani, dan tidak kenal gentar dalam bertarung',
  yuni: 'bulan yang cerah, memikat, dan membawa kesegaran di bulan juni',
  zaki: 'cerdas, suci, dan penuh kecerdasan yang melampaui kebanyakan orang',
};

const NAME_NUMBER_MEANINGS: Record<number, string> = {
  1: 'Secara numerologis, getaran nama ini memancarkan energi kepemimpinan, kemandirian, dan keberanian untuk membuka jalan yang belum pernah dilalui orang lain. Angka 1 adalah angka para pelopor dan inovator.',
  2: 'Secara numerologis, getaran nama ini membawa vibrasi keselarasan, kasih sayang, diplomasi, dan kemampuan menyatukan perbedaan menjadi harmoni yang indah. Angka 2 adalah angka para penyembuh hati.',
  3: 'Secara numerologis, getaran nama ini memancarkan kreativitas, ekspresi diri yang kuat, kegembiraan, dan kemampuan menginspirasi orang lain melalui kata-kata dan karya. Angka 3 adalah angka para seniman jiwa.',
  4: 'Secara numerologis, getaran nama ini membawa energi kestabilan, kerja keras yang tak kenal lelah, dan fondasi yang kokoh untuk membangun sesuatu yang bertahan lama. Angka 4 adalah angka para pembangun.',
  5: 'Secara numerologis, getaran nama ini memancarkan kebebasan jiwa, petualangan, adaptabilitas tinggi, dan semangat menjalani hidup yang penuh warna. Angka 5 adalah angka para penjelajah semesta.',
  6: 'Secara numerologis, getaran nama ini membawa vibrasi kasih sayang yang tulus, rasa tanggung jawab tinggi, dan keharmonisan dalam setiap hubungan. Angka 6 adalah angka para pengasuh dan penjaga.',
  7: 'Secara numerologis, getaran nama ini memancarkan kebijaksanaan mendalam, intuisi tajam, dan koneksi spiritual yang kuat dengan alam semesta. Angka 7 adalah angka para pencari kebenaran sejati.',
  8: 'Secara numerologis, getaran nama ini membawa energi kemakmuran, kekuasaan, ambisi besar, dan kemampuan menciptakan kelimpahan materi maupun spiritual. Angka 8 adalah angka para pencipta kekayaan.',
  9: 'Secara numerologis, getaran nama ini memancarkan ketulusan jiwa, kepedulian universal, dan misi memberi dampak positif yang luas bagi umat manusia. Angka 9 adalah angka para pejuang kemanusiaan.',
};

export function getNameMeaning(fullName: string, expressionNumber: number): string {
  const firstName = fullName.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  if (NAME_MEANINGS[firstName]) return NAME_MEANINGS[firstName];
  const prefix = firstName.slice(0, 4);
  const match = Object.keys(NAME_MEANINGS).find(k => k.startsWith(prefix));
  if (match) return NAME_MEANINGS[match];
  return NAME_NUMBER_MEANINGS[expressionNumber] || NAME_NUMBER_MEANINGS[1];
}

const PAST_LIFE_MEANINGS: Record<number, string> = {
  1: 'Angka Kehidupan Masa Lalu Anda adalah 1. Pada kehidupan lampau, Anda adalah seorang pemimpin besar, raja, atau panglima perang yang disegani. Jiwa kepemimpinan, keberanian, dan tekad baja sudah tertanam dalam diri Anda sejak ribuan tahun silam. Karma yang dibawa ke kehidupan ini adalah pelajaran tentang kerendahan hati dalam memimpin — bahwa kekuatan sejati bukan untuk ditunjukkan, melainkan untuk melayani.',
  2: 'Angka Kehidupan Masa Lalu Anda adalah 2. Pada kehidupan lampau, Anda adalah seorang tabib, penyembuh jiwa, atau duta perdamaian yang dikenal karena kemampuan mendamaikan konflik. Karma yang dibawa adalah pelajaran tentang pentingnya mencintai diri sendiri sebanyak Anda mencintai orang lain — keseimbangan energi memberi dan menerima.',
  3: 'Angka Kehidupan Masa Lalu Anda adalah 3. Pada kehidupan lampau, Anda adalah seniman agung, pujangga besar, atau penghibur istana yang menciptakan karya-karya abadi. Kreativitas dan ekspresi jiwa sudah mengalir dalam darah Anda selama berabad-abad. Karma yang dibawa adalah pelajaran tentang mendisiplinkan bakat agar tidak terbuang sia-sia.',
  4: 'Angka Kehidupan Masa Lalu Anda adalah 4. Pada kehidupan lampau, Anda adalah arsitek, pengrajin tangan, atau petani yang tekun membangun hal-hal yang bermanfaat dan bertahan lama. Karma yang dibawa adalah pelajaran tentang fleksibilitas — bahwa tidak semua hal harus direncanakan secara kaku.',
  5: 'Angka Kehidupan Masa Lalu Anda adalah 5. Pada kehidupan lampau, Anda adalah penjelajah samudra, pedagang antarnegeri, atau duta budaya yang menghubungkan peradaban. Karma yang dibawa adalah pelajaran tentang komitmen — bahwa kebebasan sejati bukan lari dari tanggung jawab, melainkan menjalaninya dengan jiwa merdeka.',
  6: 'Angka Kehidupan Masa Lalu Anda adalah 6. Pada kehidupan lampau, Anda adalah guru bijak, orang tua yang penuh kasih, atau kepala suku yang mengayomi seluruh komunitasnya. Karma yang dibawa adalah pelajaran tentang melepaskan kontrol — memberi kasih sayang tanpa mengharapkan balasan.',
  7: 'Angka Kehidupan Masa Lalu Anda adalah 7. Pada kehidupan lampau, Anda adalah pertapa sufi, ilmuwan spiritual, atau oracle yang menjadi penjaga kebijaksanaan alam semesta. Karma yang dibawa adalah pelajaran tentang kepercayaan — bahwa tidak semua hal perlu dimengerti dengan logika.',
  8: 'Angka Kehidupan Masa Lalu Anda adalah 8. Pada kehidupan lampau, Anda adalah pengusaha besar, bangsawan kaya, atau pemimpin ekonomi yang mengendalikan arus kekayaan suatu wilayah. Karma yang dibawa adalah pelajaran tentang penggunaan kekuasaan yang bertanggung jawab dan bermakna bagi banyak orang.',
  9: 'Angka Kehidupan Masa Lalu Anda adalah 9. Pada kehidupan lampau, Anda adalah nabi, wali, atau pemimpin spiritual yang membawa cahaya bagi jiwa-jiwa yang tersesat di kegelapan. Karma tertinggi yang dibawa adalah menyempurnakan misi kemanusiaan dan meninggalkan warisan cahaya yang abadi.',
};

export function getPastLifeMeaning(pastLifeNumber: number): string {
  return PAST_LIFE_MEANINGS[pastLifeNumber] || PAST_LIFE_MEANINGS[1];
}

// Lucky name pools per life path — two candidates per path for dual options
const LUCKY_NAME_POOLS: Record<number, string[]> = {
  1: ['Adi', 'Eka', 'Eko', 'Dion', 'Farel', 'Hendra', 'Bayu', 'Aris'],
  2: ['Hana', 'Lila', 'Bima', 'Sari', 'Dita', 'Eka', 'Nisa', 'Rini'],
  3: ['Maya', 'Kira', 'Ani', 'Tari', 'Cleo', 'Deva', 'Sela', 'Vina'],
  4: ['Raka', 'Budi', 'Danu', 'Bagas', 'Dika', 'Yuda', 'Rian', 'Hadi'],
  5: ['Dian', 'Faiz', 'Aji', 'Ardi', 'Beni', 'Candra', 'Rafi', 'Nino'],
  6: ['Ayu', 'Dewi', 'Indah', 'Nanda', 'Wati', 'Ratna', 'Sinta', 'Lena'],
  7: ['Arya', 'Wira', 'Reza', 'Zaki', 'Hadi', 'Candra', 'Ivan', 'Dimas'],
  8: ['Wahyu', 'Rizal', 'Agus', 'Dedy', 'Hendra', 'Bowo', 'Yanto', 'Iman'],
  9: ['Andi', 'Doni', 'Nanda', 'Brama', 'Tono', 'Yanto', 'Ilham', 'Rama'],
};

export function suggestLuckyNames(fullName: string, lifePath: number): [string, string] {
  const pool = LUCKY_NAME_POOLS[lifePath] || LUCKY_NAME_POOLS[1];
  const hash = fullName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const first = pool[hash % pool.length];
  const second = pool[(hash + 3) % pool.length] !== first
    ? pool[(hash + 3) % pool.length]
    : pool[(hash + 1) % pool.length];
  return [first, second];
}

// Lucky colors per life path — 2-3 per path
const LUCKY_COLORS_MAP: Record<number, Array<{ label: string; hex: string }>> = {
  1: [{ label: 'Emas', hex: '#D4AF37' }, { label: 'Merah Keberanian', hex: '#C0392B' }, { label: 'Oranye Terang', hex: '#E67E22' }],
  2: [{ label: 'Biru Langit', hex: '#4fc3f7' }, { label: 'Putih Perak', hex: '#BDC3C7' }, { label: 'Hijau Muda', hex: '#A8D8A8' }],
  3: [{ label: 'Kuning Cerah', hex: '#F1C40F' }, { label: 'Oranye Semangat', hex: '#E67E22' }, { label: 'Merah Muda', hex: '#E91E8C' }],
  4: [{ label: 'Hijau Zamrud', hex: '#27AE60' }, { label: 'Coklat Bumi', hex: '#795548' }, { label: 'Abu-abu Baja', hex: '#607D8B' }],
  5: [{ label: 'Biru Petualang', hex: '#2980B9' }, { label: 'Turquoise', hex: '#1ABC9C' }, { label: 'Merah Api', hex: '#C0392B' }],
  6: [{ label: 'Merah Muda Lembut', hex: '#E91E63' }, { label: 'Hijau Daun', hex: '#2ECC71' }, { label: 'Krem Hangat', hex: '#F5E6D3' }],
  7: [{ label: 'Biru Tua Mistis', hex: '#1a237e' }, { label: 'Ungu Spiritual', hex: '#7b1fa2' }, { label: 'Perak Bulan', hex: '#90A4AE' }],
  8: [{ label: 'Oranye Kemakmuran', hex: '#E65100' }, { label: 'Emas Kekayaan', hex: '#D4AF37' }, { label: 'Hitam Elegan', hex: '#212121' }],
  9: [{ label: 'Teal Semesta', hex: '#00695c' }, { label: 'Merah Kemuliaan', hex: '#B71C1C' }, { label: 'Emas Cahaya', hex: '#D4AF37' }],
};

const LUCKY_GEMS = ['', 'Ruby', 'Mutiara', 'Citrine', 'Safir', 'Topaz', 'Zamrud', 'Amethyst', 'Tiger Eye', 'Lapis Lazuli'];
const ELEMENTS = ['', 'Api', 'Air', 'Kayu', 'Tanah', 'Logam', 'Air', 'Kayu', 'Api', 'Tanah'];
const LUCKY_DAYS = ['', 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Senin'];

const PERSONALITIES: Record<number, string> = {
  1: 'Jiwa seorang pemimpin visioner yang lahir dengan inisiatif luar biasa. Anda cenderung mandiri, tidak suka didikte, dan selalu ingin berada di garis terdepan. Kelebihan Anda: daya juang tinggi, percaya diri, inovatif, dan berani mengambil risiko. Potensi hambatan: kecenderungan terlalu dominan dan sulit menerima masukan orang lain — melatih diri untuk berkolaborasi adalah kunci pertumbuhan terbesar Anda.',
  2: 'Jiwa seorang diplomat dan penyembuh yang lahir dengan empati mendalam. Anda peka terhadap perasaan orang lain, mahir menyatukan perbedaan, dan selalu berusaha menciptakan kedamaian. Kelebihan Anda: sensitif, pendengar yang baik, kooperatif, dan penuh kasih sayang. Potensi hambatan: terlalu bergantung pada persetujuan orang lain dan takut konflik — membangun kepercayaan diri adalah perjalanan terpenting Anda.',
  3: 'Jiwa seorang kreator dan komunikator ulung yang lahir untuk mengekspresikan diri. Anda penuh ide, spontan, dan mampu menebarkan kegembiraan di mana pun berada. Kelebihan Anda: kreatif, karismatik, optimis, dan inspiratif. Potensi hambatan: mudah bosan dan kurang konsisten dalam menyelesaikan apa yang sudah dimulai — fokus dan disiplin adalah senjata rahasia Anda.',
  4: 'Jiwa seorang pembangun yang lahir dengan etos kerja dan kedisiplinan tinggi. Anda terstruktur, dapat diandalkan, dan memiliki kemampuan luar biasa dalam membangun sesuatu dari nol. Kelebihan Anda: tekun, loyal, jujur, dan penuh tanggung jawab. Potensi hambatan: cenderung kaku dan terlalu perfeksionis — belajar menerima ketidaksempurnaan akan membuka ruang kreativitas baru.',
  5: 'Jiwa seorang petualang bebas yang lahir dengan rasa ingin tahu yang tak pernah padam. Anda adaptif, penuh semangat, dan tumbuh paling pesat justru saat keluar dari zona nyaman. Kelebihan Anda: fleksibel, karismatik, cepat belajar, dan penuh energi. Potensi hambatan: tidak sabaran dan mudah tergoda hal-hal baru sebelum menyelesaikan yang lama — komitmen adalah jembatan menuju kesuksesan Anda.',
  6: 'Jiwa seorang penjaga harmoni yang lahir dengan cinta dan rasa tanggung jawab yang besar. Anda adalah pilar ketenangan bagi orang-orang di sekitar Anda. Kelebihan Anda: penuh kasih sayang, dapat diandalkan, adil, dan menjadi magnet kepercayaan. Potensi hambatan: suka mengurusi urusan orang lain sampai melupakan kebutuhan diri sendiri — self-love adalah fondasi dari kemampuan memberi Anda.',
  7: 'Jiwa seorang pencari kebijaksanaan yang lahir dengan pikiran analitis dan intuisi tajam. Anda lebih suka kedalaman daripada permukaan, dan memiliki koneksi spiritual yang istimewa. Kelebihan Anda: analitis, intuitif, orisinil, dan memiliki insight yang jarang dimiliki orang biasa. Potensi hambatan: cenderung menarik diri dan terlalu skeptis — membuka diri untuk percaya pada orang lain adalah transformasi terbesar Anda.',
  8: 'Jiwa seorang arsitek kemakmuran yang lahir dengan ambisi besar dan naluri bisnis yang tajam. Anda ditakdirkan untuk sukses secara materi sekaligus berpengaruh secara sosial. Kelebihan Anda: ambisius, strategis, efisien, dan berorientasi pada hasil nyata. Potensi hambatan: terlalu fokus pada materi hingga mengabaikan dimensi emosional dan spiritual — keseimbangan adalah rahasia kelimpahan sejati Anda.',
  9: 'Jiwa seorang pelayan kemanusiaan yang lahir dengan ketulusan dan kebijaksanaan yang luar biasa. Anda hadir di dunia untuk memberi, menginspirasi, dan meninggalkan jejak yang bermakna. Kelebihan Anda: bijaksana, empatik, kreatif, dan memiliki visi yang jauh melampaui kepentingan pribadi. Potensi hambatan: mudah kecewa saat ekspektasi tinggi tidak terpenuhi — melepaskan hasil dan berserah adalah kebebasan jiwa terbesar Anda.',
};

const CAREER_PATHS: Record<number, string> = {
  1: 'Wirausahawan & Founder Startup, CEO/Direktur Eksekutif, Pemimpin Organisasi, Politikus & Negarawan, Inovator Teknologi, Manajer Senior',
  2: 'Konselor & Psikolog, Diplomat & Mediator, Seniman & Musisi, Terapis & Penyembuh, HR Manager, Perawat & Bidan',
  3: 'Kreator Konten & YouTuber, Marketing & Brand Strategist, Penulis & Jurnalis, Aktor/Aktris & Pelukis, Public Speaker, Event Organizer',
  4: 'Insinyur & Arsitek, Akuntan & Auditor, Manajer Proyek, Notaris & Pengacara, Analis Sistem, Kontraktor & Developer',
  5: 'Jurnalis & Reporter Lapangan, Sales & Business Development, Tour Guide & Travel Blogger, Digital Marketer, Entrepreneur Kreatif, Agen Properti',
  6: 'Guru & Dosen, Dokter & Ahli Gizi, Desainer Interior & Dekorator, Konselor Keluarga, Chef & Pengusaha Kuliner, Pekerja Sosial',
  7: 'Peneliti & Ilmuwan, Software Engineer & Data Scientist, Psikiater & Analitik Bisnis, Filsuf & Penulis Nonfiksi, Ahli Spiritual, Auditor Forensik',
  8: 'Pengusaha Besar & Investor, Bankir & Manajer Keuangan, Broker Properti & Developer, Eksekutif Korporat, Politikus Senior, Konsultan Manajemen',
  9: 'Aktivis Sosial & Penggerak NGO, Seniman & Penulis Inspiratif, Pendidik & Motivator, Pemimpin Spiritual & Ustadz, Diplomat Kemanusiaan, Dokter di Daerah Terpencil',
};

export interface NumerologyResult {
  lifePath: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  combinedNumber: number;
  weton: string;
  wetonNeptu: number;
  wetonMakna: string;
  luckyNames: [string, string];
  luckyDay: string;
  luckyColors: Array<{ label: string; hex: string }>;
  luckyGem: string;
  element: string;
  personality: string;
  careerPath: string;
  nameMeaning: string;
  pastLifeNumber: number;
  pastLifeMeaning: string;
}

export function analyzeNumerology(
  namaLengkap: string,
  tanggalLahir: string
): NumerologyResult {
  const lifePath = calcLifePath(tanggalLahir);
  const expressionNumber = calcExpressionNumber(namaLengkap);
  const soulUrgeNumber = calcSoulUrgeNumber(namaLengkap);
  const combined = reduceToSingle(lifePath + expressionNumber);
  const { weton, neptu, wetonMakna } = calcWeton(tanggalLahir);
  const luckyNames = suggestLuckyNames(namaLengkap, lifePath);
  const pastLifeNumber = calcPastLifeNumber(tanggalLahir);

  return {
    lifePath,
    expressionNumber,
    soulUrgeNumber,
    combinedNumber: combined,
    weton,
    wetonNeptu: neptu,
    wetonMakna,
    luckyNames,
    luckyDay: LUCKY_DAYS[lifePath] || 'Jumat',
    luckyColors: LUCKY_COLORS_MAP[lifePath] || LUCKY_COLORS_MAP[1],
    luckyGem: LUCKY_GEMS[lifePath] || 'Ruby',
    element: ELEMENTS[lifePath] || 'Api',
    personality: PERSONALITIES[lifePath] || '',
    careerPath: CAREER_PATHS[lifePath] || '',
    nameMeaning: getNameMeaning(namaLengkap, expressionNumber),
    pastLifeNumber,
    pastLifeMeaning: getPastLifeMeaning(pastLifeNumber),
  };
}
