const API = "/api";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const fmt = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0),
  rup = (n) => "Rp " + fmt(n),
  today = () => new Date().toISOString().slice(0, 10);

const config = {
  catin: {
    title: "Data Calon Pengantin",
    desc: "Registrasi calon pengantin dan rencana kontribusi.",
    id: "id",
    fields: [
      ["tanggalInput", "Tanggal Input", "date", 1],
      ["kua", "KUA", "text", 1],
      ["kapanewon", "Kapanewon", "text", 1],
      ["namaCatin1", "Nama Catin 1", "text", 1],
      ["namaCatin2", "Nama Catin 2", "text", 0],
      ["tanggalAkad", "Tanggal Akad", "date", 0],
      ["jenisKontribusi", "Jenis Kontribusi", "select", 1, ["Bibit Tanaman", "Burung", "Benih Ikan", "Lainnya"]],
      ["jumlahRencana", "Jumlah Rencana", "number", 1],
      ["satuan", "Satuan", "text", 1],
      ["kontakReferensi", "Kontak/Referensi", "text", 0],
      ["petugas", "Petugas", "text", 0],
      ["keterangan", "Keterangan", "textarea", 0],
    ],
    cols: [
      ["id", "ID CAPING"],
      ["namaCatin1", "Nama Catin 1"],
      ["namaCatin2", "Nama Catin 2"],
      ["kua", "KUA"],
      ["jenisKontribusi", "Jenis Kontribusi"],
      ["tanggalAkad", "Tanggal Akad"],
    ],
  },
  penerimaan: {
    title: "Penerimaan",
    desc: "Catat kontribusi yang diterima dari calon pengantin.",
    id: "id",
    fields: [
      ["catinId", "ID CAPING", "select", 1],
      ["tanggalTerima", "Tanggal Terima", "date", 1],
      ["jenisSpesies", "Jenis/Spesies", "text", 1],
      ["jumlahDiterima", "Jumlah Diterima", "number", 1],
      ["satuan", "Satuan", "text", 1],
      ["sumber", "Sumber", "text", 0],
      ["kondisiAwal", "Kondisi Awal", "select", 0, ["Baik", "Cukup", "Kurang", "Rusak"]],
      ["statusVerifikasi", "Status Verifikasi", "select", 1, ["Belum diverifikasi", "Terverifikasi", "Perlu perbaikan", "Ditolak"]],
      ["catatan", "Catatan", "textarea", 0],
    ],
    cols: [
      ["id", "ID PENERIMAAN"],
      ["catinId", "ID CAPING"],
      ["nama", "Nama Catin"],
      ["kua", "KUA"],
      ["jenisKontribusi", "Jenis"],
      ["jumlahDiterima", "Jumlah"],
      ["statusVerifikasi", "Verifikasi"],
    ],
  },
  realisasi: {
    title: "Realisasi",
    desc: "Catat penyaluran dan pantau saldo setiap penerimaan.",
    id: "id",
    fields: [
      ["penerimaanId", "ID Penerimaan", "select", 1],
      ["tanggalRealisasi", "Tanggal Realisasi", "date", 1],
      ["jumlahRealisasi", "Jumlah Realisasi", "number", 1],
      ["metodeRealisasi", "Metode Realisasi", "select", 1, ["Ditanam mandiri", "Ditanam bersama", "Dilepasliarkan", "Disalurkan"]],
      ["lokasi", "Lokasi", "text", 1],
      ["desaKelurahan", "Desa/Kelurahan", "text", 0],
      ["jenisPerairan", "Jenis Perairan", "select", 0, ["Sungai", "Danau", "Rawa", "Kolam", "Lainnya"]],
      ["pelaksana", "Pelaksana", "text", 0],
      ["statusVerifikasi", "Status Verifikasi", "select", 1, ["Belum diverifikasi", "Terverifikasi", "Perlu perbaikan", "Ditolak"]],
      ["catatan", "Catatan", "textarea", 0],
    ],
    cols: [
      ["id", "ID REALISASI"],
      ["penerimaanId", "ID PENERIMAAN"],
      ["nama", "Nama Catin"],
      ["jenisKontribusi", "Jenis"],
      ["jumlahRealisasi", "Realisasi"],
      ["saldo", "Saldo"],
      ["statusVerifikasi", "Verifikasi"],
    ],
  },
  monitoring: {
    title: "Monitoring",
    desc: "Catat kondisi hasil realisasi dan tindak lanjut.",
    id: "id",
    fields: [
      ["realisasiId", "ID Realisasi", "select", 1],
      ["tanggalMonitoring", "Tanggal Monitoring", "date", 1],
      ["jumlahHidup", "Jumlah Hidup/Teramati", "number", 1],
      ["jumlahMati", "Jumlah Mati/Hilang", "number", 1],
      ["petugas", "Petugas", "text", 1],
      ["hasilTemuan", "Hasil/Temuan", "textarea", 0],
      ["tindakLanjut", "Tindak Lanjut", "textarea", 0],
      ["status", "Status", "select", 1, ["Baik", "Perlu pemantauan", "Perlu tindak lanjut", "Selesai"]],
    ],
    cols: [
      ["id", "ID MONITORING"],
      ["realisasiId", "ID REALISASI"],
      ["nama", "Nama Catin"],
      ["tanggalMonitoring", "Tanggal"],
      ["jumlahRealisasi", "Realisasi"],
      ["jumlahHidup", "Hidup/Teramati"],
      ["persen", "Persentase"],
      ["status", "Status"],
    ],
  },
};

