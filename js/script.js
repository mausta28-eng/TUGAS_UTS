const $ = (s, r = document) => r.querySelector(s);
const rp = n => "Rp" + Number(n).toLocaleString("id-ID");
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const user = () => { try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; } };
const katalog = () => load("katalog", dataKatalogBuku);
const semuaPesanan = () => [...dataPesanan, ...load("orders", [])];
const judulBuku = kode => (katalog().find(b => b.kode === kode) || {}).judul || kode;

// Modal box (elemen <dialog>)
function modal(judul, isi) {
  const d = document.createElement("dialog");
  d.innerHTML = `<h2>${judul}</h2><div>${isi}</div><button type="button" class="btn ghost tutup">Tutup</button>`;
  d.querySelector(".tutup").onclick = () => d.close();
  d.addEventListener("close", () => d.remove());
  document.body.append(d);
  d.showModal();
  return d;
}
// Umpan balik di dalam form
function pesan(el, teks, ok = false) { el.textContent = teks; el.className = "pesan " + (ok ? "ok" : "err"); }

const halaman = {
  login() {
    $("#formLogin").addEventListener("submit", e => {
      e.preventDefault();
      const email = $("#email").value.trim(), pass = $("#password").value;
      const users = [...dataPengguna, ...load("users", [])];
      const u = users.find(x => x.email === email && x.password === pass);
      if (!u) return alert("email/password yang anda masukkan salah");
      sessionStorage.setItem("user", JSON.stringify(u));
      location.href = "dashboard.html";
    });
    $("#btnLupa").onclick = () => {
      const d = modal("Lupa Password", `<form id="fLupa"><label>Email terdaftar<input type="email" id="lupaEmail" required></label><button class="btn">Kirim tautan reset</button><p id="pLupa"></p></form>`);
      d.querySelector("#fLupa").onsubmit = e => {
        e.preventDefault();
        const ada = [...dataPengguna, ...load("users", [])].some(x => x.email === d.querySelector("#lupaEmail").value.trim());
        pesan(d.querySelector("#pLupa"), ada ? "Tautan reset dikirim ke email Anda." : "Email tidak terdaftar.", ada);
      };
    };
    $("#btnDaftar").onclick = () => {
      const d = modal("Daftar Akun", `<form id="fDaftar"><label>Nama<input id="dNama" required></label><label>Email<input type="email" id="dEmail" required></label><label>Password (min. 6 karakter)<input type="password" id="dPass" minlength="6" required></label><button class="btn">Daftar</button><p id="pDaftar"></p></form>`);
      d.querySelector("#fDaftar").onsubmit = e => {
        e.preventDefault();
        const u = { nama: d.querySelector("#dNama").value.trim(), email: d.querySelector("#dEmail").value.trim(), password: d.querySelector("#dPass").value };
        const users = [...dataPengguna, ...load("users", [])];
        if (users.some(x => x.email === u.email)) return pesan(d.querySelector("#pDaftar"), "Email sudah terdaftar.");
        save("users", [...load("users", []), u]);
        pesan(d.querySelector("#pDaftar"), "Pendaftaran berhasil. Silakan login.", true);
      };
    };
  },

  dashboard() {
    const j = new Date().getHours();
    const sapa = j < 11 ? "Selamat pagi" : j < 15 ? "Selamat siang" : j < 18 ? "Selamat sore" : "Selamat malam";
    $("#greeting").textContent = `${sapa}, ${user().nama}`;
    $("#jam").textContent = new Date().toLocaleDateString("id-ID", { dateStyle: "full" });
  },

  stok() {
    const tbody = $("#tbStok tbody");
    const render = (kw = "") => {
      const data = katalog().filter(b => (b.judul + b.penulis + b.kategori).toLowerCase().includes(kw.toLowerCase()));
      tbody.innerHTML = data.map(b => `<tr><td><img class="cover" src="${b.gambar || "img/buku7.png"}" alt="Sampul ${b.judul}" width="44" height="62"></td><td>${b.kode}</td><td>${b.judul}</td><td>${b.penulis}</td><td>${b.kategori}</td><td>${rp(b.harga)}</td><td><span class="badge ${b.stok ? (b.stok < 10 ? "warn" : "") : "err"}">${b.stok ? b.stok : "Habis"}</span></td><td><button class="btn ghost kecil" data-hapus="${b.kode}">Hapus</button></td></tr>`).join("") || `<tr><td colspan="8">Tidak ada buku yang cocok.</td></tr>`;
    };
    render();
    $("#cari").oninput = e => render(e.target.value);
    tbody.onclick = e => {
      const k = e.target.dataset.hapus;
      if (k && confirm("Hapus buku " + k + "?")) { save("katalog", katalog().filter(b => b.kode !== k)); render($("#cari").value); }
    };
    $("#formStok").onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target), p = $("#pStok");
      const b = { kode: f.get("kode").trim().toUpperCase(), gambar: f.get("gambar") || "img/buku7.png", judul: f.get("judul").trim(), penulis: f.get("penulis").trim(), kategori: f.get("kategori").trim(), harga: +f.get("harga"), stok: +f.get("stok") };
      if (katalog().some(x => x.kode === b.kode)) return pesan(p, "Kode buku sudah dipakai.");
      if (b.harga <= 0 || b.stok < 0) return pesan(p, "Harga harus lebih dari 0 dan stok tidak boleh negatif.");
      save("katalog", [...katalog(), b]);
      render(); e.target.reset(); pesan(p, "Stok baru ditambahkan.", true);
    };
  },

  checkout() {
    let cart = load("cart", []);
    const ongkir = { Reguler: 10000, Express: 25000 };
    $("#pilihBuku").innerHTML = katalog().filter(b => b.stok > 0).map(b => `<option value="${b.kode}">${b.judul} (stok ${b.stok}) - ${rp(b.harga)}</option>`).join("");
    cart = cart.filter(c => katalog().some(b => b.kode === c.kode));
    const subtotal = () => cart.reduce((s, c) => s + c.qty * katalog().find(b => b.kode === c.kode).harga, 0);
    const render = () => {
      save("cart", cart);
      $("#tbCart tbody").innerHTML = cart.map((c, i) => { const b = katalog().find(x => x.kode === c.kode); return `<tr><td class="item"><img class="cover" src="${b.gambar || "img/buku7.png"}" alt="" width="36" height="50">${b.judul}</td><td>${rp(b.harga)}</td><td><input type="number" min="1" max="${b.stok}" value="${c.qty}" data-ubah="${i}" aria-label="Jumlah"></td><td>${rp(b.harga * c.qty)}</td><td><button type="button" class="btn ghost kecil" data-hapus="${i}">Hapus</button></td></tr>`; }).join("") || `<tr><td colspan="5">Keranjang kosong. Tambahkan buku di atas.</td></tr>`;
      $("#totalBayar").textContent = rp(subtotal() + (cart.length ? ongkir[$("#jenis").value] : 0));
    };
    render();
    $("#jenis").onchange = render;
    $("#formTambah").onsubmit = e => {
      e.preventDefault();
      const kode = $("#pilihBuku").value, qty = +$("#qty").value, b = katalog().find(x => x.kode === kode);
      if (!b) return alert("Tidak ada buku yang tersedia.");
      const ada = cart.find(c => c.kode === kode), total = qty + (ada ? ada.qty : 0);
      if (total > b.stok) return alert("Jumlah melebihi stok (" + b.stok + ").");
      ada ? ada.qty = total : cart.push({ kode, qty });
      render();
    };
    $("#tbCart").addEventListener("change", e => {
      const i = e.target.dataset.ubah; if (i === undefined) return;
      const q = +e.target.value, b = katalog().find(x => x.kode === cart[i].kode);
      if (q < 1 || q > b.stok) alert("Jumlah harus 1 - " + b.stok); else cart[i].qty = q;
      render();
    });
    $("#tbCart").addEventListener("click", e => { const i = e.target.dataset.hapus; if (i !== undefined) { cart.splice(i, 1); render(); } });
    $("#formPesan").onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target), p = $("#pPesan");
      if (!cart.length) return pesan(p, "Keranjang masih kosong.");
      if (!/^\d{10,13}$/.test(f.get("telp"))) return pesan(p, "No. telepon harus 10-13 digit angka.");
      if (f.get("alamat").trim().length < 10) return pesan(p, "Alamat minimal 10 karakter.");
      const order = { do: "DO-" + String(Date.now()).slice(-6), nama: f.get("nama").trim(), tanggal: new Date().toISOString().slice(0, 10), ekspedisi: f.get("ekspedisi"), jenis: f.get("jenis"), pembayaran: f.get("bayar"), total: subtotal() + ongkir[f.get("jenis")], status: 0, items: cart };
      save("orders", [...load("orders", []), order]);
      const k = katalog(); cart.forEach(c => { k.find(b => b.kode === c.kode).stok -= c.qty; }); save("katalog", k);
      cart = []; render(); e.target.reset(); pesan(p, "", true);
      modal("Pesanan berhasil", `<p>Nomor Delivery Order Anda:</p><p class="besar">${order.do}</p><p>Total pembayaran ${rp(order.total)}. Gunakan nomor ini di halaman Tracking.</p>`);
    };
  },

  tracking() {
    $("#formCari").onsubmit = e => {
      e.preventDefault();
      const no = $("#noDO").value.trim().toUpperCase(), hasil = $("#hasil");
      const o = semuaPesanan().find(x => x.do === no);
      if (!o) { hasil.innerHTML = `<p class="pesan err">Nomor ${no} tidak ditemukan. Coba DO-1001, DO-1002, atau DO-1003.</p>`; return; }
      const pct = (o.status / (tahapPengiriman.length - 1)) * 100;
      hasil.innerHTML = `<h2>${o.do} - ${o.nama}</h2>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        <ol class="steps">${tahapPengiriman.map((t, i) => `<li class="${i <= o.status ? "aktif" : ""}">${t}</li>`).join("")}</ol>
        <table><tbody><tr><th>Status</th><td>${tahapPengiriman[o.status]}</td></tr><tr><th>Ekspedisi</th><td>${o.ekspedisi}</td></tr><tr><th>Tanggal kirim</th><td>${o.tanggal}</td></tr><tr><th>Jenis paket</th><td>${o.jenis}</td></tr><tr><th>Total pembayaran</th><td>${rp(o.total)}</td></tr></tbody></table>`;
    };
  },

  laporan() {
    const p = semuaPesanan(), jual = {};
    p.forEach(o => o.items.forEach(i => jual[i.kode] = (jual[i.kode] || 0) + i.qty));
    $("#ringkas").innerHTML = `<div><b>${p.length}</b>pesanan</div><div><b>${rp(p.reduce((s, o) => s + o.total, 0))}</b>total transaksi</div><div><b>${Object.values(jual).reduce((a, b) => a + b, 0)}</b>buku terjual</div>`;
    $("#tbLaporan tbody").innerHTML = Object.entries(jual).sort((a, b) => b[1] - a[1]).map(([k, q]) => `<tr><td>${judulBuku(k)}</td><td>${q}</td></tr>`).join("");
  },

  riwayat() {
    $("#tbRiwayat tbody").innerHTML = semuaPesanan().slice().reverse().map(o => `<tr><td>${o.do}</td><td>${o.tanggal}</td><td>${o.nama}</td><td>${o.items.map(i => judulBuku(i.kode) + " x" + i.qty).join(", ")}</td><td>${rp(o.total)}</td><td><span class="badge ${o.status === 3 ? "" : "warn"}">${tahapPengiriman[o.status]}</span></td></tr>`).join("");
  }
};

document.addEventListener("error", e => { const i = e.target; if (i.tagName === "IMG" && !i.dataset.cadangan) { i.dataset.cadangan = "1"; i.src = "img/buku7.png"; } }, true);

document.addEventListener("DOMContentLoaded", () => {
  const h = document.body.dataset.page;
  if (h !== "login" && !user()) { location.href = "index.html"; return; }
  const keluar = $("#keluar");
  if (keluar) keluar.onclick = () => { sessionStorage.removeItem("user"); location.href = "index.html"; };
  halaman[h]();
});
