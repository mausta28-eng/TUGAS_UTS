// Data dummy (pengganti database) - format Array JSON
const dataKatalogBuku = [
  { kode: "BK-001", gambar: "img/buku1.png", judul: "Dasar-Dasar HTML & CSS", penulis: "Rina Wijaya", kategori: "Web", harga: 85000, stok: 24 },
  { kode: "BK-002", gambar: "img/buku2.png", judul: "JavaScript untuk Pemula", penulis: "Andi Pratama", kategori: "Web", harga: 95000, stok: 18 },
  { kode: "BK-003", gambar: "img/buku3.png", judul: "Algoritma dan Struktur Data", penulis: "Budi Santoso", kategori: "Informatika", harga: 120000, stok: 9 },
  { kode: "BK-004", gambar: "img/buku4.png", judul: "Basis Data Relasional", penulis: "Sari Lestari", kategori: "Informatika", harga: 110000, stok: 12 },
  { kode: "BK-005", gambar: "img/buku5.png", judul: "Desain Antarmuka Pengguna", penulis: "Dewi Anggraini", kategori: "Desain", harga: 98000, stok: 5 },
  { kode: "BK-006", gambar: "img/buku6.png", judul: "Jaringan Komputer Praktis", penulis: "Hadi Kurniawan", kategori: "Jaringan", harga: 105000, stok: 0 }
];

const dataPengguna = [
  { nama: "Mahasiswa UT", email: "mahasiswa@mail.com", password: "123456" },
  { nama: "Admin Toko", email: "admin@mail.com", password: "admin123" }
];

const dataPesanan = [
  { do: "DO-1001", nama: "Rina Wijaya", tanggal: "2026-10-28", ekspedisi: "JNE", jenis: "Reguler", total: 190000, status: 3, items: [{ kode: "BK-001", gambar: "img/buku1.png", qty: 2 }] },
  { do: "DO-1002", nama: "Andi Pratama", tanggal: "2026-11-03", ekspedisi: "J&T Express", jenis: "Express", total: 145000, status: 2, items: [{ kode: "BK-002", gambar: "img/buku2.png", qty: 1 }, { kode: "BK-005", gambar: "img/buku5.png", qty: 1 }] },
  { do: "DO-1003", nama: "Sari Lestari", tanggal: "2026-11-06", ekspedisi: "SiCepat", jenis: "Reguler", total: 130000, status: 0, items: [{ kode: "BK-004", gambar: "img/buku4.png", qty: 1 }] }
];

const tahapPengiriman = ["Pesanan diproses", "Dikemas", "Dalam pengiriman", "Diterima"];