let token = localStorage.getItem("sip_token") || "",
  me = null,
  db = { catin: [], penerimaan: [], realisasi: [], monitoring: [], users: [] },
  page = "dashboard",
  chart = null;

async function api(action, data = {}) {
  const r = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ action, ...data }),
  });
  let j = await r.json();
  if (!r.ok || !j.ok) throw Error(j.error || "Permintaan gagal");
  return j;
}

function toast(msg) {
  $("#toastBody").textContent = msg;
  bootstrap.Toast.getOrCreateInstance($("#toast")).show();
}

function showLogin() {
  $("#loginView").style.display = "grid";
  $("#appShell").style.display = "none";
}

function showApp() {
  $("#loginView").style.display = "none";
  $("#appShell").style.display = "block";
  $("#sideName").textContent = me.name;
  $("#sideRole").textContent = me.role === "admin" ? "Administrator Kabupaten" : `Admin ${me.kua}`;
  $("#rolePill").textContent = me.role.toUpperCase();
  document.querySelectorAll(".admin-only").forEach((x) => (x.style.display = me.role === "admin" ? "flex" : "none"));
  loadAll()
    .then(() => render())
    .catch((err) => {
      console.error("Gagal memuat data awal:", err);
      toast(err.message || "Gagal memuat data");
      render();
    });
}

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let b = $("#loginBtn");
  b.disabled = true;
  b.textContent = "Memeriksa...";
  $("#loginError").textContent = "";
  try {
    let f = new FormData(e.target);
    let j = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        username: f.get("username"),
        password: f.get("password"),
      }),
    }).then((r) => r.json());
    if (!j.ok) throw Error(j.error || "Login gagal");
    token = j.token;
    me = j.user;
    localStorage.setItem("sip_token", token);
    showApp();
  } catch (err) {
    $("#loginError").textContent = err.message;
  } finally {
    b.disabled = false;
    b.innerHTML = 'Masuk <i class="bi bi-arrow-right ms-1"></i>';
  }
});

$("#logoutBtn").onclick = () => {
  localStorage.removeItem("sip_token");
  token = "";
  me = null;
  showLogin();
};

$("#menuToggle").onclick = () => $("#sidebar").classList.toggle("show");

document.querySelectorAll(".side-link[data-page]").forEach(
  (a) =>
    (a.onclick = () => {
      page = a.dataset.page;
      $("#sidebar").classList.remove("show");
      document.querySelectorAll(".side-link").forEach((x) => x.classList.toggle("active", x === a));
      render();
    }),
);

async function loadAll() {
  const j = await api("getAll");
  const d = j && j.data ? j.data : j || {};
  db = {
    catin: Array.isArray(d.catin) ? d.catin : [],
    penerimaan: Array.isArray(d.penerimaan) ? d.penerimaan : [],
    realisasi: Array.isArray(d.realisasi) ? d.realisasi : [],
    monitoring: Array.isArray(d.monitoring) ? d.monitoring : [],
    users: Array.isArray(d.users) ? d.users : [],
  };
}

function scoped(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!me) return list;
  return me.role === "admin" ? list : list.filter((x) => x.kua === me.kua);
}

function sum(rows, k) {
  const list = Array.isArray(rows) ? rows : [];
  return list.reduce((a, x) => a + (Number(x && x[k]) || 0), 0);
}

function head(title, desc, action = "") {
  return `<div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"><div><div class="page-title">${title}</div><div class="subtle mt-1">${desc}</div></div>${action}</div>`;
}

function stat(label, val, icon, note = "") {
  return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="d-flex justify-content-between"><div class="stat-label">${label}</div><div class="stat-icon"><i class="bi ${icon}"></i></div></div><div class="stat-value">${val}</div><div class="small subtle mt-1">${note}</div></div></div>`;
}

function render() {
  let titles = {
    dashboard: "Dashboard",
    catin: "Data Catin",
    penerimaan: "Penerimaan",
    realisasi: "Realisasi",
    monitoring: "Monitoring",
    laporan: "Laporan & Kontrol",
    users: "Manajemen Pengguna",
  };
  $("#topTitle").textContent = titles[page] || "SIP-CAPING";
  if (page === "dashboard") dashboard();
  else if (config[page]) tablePage(page);
  else if (page === "laporan") reports();
  else if (page === "users") usersPage();
}

function dashboard() {
  let c = scoped(db.catin),
    p = scoped(db.penerimaan),
    r = scoped(db.realisasi),
    m = scoped(db.monitoring),
    received = sum(p, "jumlahDiterima"),
    real = sum(r, "jumlahRealisasi"),
    alive = sum(m, "jumlahHidup"),
    dead = sum(m, "jumlahMati");

  $("#pageContent").innerHTML =
    head("Dashboard", "Ringkasan pencatatan kontribusi dan monitoring CAPING.") +
    `<div class="row g-3 mb-4">${stat("Total Catin", fmt(c.length), "bi-people", "Data terdaftar")}${stat("Total Penerimaan", fmt(received), "bi-box-arrow-in-down", "Akumulasi jumlah diterima")}${stat("Total Realisasi", fmt(real), "bi-box-arrow-up-right", "Akumulasi penyaluran")}${stat("Saldo Tersedia", fmt(received - real), "bi-wallet2", "Penerimaan dikurangi realisasi")}</div>` +
    `<div class="row g-3"><div class="col-xl-8"><div class="panel"><div class="fw-bold mb-1">Komposisi kontribusi</div><div class="small subtle mb-3">Total penerimaan dan realisasi per jenis</div><canvas id="kindChart" height="115"></canvas></div></div>` +
    `<div class="col-xl-4"><div class="panel"><div class="fw-bold mb-3">Ringkasan monitoring</div><div class="d-flex justify-content-between mb-3"><span class="subtle">Hidup / teramati</span><b>${fmt(alive)}</b></div><div class="progress mb-3" style="height:9px"><div class="progress-bar bg-success" style="width:${alive + dead ? (alive / (alive + dead)) * 100 : 0}%"></div></div><div class="d-flex justify-content-between mb-2"><span class="subtle">Mati / hilang</span><b>${fmt(dead)}</b></div><div class="d-flex justify-content-between border-top pt-3 mt-3"><span class="subtle">Catatan monitoring</span><b>${m.length}</b></div></div></div>` +
    `<div class="col-12"><div class="panel"><div class="fw-bold mb-3">Aktivitas terbaru</div>${recentTable()}</div></div></div>`;

  let kinds = [...new Set(c.map((x) => x.jenisKontribusi).filter(Boolean))];
  if (chart) chart.destroy();
  let ctx = $("#kindChart");
  if (ctx && typeof Chart !== "undefined") {
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: kinds,
        datasets: [
          {
            label: "Penerimaan",
            data: kinds.map((k) =>
              sum(
                p.filter((x) => x.jenisKontribusi === k),
                "jumlahDiterima",
              ),
            ),
            backgroundColor: "#0b8751",
            borderRadius: 6,
          },
          {
            label: "Realisasi",
            data: kinds.map((k) =>
              sum(
                r.filter((x) => x.jenisKontribusi === k),
                "jumlahRealisasi",
              ),
            ),
            backgroundColor: "#a8d7b9",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }
}

function recentTable() {
  const list = Array.isArray(db.catin) ? db.catin : [];
  let arr = [...list].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5);
  return arr.length
    ? `<div class="table-responsive"><table class="table mb-0"><thead><tr><th>ID</th><th>Nama Catin</th><th>KUA</th><th>Jenis Kontribusi</th></tr></thead><tbody>${arr.map((x) => `<tr><td>${esc(x.id)}</td><td>${esc(x.namaCatin1)} ${esc(x.namaCatin2)}</td><td>${esc(x.kua)}</td><td>${esc(x.jenisKontribusi)}</td></tr>`).join("")}</tbody></table></div>`
    : '<div class="empty">Belum ada data catin.</div>';
}

function tablePage(key) {
  let c = config[key],
    rows = scoped(db[key]);
  let action = `<button class="btn btn-green" onclick="openForm('${key}')"><i class="bi bi-plus-lg me-1"></i>Tambah Data</button>`;
  $("#pageContent").innerHTML =
    head(c.title, c.desc, action) +
    `<div class="panel"><div class="d-flex flex-wrap justify-content-between gap-2 mb-3"><div class="input-group" style="max-width:340px"><span class="input-group-text bg-white"><i class="bi bi-search"></i></span><input id="searchRows" class="form-control" placeholder="Cari data..."></div><span class="small subtle align-self-center" id="rowCount">${rows.length} data</span></div><div class="table-responsive"><table class="table table-hover mb-0"><thead><tr>${c.cols.map((x) => `<th>${x[1]}</th>`).join("")}<th class="text-end">AKSI</th></tr></thead><tbody id="rowsBody">${rowHtml(key, rows)}</tbody></table></div></div>`;

  $("#searchRows").oninput = (e) => {
    let v = e.target.value.toLowerCase();
    let filtered = rows.filter((x) => Object.values(x).join(" ").toLowerCase().includes(v));
    $("#rowsBody").innerHTML = rowHtml(key, filtered);
    $("#rowCount").textContent = filtered.length + " data";
  };
}

function rowHtml(key, rows) {
  let c = config[key];
  if (!rows.length) return `<tr><td colspan="${c.cols.length + 1}"><div class="empty">Belum ada data. Klik Tambah Data untuk memulai.</div></td></tr>`;
  return rows
    .map(
      (x) =>
        `<tr>${c.cols.map(([k]) => `<td>${esc(displayValue(key, x, k))}</td>`).join("")}<td class="text-end text-nowrap"><button class="btn btn-sm btn-light" onclick="openForm('${key}','${x.id}')"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-light text-danger" onclick="del('${key}','${x.id}')"><i class="bi bi-trash"></i></button></td></tr>`,
    )
    .join("");
}

function displayValue(key, x, k) {
  if (k === "nama") return x.namaCatin1 || "";
  if (k === "saldo") return fmt(x.saldo);
  if (k === "persen") return (Number(x.persen) || 0).toFixed(1) + "%";
  if (k === "jumlahRealisasi" || k === "jumlahDiterima") return fmt(x[k]);
  return x[k] || "—";
}

function optionsFor(key, field) {
  let rows = key === "penerimaan" ? db.catin : key === "realisasi" ? db.penerimaan : key === "monitoring" ? db.realisasi : [];
  rows = Array.isArray(rows) ? rows : [];
  if (me && me.role !== "admin") rows = rows.filter((x) => x.kua === me.kua);
  return rows.map((x) => ({
    value: x.id,
    label: key === "penerimaan" ? `${x.id} • ${x.namaCatin1}` : key === "realisasi" ? `${x.id} • ${x.namaCatin1 || x.catinId}` : `${x.id} • ${x.namaCatin1 || x.penerimaanId}`,
  }));
}

function openForm(key, id = "") {
  let c = config[key];
  const list = Array.isArray(db[key]) ? db[key] : [];
  let old = id ? list.find((x) => x.id === id) || {} : {};
  $("#modalTitle").textContent = (id ? "Edit " : "Tambah ") + c.title;
  $("#modalSub").textContent = id || "Lengkapi formulir berikut";
  $("#formFields").innerHTML = c.fields
    .map(([name, label, type, req, opts]) => {
      let value = old[name] ?? (type === "date" ? today() : "");
      let input =
        type === "textarea"
          ? `<textarea class="form-control" name="${name}" rows="2">${esc(value)}</textarea>`
          : type === "select"
            ? `<select class="form-select" name="${name}" ${req ? "required" : ""}><option value="">Pilih ${label}</option>${(name === "catinId" || name === "penerimaanId" || name === "realisasiId"
                ? optionsFor(key, name).map((o) => o.label + "|" + o.value)
                : opts || []
              )
                .map((o) => {
                  let val = String(o).includes("|") ? String(o).split("|").pop() : o,
                    lab = String(o).includes("|") ? String(o).split("|").slice(0, -1).join("|") : o;
                  return `<option value="${esc(val)}" ${value === val ? "selected" : ""}>${esc(lab)}</option>`;
                })
                .join("")}</select>`
            : `<input class="form-control" type="${type}" name="${name}" value="${esc(value)}" ${req ? "required" : ""} ${type === "number" ? 'min="0" step="any"' : ""}>`;
      return `<div class="col-md-6"><label class="form-label">${label}${req ? " *" : ""}</label>${input}</div>`;
    })
    .join("");
  $("#dataForm").dataset.key = key;
  $("#dataForm").dataset.id = id;
  bootstrap.Modal.getOrCreateInstance($("#dataModal")).show();
}

$("#dataForm").onsubmit = async (e) => {
  e.preventDefault();
  let f = new FormData(e.target),
    data = {};
  for (let [k, v] of f.entries()) data[k] = v;
  if (e.target.dataset.id) data.id = e.target.dataset.id;
  let btn = $("#saveBtn");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";
  try {
    if (e.target.dataset.key === "users") {
      await api("saveUser", { data });
    } else {
      await api("save", { table: e.target.dataset.key, data });
    }
    await loadAll();
    bootstrap.Modal.getOrCreateInstance($("#dataModal")).hide();
    render();
    toast("Data berhasil disimpan.");
  } catch (err) {
    toast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan Data";
  }
};

async function del(table, id) {
  if (!confirm("Yakin ingin menghapus data ini? Penghapusan dapat memengaruhi rekap terkait.")) return;
  try {
    await api("delete", { table, id });
    await loadAll();
    render();
    toast("Data berhasil dihapus.");
  } catch (e) {
    toast(e.message);
  }
}

function reports() {
  let p = scoped(db.penerimaan),
    r = scoped(db.realisasi),
    m = scoped(db.monitoring),
    c = scoped(db.catin);
  let warnings = r.filter((x) => Number(x.saldo) < 0);
  $("#pageContent").innerHTML =
    head("Laporan & Kontrol", "Rekap data dan pemeriksaan konsistensi transaksi.") +
    `<div class="row g-3 mb-4">${stat("Data Catin", c.length, "bi-people")}${stat("Penerimaan", fmt(sum(p, "jumlahDiterima")), "bi-box-arrow-in-down")}${stat("Realisasi", fmt(sum(r, "jumlahRealisasi")), "bi-box-arrow-up-right")}${stat("Peringatan Saldo", warnings.length, "bi-exclamation-triangle")}</div>` +
    `<div class="panel mb-3"><div class="d-flex justify-content-between align-items-center mb-3"><b>Kontrol saldo penerimaan</b><button class="btn btn-outline-success btn-sm" onclick="exportCsv('realisasi')"><i class="bi bi-download me-1"></i>Export realisasi CSV</button></div>${warnings.length ? warnings.map((x) => `<div class="alert alert-warning py-2 mb-2">${esc(x.id)}: saldo negatif ${fmt(x.saldo)}</div>`).join("") : '<div class="alert alert-success mb-0">Tidak ditemukan saldo negatif.</div>'}</div>` +
    `<div class="panel"><b>Ringkasan per jenis kontribusi</b><div class="table-responsive mt-3"><table class="table"><thead><tr><th>Jenis</th><th>Catin</th><th>Diterima</th><th>Direalisasi</th><th>Saldo</th></tr></thead><tbody>${[
      ...new Set(c.map((x) => x.jenisKontribusi)),
    ]
      .map((k) => {
        let a = sum(
            p.filter((x) => x.jenisKontribusi === k),
            "jumlahDiterima",
          ),
          b = sum(
            r.filter((x) => x.jenisKontribusi === k),
            "jumlahRealisasi",
          );
        return `<tr><td>${esc(k)}</td><td>${c.filter((x) => x.jenisKontribusi === k).length}</td><td>${fmt(a)}</td><td>${fmt(b)}</td><td>${fmt(a - b)}</td></tr>`;
      })
      .join("")}</tbody></table></div></div>`;
}

function exportCsv(key) {
  let rows = scoped(db[key]);
  if (!rows.length) {
    toast("Tidak ada data untuk diekspor");
    return;
  }
  let cols = Object.keys(rows[0]),
    csv = [cols.join(";"), ...rows.map((x) => cols.map((k) => '"' + String(x[k] ?? "").replaceAll('"', '""') + '"').join(";"))].join("\r\n"),
    a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `sip-caping-${key}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function usersPage() {
  let rows = Array.isArray(db.users) ? db.users : [];
  $("#pageContent").innerHTML =
    head("Manajemen Pengguna", "Buat akun KUA dan kelola akses aplikasi.", `<button class="btn btn-green" onclick="openUserForm()"><i class="bi bi-plus-lg me-1"></i>Tambah Pengguna</button>`) +
    `<div class="panel"><div class="table-responsive"><table class="table"><thead><tr><th>Nama</th><th>Username</th><th>Role</th><th>KUA</th><th>Status</th><th></th></tr></thead><tbody>${rows.length ? rows.map((x) => `<tr><td>${esc(x.name)}</td><td>${esc(x.username)}</td><td>${esc(x.role)}</td><td>${esc(x.kua || "—")}</td><td>${x.active ? "Aktif" : "Nonaktif"}</td><td><button class="btn btn-sm btn-light" onclick="openUserForm('${esc(x.username)}')"><i class="bi bi-pencil"></i></button></td></tr>`).join("") : '<tr><td colspan="6"><div class="empty">Belum ada data pengguna.</div></td></tr>'}</tbody></table></div></div>`;
}

function openUserForm(username = "") {
  const usersList = Array.isArray(db.users) ? db.users : [];
  let old = username ? usersList.find((x) => x.username === username) || {} : {};
  $("#modalTitle").textContent = username ? "Edit Pengguna" : "Tambah Pengguna";
  $("#modalSub").textContent = "Akun dengan role KUA hanya dapat melihat data KUA-nya sendiri.";
  $("#formFields").innerHTML =
    `<div class="col-md-6"><label class="form-label">Nama</label><input class="form-control" name="name" required value="${esc(old.name || "")}"></div>` +
    `<div class="col-md-6"><label class="form-label">Username</label><input class="form-control" name="username" required ${username ? "readonly" : ""} value="${esc(old.username || "")}"></div>` +
    `<div class="col-md-6"><label class="form-label">Role</label><select class="form-select" name="role"><option value="kua" ${old.role === "kua" ? "selected" : ""}>KUA</option><option value="admin" ${old.role === "admin" ? "selected" : ""}>Admin Kabupaten</option></select></div>` +
    `<div class="col-md-6"><label class="form-label">Nama KUA</label><input class="form-control" name="kua" value="${esc(old.kua || "")}"></div>` +
    `<div class="col-md-6"><label class="form-label">Password ${username ? "(kosongkan jika tidak diganti)" : ""}</label><input class="form-control" name="password" type="password" ${username ? "" : "required"} minlength="10"></div>` +
    `<div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="active"><option value="true" ${old.active !== false ? "selected" : ""}>Aktif</option><option value="false" ${old.active === false ? "selected" : ""}>Nonaktif</option></select></div>`;
  $("#dataForm").dataset.key = "users";
  $("#dataForm").dataset.id = username;
  bootstrap.Modal.getOrCreateInstance($("#dataModal")).show();
}

async function init() {
  if (!token) return showLogin();
  try {
    let j = await api("me");
    me = j.user;
    showApp();
  } catch (e) {
    localStorage.removeItem("sip_token");
    token = "";
    showLogin();
  }
}

init();
window.openForm = openForm;
window.del = del;
window.exportCsv = exportCsv;
window.openUserForm = openUserForm;
