/**
 * ============================================================================
 *  SISTEM TERPADU KANTOR NOTARIS & PPAT - SYLVI YERIZA S.H., M.Kn
 *  Backend Tunggal (Code.gs) - Hasil penggabungan 3 aplikasi:
 *    1) Arsip Digital        (halaman: ?page=arsip)
 *    2) Pembukuan Kantor     (halaman: ?page=pembukuan)
 *    3) Pencatatan Sertifikat(halaman: ?page=sertifikat)
 *  Menu utama tampil bila parameter "page" kosong (halaman: ?page=menu)
 * ============================================================================
 */

/**
 * ============================================================================
 *  GERBANG KEAMANAN "EDIT SPREADSHEET" (berlaku untuk SEMUA modul)
 *  ID & Password serta URL spreadsheet asli sengaja HANYA disimpan di sini
 *  (server-side), TIDAK PERNAH dikirim ke browser kecuali verifikasi berhasil.
 *  Sehingga tidak bisa dilihat lewat "View Page Source" / DevTools browser.
 * ============================================================================
 */
const AKSES_SPREADSHEET_ID = "ADMIN";
const AKSES_SPREADSHEET_PASSWORD = "Bangkinang";

const PETA_URL_SPREADSHEET = {
  // Modul Arsip Digital
  "ARSIP_NOTARIS": "https://docs.google.com/spreadsheets/d/1vxuCTpiEEEsswE2t6YjZqxaegN50Apk3dQKo5Cw0VkI/edit",
  "ARSIP_PPAT": "https://docs.google.com/spreadsheets/d/1r8c-kd5jcYkZt-7ly1mn9GQzD_4lwHNbcrUBU0eCGrQ/edit",
  // Modul Pencatatan Sertifikat
  "SERTIFIKAT_MAIN": "https://docs.google.com/spreadsheets/d/1ACxiMQHeAfYziZ2I55FGbbi7xZ_PT3JvX-sBvvyUMO8/edit",
  // Modul Pembukuan Kantor
  "PEMBUKUAN_NOTARIS": "https://docs.google.com/spreadsheets/d/1Xu5yUGv2GD_D6KgkDoZGHMkZgK_mM9RdAsvRjWpaEfc/edit",
  "PEMBUKUAN_PPAT": "https://docs.google.com/spreadsheets/d/15IJKtirF6GJzcLtpUE7PjKmvGL-sYFRjGC4llOTBUuA/edit",
  "PEMBUKUAN_LEGALISASI": "https://docs.google.com/spreadsheets/d/1roFj881zgNB_GyIi302EolddClf3Jzj5Lgu4NABc5BQ/edit",
  "PEMBUKUAN_WAARMERKING": "https://docs.google.com/spreadsheets/d/1OfJk_U4sFm9j3frQGh-zoztIm6oPq9sspubWXaDBHGg/edit",
  "PEMBUKUAN_COVERNOTE": "https://docs.google.com/spreadsheets/d/1iTY9Ww71Tu-uFWZ7K_KMs0HQSaCrIK0tmFXgc5eJch0/edit",
  "PEMBUKUAN_KWITANSI": "https://docs.google.com/spreadsheets/d/1patQchmQDgsmV0TMEnOuwuRIEhPTQSFX9f1NtVHYBP4/edit",
  "PEMBUKUAN_BPN": "https://docs.google.com/spreadsheets/d/1XUWj5_uT-xMcG4vGEK2D7BO8Qa2xlkP_Vvgg1FrrK4c/edit",
  "PEMBUKUAN_ARSIP": "https://docs.google.com/spreadsheets/d/1fMy-7X5pukXVFTnOzsVPxCb7AzI_4IKBCGjeQz91WeI/edit",
  "PEMBUKUAN_SURAT_KELUAR": "https://docs.google.com/spreadsheets/d/1bOJvuhy6qgqL22cPTYsbMjYWLZUl7OG7mCE_0MEjXfE/edit",
  "PEMBUKUAN_DASHBOARD_SETTING": "https://docs.google.com/spreadsheets/d/14k8TIcJEkppJSOH1YnSfbhdxCX2XBh8DVfaz_MUqueo/edit"
};

/**
 * Dipanggil dari client (ketiga modul) sebelum membuka Spreadsheet untuk diedit.
 * Mengembalikan URL asli HANYA jika ID & Password benar.
 */
function verifikasiAksesSpreadsheet(idInput, passwordInput, keyIdentifier) {
  if (!idInput || !passwordInput) {
    return { success: false, message: "ID dan Password wajib diisi." };
  }
  const idOk = idInput.toString().trim().toUpperCase() === AKSES_SPREADSHEET_ID;
  const passwordOk = passwordInput.toString() === AKSES_SPREADSHEET_PASSWORD;

  if (!idOk || !passwordOk) {
    return { success: false, message: "ID atau Password salah. Akses ditolak." };
  }
  const url = PETA_URL_SPREADSHEET[keyIdentifier];
  if (!url) {
    return { success: false, message: "Spreadsheet untuk item ini tidak ditemukan." };
  }
  return { success: true, url: url };
}

/**
 * Verifikasi khusus untuk masuk ke halaman "Setup Admin" (tidak mengembalikan
 * URL spreadsheet apapun, hanya status boleh/tidaknya mengelola data setup).
 * Memakai kredensial ADMIN yang sama dengan gerbang "Edit Spreadsheet".
 */
function verifikasiAksesSetup(idInput, passwordInput) {
  if (!idInput || !passwordInput) {
    return { success: false, message: "ID dan Password wajib diisi." };
  }
  const idOk = idInput.toString().trim().toUpperCase() === AKSES_SPREADSHEET_ID;
  const passwordOk = passwordInput.toString() === AKSES_SPREADSHEET_PASSWORD;
  if (!idOk || !passwordOk) {
    return { success: false, message: "ID atau Password salah. Akses ditolak." };
  }
  return { success: true };
}

/**
 * ============================================================================
 *  HEADER TERPUSAT - SEMUA MODUL
 *  Dipakai lewat scriptlet <?!= include('PartialHeader', {...}); ?> di setiap
 *  file HTML modul (MenuUtama, HalamanArsip, HalamanPembukuan,
 *  HalamanSertifikat, HalamanSetup). Satu file sumber (PartialHeader.html)
 *  yang menentukan tampilan & struktur header di SELURUH modul, sehingga
 *  header tampil permanen dan identik di setiap halaman - hanya teks nama
 *  modul (judulHeader) yang berbeda per halaman.
 * ============================================================================
 */
function include(filename, data) {
  var tmpl = HtmlService.createTemplateFromFile(filename);
  if (data) {
    for (var key in data) {
      tmpl[key] = data[key];
    }
  }
  return tmpl.evaluate().getContent();
}

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page.toString().toLowerCase() : 'menu';

  // "title"       = judul tab browser (window.setTitle)
  // "headerTitle" = judul yang tampil di HEADER TERPUSAT (PartialHeader.html)
  //                 pada setiap modul. Inilah SATU-SATUNYA tempat nama header
  //                 per modul diatur - ubah di sini untuk mengubah nama header
  //                 yang tampil, tanpa perlu menyentuh file HTML modul manapun.
  var routes = {
    'menu':        { file: 'MenuUtama',        title: 'SISTEM TERPADU KANTOR NOTARIS & PPAT',              headerTitle: 'SISTEM TERPADU KANTOR NOTARIS / PPAT' },
    'arsip':       { file: 'HalamanArsip',      title: 'CATATAN ARSIP KANTOR NOTARIS/PPAT',                 headerTitle: 'PENCATATAN ARSIP KANTOR NOTARIS/PPAT' },
    'pembukuan':   { file: 'HalamanPembukuan',  title: 'PEMBUKUAN KANTOR NOTARIS/PPAT',                     headerTitle: 'PEMBUKUAN KANTOR NOTARIS/PPAT' },
    'sertifikat':  { file: 'HalamanSertifikat', title: 'PENCATATAN BERKAS SERTIFIKAT NOTARIS/PPAT v4.0',    headerTitle: 'PENCATATAN SERTIFIKAT KANTOR NOTARIS/PPAT' },
    'setup':       { file: 'HalamanSetup',      title: 'SETUP ADMIN - SISTEM NOTARIS/PPAT',                 headerTitle: 'SETUP ADMIN KANTOR NOTARIS/PPAT' }
  };

  var target = routes[page] || routes['menu'];

  // PENTING: Link navigasi antar halaman (Menu Utama <-> Modul) TIDAK BOLEH
  // memakai href relatif ("?page=arsip") karena Apps Script menyajikan
  // webapp lewat redirect/iframe internal yang membuat resolusi URL relatif
  // rusak (menghasilkan halaman putih kosong). Karena itu kita suntikkan
  // BASE_URL asli (dari ScriptApp) ke setiap halaman lewat template,
  // lalu semua link navigasi dibangun sebagai URL absolut.
  var baseUrl = ScriptApp.getService().getUrl();

  var template = HtmlService.createTemplateFromFile(target.file);
  template.baseUrl = baseUrl;
  template.judulHeader = target.headerTitle;

  return template.evaluate()
    .setTitle(target.title)
    .setFaviconUrl('https://www.gstatic.com/images/icons/material/system/2x/book_black_24dp.png')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}
/* ============================================================================
 *  MODUL 1 - ARSIP DIGITAL (dari file: ARSIP_KANTOR/Kode.gs)
 * ============================================================================
 */

/**
 * SISTEM MANAJEMEN ARSIP DIGITAL KANTOR NOTARIS & PPAT (V3.6 - REVISED FIXED)
 * Backend Logic - Google Apps Script (Kode.gs)
 */

const SPREADSHEET_CONFIG = {
  "NOTARIS": "1vxuCTpiEEEsswE2t6YjZqxaegN50Apk3dQKo5Cw0VkI",
  "PPAT": "1r8c-kd5jcYkZt-7ly1mn9GQzD_4lwHNbcrUBU0eCGrQ"
};

const SHEET_DATA = 'DataArsip';
const SHEET_SETUP = 'SETUP';

function getInitialAppData(jenisPembukuan) {
  try {
    if (!jenisPembukuan || jenisPembukuan === "undefined") {
      jenisPembukuan = "NOTARIS";
    }
    return {
      options: getDropdownOptions(jenisPembukuan),
      stats: getDashboardStatsArsip(jenisPembukuan),
      countsData: getFolderCountData(jenisPembukuan),
      allArsip: getAllArsip(jenisPembukuan),
      maxFolder: getMaxFolderNumber(jenisPembukuan)
    };
  } catch (error) {
    throw new Error("Gagal menginisialisasi data " + jenisPembukuan + ": " + error.toString());
  }
}

function getTargetSheet(jenisPembukuan, namaSheet) {
  const ssId = SPREADSHEET_CONFIG[jenisPembukuan];
  if (!ssId) throw new Error("Jenis pembukuan '" + jenisPembukuan + "' tidak terdaftar.");

  try {
    const ss = SpreadsheetApp.openById(ssId);
    let sheet = ss.getSheetByName(namaSheet);
    if (!sheet && namaSheet === SHEET_DATA) {
      sheet = ss.insertSheet(SHEET_DATA);
      initSheetStructure(sheet);
    }
    return sheet;
  } catch (error) {
    throw new Error("Gagal membuka Spreadsheet " + jenisPembukuan + ". Detail: " + error.toString());
  }
}

function initSheetStructure(sheet) {
  const headers = [
    "NO", "TAHUN", "JENIS AKTA", "NOMOR AKTA", "TANGGAL AKTA", 
    "PROSES DARI BANK/UMUM", "NAMA PIHAK/PENGHADAP", "KETERANGAN", "PENANGGUNG JAWAB", "NOMOR FOLDER",
    "KELENGKAPAN", "NAMA KARYAWAN", "WAKTU ENTRI"
  ];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
       .setFontWeight("bold")
       .setBackground("#1B3A6B")
       .setFontColor("#FFFFFF")
       .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

// Jumlah folder aktif per jenis pembukuan (default 50, bisa ditambah lewat fitur "Tambah Card Folder")
function getMaxFolderNumber(jenisPembukuan) {
  try {
    const props = PropertiesService.getScriptProperties();
    const key = "ARSIP_MAXFOLDER_" + jenisPembukuan;
    const stored = props.getProperty(key);
    return stored ? parseInt(stored, 10) : 50;
  } catch (e) {
    return 50;
  }
}

function tambahFolderBaruArsip(jenisPembukuan) {
  try {
    const props = PropertiesService.getScriptProperties();
    const key = "ARSIP_MAXFOLDER_" + jenisPembukuan;
    const current = getMaxFolderNumber(jenisPembukuan);
    const next = current + 1;
    props.setProperty(key, next.toString());

    const prefix = jenisPembukuan === "NOTARIS" ? "FNOT" : "FPPAT";
    const pad = next < 10 ? "0" + next : next.toString();
    const folderName = prefix + "-" + pad;

    return { success: true, maxFolder: next, folderName: folderName };
  } catch (error) {
    throw new Error("Gagal menambah folder baru: " + error.toString());
  }
}

function getDropdownOptions(jenisPembukuan) {
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_SETUP);
    if (!sheet) return { bankUmum: [], penanggungJawab: [], daftarFolder: [] };
    
    const bankUmumValues = sheet.getRange("A2:A20").getValues();
    const bankUmum = bankUmumValues.map(r => r[0].toString().trim()).filter(val => val !== "");
    
    const pjValues = sheet.getRange("C2:C7").getValues();
    const penanggungJawab = pjValues.map(r => r[0].toString().trim()).filter(val => val !== "");
    
    const folderValues = sheet.getRange("E2:E51").getValues();
    const daftarFolder = folderValues.map(r => r[0].toString().trim()).filter(val => val !== "");
    
    return { bankUmum, penanggungJawab, daftarFolder };
  } catch (error) {
    return { bankUmum: ["UMUM"], penanggungJawab: ["Staf"], daftarFolder: [] };
  }
}

function getAllArsip(jenisPembukuan) {
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_DATA);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
    return data.map((row, index) => {
      let tglStr = "";
      if (row[4]) {
        try {
          tglStr = Utilities.formatDate(new Date(row[4]), Session.getScriptTimeZone(), "yyyy-MM-dd");
        } catch(e) { tglStr = row[4].toString(); }
      }
      
      let waktuStr = "";
      if (row[12]) {
        try {
          waktuStr = Utilities.formatDate(new Date(row[12]), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        } catch(e) { waktuStr = row[12].toString(); }
      }

      return {
        rowNumber: index + 2,
        no: row[0],
        tahun: row[1],
        jenisAkta: row[2],
        nomorAkta: row[3],
        tanggalAkta: tglStr,
        prosesBankUmum: row[5],
        namaPihak: row[6],
        keterangan: row[7],
        penanggungJawab: row[8],
        nomorFolder: row[9] ? row[9].toString() : "",
        kelengkapan: row[10] ? row[10].toString() : "",
        namaKaryawan: row[11] || "",
        waktuEntri: waktuStr
      };
    });
  } catch (error) {
    return [];
  }
}

function tambahArsip(jenisPembukuan, data) {
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_DATA);
    
    const folderStr = data.nomorFolder || "";
    const match = folderStr.match(/\d+/);
    if (!match) throw new Error("Nomor Folder tidak valid! Harus berformat FNOT-XX atau FPPAT-XX.");
    const folderNum = parseInt(match[0], 10);
    
    const startRow = 2 + (folderNum - 1) * 50;
    const values = sheet.getRange(startRow, 1, 50, 13).getValues();
    let targetRow = -1;
    let maxNoUrut = 0;
    
    const totalLastRow = sheet.getLastRow();
    if (totalLastRow > 1) {
      const allNos = sheet.getRange(2, 1, totalLastRow - 1, 1).getValues();
      maxNoUrut = Math.max(...allNos.map(r => parseInt(r[0]) || 0));
    }

    for (let i = 0; i < 50; i++) {
      if (values[i][1] === "" && values[i][6] === "") {
        targetRow = startRow + i;
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error("Penyimpanan gagal! Folder " + folderStr + " sudah penuh (Maksimal 50 baris).");
    }
    
    const noUrut = maxNoUrut + 1;
    const tglAkta = data.tanggalAkta ? new Date(data.tanggalAkta) : "";
    const waktuEntri = new Date();
    const namaKaryawan = (data.namaKaryawan && data.namaKaryawan.toString().trim()) 
      ? data.namaKaryawan.toString().trim() 
      : (Session.getActiveUser().getEmail() || "System User");
    const kelengkapan = data.kelengkapan || "";
    
    const rowValues = [
      noUrut, data.tahun, data.jenisAkta, data.nomorAkta, tglAkta,
      data.prosesBankUmum, data.namaPihak, data.keterangan, data.penanggungJawab,
      folderStr, kelengkapan, namaKaryawan, waktuEntri
    ];
    
    sheet.getRange(targetRow, 1, 1, 13).setValues([rowValues]);
    return { success: true, message: "Data berhasil disimpan di " + folderStr + " dengan No Urut: " + noUrut };
  } catch (error) {
    throw new Error("Gagal menyimpan data: " + error.toString());
  }
}

function getFolderCountData(jenisPembukuan) {
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_DATA);
    const lastRow = sheet.getLastRow();
    const counts = {};
    const maxFolder = getMaxFolderNumber(jenisPembukuan);
    
    for (let i = 1; i <= maxFolder; i++) {
      const pad = i < 10 ? "0" + i : i;
      const fName = jenisPembukuan === "NOTARIS" ? "FNOT-" + pad : "FPPAT-" + pad;
      counts[fName] = 0;
    }
    
    if (lastRow > 1) {
      const dataFolder = sheet.getRange(2, 10, lastRow - 1, 1).getValues();
      dataFolder.forEach(r => {
        const fName = r[0] ? r[0].toString().trim() : "";
        if (counts.hasOwnProperty(fName)) counts[fName]++;
      });
    }
    return counts;
  } catch (e) {
    return {};
  }
}

function updateArsip(jenisPembukuan, rowNumber, data) {
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_DATA);
    const rNum = parseInt(rowNumber);
    
    const currentNo = sheet.getRange(rNum, 1).getValue().toString();
    if (currentNo !== data.oldNo.toString()) {
      throw new Error("Konflik Urutan Data: Baris bergeser. Silakan muat ulang halaman.");
    }
    
    const tglAkta = data.tanggalAkta ? new Date(data.tanggalAkta) : "";
    const waktuEntri = new Date();
    const namaKaryawan = (data.namaKaryawan && data.namaKaryawan.toString().trim())
      ? data.namaKaryawan.toString().trim()
      : (Session.getActiveUser().getEmail() || "System User");
    const kelengkapan = data.kelengkapan || "";
    
    const updateValues = [[
      data.oldNo, data.tahun, data.jenisAkta, data.nomorAkta, tglAkta,
      data.prosesBankUmum, data.namaPihak, data.keterangan, data.penanggungJawab,
      data.nomorFolder, kelengkapan, namaKaryawan, waktuEntri
    ]];
    
    sheet.getRange(rNum, 1, 1, 13).setValues(updateValues);
    return { success: true, message: "Data nomor " + data.oldNo + " berhasil diperbarui." };
  } catch (error) {
    throw new Error("Gagal memperbarui data: " + error.toString());
  }
}

function hapusArsip(jenisPembukuan, rowNumber, no) {
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_DATA);
    const rNum = parseInt(rowNumber);
    
    const currentNo = sheet.getRange(rNum, 1).getValue().toString();
    if (currentNo !== no.toString()) throw new Error("Konflik Data: Baris tidak cocok dengan nomor urut.");
    
    sheet.deleteRow(rNum);
    return { success: true, message: "Data nomor " + no + " berhasil dihapus." };
  } catch (error) {
    throw new Error("Gagal menghapus data: " + error.toString());
  }
}

function getDashboardStatsArsip(jenisPembukuan) {
  try {
    const allData = getAllArsip(jenisPembukuan);
    const totalBerkas = allData.length;
    const tahunIni = new Date().getFullYear().toString();
    let berkasTahunIni = 0;
    
    allData.forEach(item => {
      if (item.tahun && item.tahun.toString() === tahunIni) berkasTahunIni++;
    });
    
    return { totalBerkas, berkasTahunIni };
  } catch (error) {
    return { totalBerkas: 0, berkasTahunIni: 0 };
  }
}
/* ============================================================================
 *  MODUL 2 - PEMBUKUAN KANTOR (dari file: PEMBUKUAN_KANTOR_MOBILE/Kode.gs)
 * ============================================================================
 */

/**
 * SISTEM PEMBUKUAN KANTOR SYLVI YERIZA S.H., M.Kn
 * STATUS: FINAL OPTIMIZED WITH SURAT KELUAR
 */

const SS_MAP = {
  'NOTARIS': 'https://docs.google.com/spreadsheets/d/1Xu5yUGv2GD_D6KgkDoZGHMkZgK_mM9RdAsvRjWpaEfc/edit',
  'PPAT': 'https://docs.google.com/spreadsheets/d/15IJKtirF6GJzcLtpUE7PjKmvGL-sYFRjGC4llOTBUuA/edit',
  'LEGALISASI': 'https://docs.google.com/spreadsheets/d/1roFj881zgNB_GyIi302EolddClf3Jzj5Lgu4NABc5BQ/edit',
  'WAARMERKING': 'https://docs.google.com/spreadsheets/d/1OfJk_U4sFm9j3frQGh-zoztIm6oPq9sspubWXaDBHGg/edit',
  'COVERNOTE': 'https://docs.google.com/spreadsheets/d/1iTY9Ww71Tu-uFWZ7K_KMs0HQSaCrIK0tmFXgc5eJch0/edit',
  'KWITANSI': 'https://docs.google.com/spreadsheets/d/1patQchmQDgsmV0TMEnOuwuRIEhPTQSFX9f1NtVHYBP4/edit',
  'BPN': 'https://docs.google.com/spreadsheets/d/1XUWj5_uT-xMcG4vGEK2D7BO8Qa2xlkP_Vvgg1FrrK4c/edit',
  'ARSIP': 'https://docs.google.com/spreadsheets/d/1fMy-7X5pukXVFTnOzsVPxCb7AzI_4IKBCGjeQz91WeI/edit',
  'SURAT_KELUAR': 'https://docs.google.com/spreadsheets/d/1bOJvuhy6qgqL22cPTYsbMjYWLZUl7OG7mCE_0MEjXfE/edit'
};

const DASHBOARD_SS_ID = '14k8TIcJEkppJSOH1YnSfbhdxCX2XBh8DVfaz_MUqueo';

// 1. LOGIKA PENOMORAN (RESET BULANAN & TAHUNAN)
function getNextNumberOnly(type, subArsip, tanggalInput) {
  try {
    const d = tanggalInput ? new Date(tanggalInput) : new Date();
    const thnTarget = d.getFullYear();
    const blnTarget = d.getMonth();
    
    const ss = SpreadsheetApp.openByUrl(SS_MAP[type]);
    
    // Tentukan Nama Sheet
    let sheetName = (type === 'ARSIP') ? (subArsip || 'NOTARIS') : thnTarget.toString();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) return 1;

    let startRow = (type === 'ARSIP') ? 3 : 2;
    const lastR = getRealLastRow(sheet);
    
    if (lastR < startRow) return 1;

    // Ambil Kolom A (Nomor) dan Kolom B (Tanggal)
    const data = sheet.getRange(startRow, 1, (lastR - startRow) + 1, 2).getValues();
    let maxNum = 0;

    for (let i = 0; i < data.length; i++) {
      let num = parseInt(data[i][0]);
      let tglRaw = data[i][1];
      if (isNaN(num)) continue;

      let rowDate = (tglRaw instanceof Date) ? tglRaw : parseIndoDate(tglRaw);
      if (!rowDate) continue;

      // NOTARIS RESET TIAP BULAN
      if (type === 'NOTARIS') {
        if (rowDate.getMonth() === blnTarget && rowDate.getFullYear() === thnTarget) {
          if (num > maxNum) maxNum = num;
        }
      } 
      // ARSIP: Tidak reset
      else if (type === 'ARSIP') {
        if (num > maxNum) maxNum = num;
      } 
      // LAINNYA (Termasuk SURAT_KELUAR): RESET TIAP TAHUN
      else {
        if (rowDate.getFullYear() === thnTarget) {
          if (num > maxNum) maxNum = num;
        }
      }
    }
    return maxNum + 1;
  } catch (e) {
    console.log("Error getNextNumber: " + e.message);
    return 1;
  }
}

// 2. SUBMIT DATA
function submitData(type, formData) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_MAP[type]);
    const dateObj = new Date(formData.tanggal);
    const sheetName = (type === 'ARSIP') ? (formData.subArsip || 'NOTARIS') : dateObj.getFullYear().toString();
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    const sekarang = new Date();
    const waktuEntri = Utilities.formatDate(sekarang, "GMT+7", "EEEE, dd MMMM yyyy HH:mm:ss")
      .replace("Sunday", "Minggu")
      .replace("Monday", "Senin")
      .replace("Tuesday", "Selasa")
      .replace("Wednesday", "Rabu")
      .replace("Thursday", "Kamis")
      .replace("Friday", "Jumat")
      .replace("Saturday", "Sabtu");

    const idDays = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const idMonths = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    let finalDate = idDays[dateObj.getDay()] + ", " + dateObj.getDate() + " " + idMonths[dateObj.getMonth()] + " " + dateObj.getFullYear();
    
    let nextNo = getNextNumberOnly(type, formData.subArsip, formData.tanggal);
    
    let rowData;
    if (type === 'SURAT_KELUAR') {
      // Ditambahkan waktuEntri di akhir
      rowData = [nextNo, finalDate, formData.perihal, formData.namaKaryawan, waktuEntri];
    } else if (type === 'ARSIP') {
      // Ditambahkan waktuEntri di akhir
      rowData = [nextNo, formData.noAkta, formData.jenisAkta, finalDate, formData.penghadap.join(", "), formData.bank || "-", "TRUE/FALSE...", "", formData.namaKaryawan, waktuEntri];
    } else if (type === 'WAARMERKING' || type === 'LEGALISASI') {
      // --- LOGIKA KHUSUS BUKU WAARMERKING ---
      // Urutan: NO, HARI & TANGGAL (finalDate), JENIS AKTA, NAMA PENGHADAP, NAMA KARYAWAN, WAKTU ENTRI
      rowData = [
        nextNo,                         // Kolom A: NO
        finalDate,                      // Kolom B: HARI, TANGGAL (Digabung)
        formData.jenisAkta,             // Kolom C: JENIS AKTA
        formData.penghadap.join("\n"),  // Kolom D: NAMA PENGHADAP
        formData.namaKaryawan,          // Kolom E: NAMA KARYAWAN
        waktuEntri                      // Kolom F: WAKTU ENTRI
      ];
    } else {
      if (type === 'KWITANSI') {
        // 1. Ambil data nilai dan bersihkan titik agar jadi angka murni
        let nilaiBersih = formData.nilaiKwitansi ? formData.nilaiKwitansi.replace(/\./g, "") : 0;
        
        // 2. Susun RowData khusus Kwitansi (Nilai Kwitansi di Kolom F)
        rowData = [
          nextNo,                        // Kolom A
          finalDate,                     // Kolom B
          formData.jenisAkta,            // Kolom C
          formData.bank || "-",          // Kolom D
          formData.penghadap.join("\n"), // Kolom E
          Number(nilaiBersih),           // Kolom F (NILAI KWITANSI)
          formData.namaKaryawan,         // Kolom G (Bergeser)
          waktuEntri                     // Kolom H (Bergeser)
        ];
      } else {
        // Untuk tipe selain Kwitansi (Notaris, PPAT, dll) tetap gunakan format lama
        rowData = [
          nextNo,                        // Kolom A
          finalDate,                     // Kolom B
          formData.jenisAkta,            // Kolom C
          formData.bank || "-",          // Kolom D
          formData.penghadap.join("\n"), // Kolom E
          formData.namaKaryawan,         // Kolom F
          waktuEntri                     // Kolom G
        ];
      }
    }
    
    sheet.appendRow(rowData);

    // OPTIONAL: Otomatis set format mata uang di Spreadsheet untuk baris terakhir Kolom F
    if (type === 'KWITANSI') {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 6).setNumberFormat('#,##0'); 
    }
    
    return { 
      status: "success", 
      nomor: nextNo, 
      message: "Data Berhasil Disimpan dengan Nomor: " + nextNo 
    };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}

// 3. FUNGSI PEMBANTU (HELPERS)
function getRealLastRow(sheet) {
  const values = sheet.getRange("A:A").getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "" && values[i][0] !== null) return i + 1;
  }
  return 0; 
}

function getDashboardStats(tahun) {
  try {
    const ss = SpreadsheetApp.openById(DASHBOARD_SS_ID);
    const sheet = ss.getSheets()[0]; 
    sheet.getRange("B2").setValue(tahun);
    SpreadsheetApp.flush(); 

    const mapping = [
      { nama: "BUKU NOTARIS", sel: "B5", key: "NOTARIS" },
      { nama: "BUKU PPAT", sel: "B6", key: "PPAT" },
      { nama: "BUKU LEGALISASI", sel: "B8", key: "LEGALISASI" },
      { nama: "BUKU WAARMERKING", sel: "B7", key: "WAARMERKING" },
      { nama: "BUKU COVERNOTE", sel: "B10", key: "COVERNOTE" },
      { nama: "BUKU KWITANSI", sel: "B9", key: "KWITANSI" },
      { nama: "BUKU BERKAS BPN", sel: "B11", key: "BPN" },
      { nama: "SURAT KELUAR", sel: "B12", key: "SURAT_KELUAR" } // Tambahkan sel dashboard jika ada
    ];
    
    return JSON.stringify(mapping.map(item => ({ 
      namaBuku: item.nama, 
      total: sheet.getRange(item.sel).getValue() || 0, 
      key: item.key 
    })));
  } catch (e) { return "[]"; }
}

function getHistoryData(type, subArsip, tahunPilihan) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_MAP[type]);
    let sheet;
    if (type === 'ARSIP') {
      sheet = ss.getSheetByName(subArsip || 'NOTARIS');
    } else {
      sheet = ss.getSheetByName(tahunPilihan.toString()) || ss.getSheets()[0];
    }
    
    const lastRow = getRealLastRow(sheet);
    const headerRow = (type === 'ARSIP') ? 2 : 1;
    const startRow = (type === 'ARSIP') ? 3 : 2;
    
    const headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (lastRow < startRow) return { headers: headers, isi: [] };
    
    // Ambil data mentah
    const range = sheet.getRange(startRow, 1, (lastRow - startRow) + 1, sheet.getLastColumn());
    const data = range.getDisplayValues();

    // PETAKAN DATA: Tambahkan informasi nomor baris asli ke setiap baris
    const isiDenganBaris = data.map((r, index) => {
      return {
        isiBaris: r,
        nomorBarisAsli: startRow + index // Ini adalah kunci agar edit tidak salah baris
      };
    });

    return { 
      headers: headers, 
      isi: isiDenganBaris.reverse() // Dibalik agar data terbaru di atas
    };
  } catch (e) { 
    return { headers: [], isi: [] }; 
  }
}

function getJenisAktaOptions() {
  try {
    const ss = SpreadsheetApp.openById(DASHBOARD_SS_ID);
    return ss.getSheetByName("SETUP").getRange("E5:E17").getValues().flat().filter(String);
  } catch (e) { return ["AKTA JUAL BELI", "AKTA HIBAH"]; }
}

function getBankOptions(b) {
  try {
    const ss = SpreadsheetApp.openById(DASHBOARD_SS_ID);
    return ss.getSheetByName("SETUP").getRange("G5:G26").getValues().flat().filter(String);
  } catch (e) { return ["BNI", "BRI", "MANDIRI", "BTN"]; }
}

// PERBAIKAN FITUR CETAK: HANYA AREA YANG ADA DATA
function generatePDF(type, tahun, bulanPilihan) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_MAP[type]);
    const sheet = ss.getSheetByName(tahun.toString()) || ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    const maxRow = sheet.getMaxRows();
    
    // 1. Tampilkan semua baris dulu agar bersih
    sheet.showRows(1, maxRow);

    if (lastRow < 2) return { status: "error", message: "Tidak ada data di tahun ini." };

    // 2. Logika Filter: Jika user memilih bulan spesifik (bukan "ALL")
    if (bulanPilihan !== "ALL") {
      // Ambil data tanggal di kolom B (baris 2 sampai terakhir)
      const rangeTanggal = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      
      // Sembunyikan semua baris data terlebih dahulu
      sheet.hideRows(2, lastRow - 1);
      
      let adaData = false;
      for (let i = 0; i < rangeTanggal.length; i++) {
        let tglValue = rangeTanggal[i][0];
        let dateObj = null;

        // Validasi apakah cell berisi objek Date atau String
        if (tglValue instanceof Date) {
          dateObj = tglValue;
        } else if (typeof tglValue === 'string' && tglValue !== "") {
          // Fungsi bantu jika tanggal berupa string (contoh: "Senin, 01 April 2026")
          dateObj = parseIndoDate(tglValue); 
        }

        // Jika bulan cocok, tampilkan baris tersebut (i + 2 karena index mulai 0 dan data mulai baris 2)
        if (dateObj && dateObj.getMonth() == bulanPilihan) {
          sheet.showRows(i + 2);
          adaData = true;
        }
      }

      if (!adaData) {
        sheet.showRows(1, maxRow); // Kembalikan seperti semula
        return { status: "error", message: "Data pada bulan tersebut tidak ditemukan." };
      }
    }

    // 3. Sembunyikan sisa baris kosong yang ada di bawah lastRow agar PDF rapi
    if (maxRow > lastRow) {
      sheet.hideRows(lastRow + 1, maxRow - lastRow);
    }

    // Force update spreadsheet sebelum export
    SpreadsheetApp.flush();

    // 4. Generate URL PDF
    const ssId = ss.getId();
    const sheetId = sheet.getSheetId();
    const url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
      "?format=pdf&size=A4&portrait=false&fitw=true&gridlines=true&gid=" + sheetId +
      "&horizontal_alignment=CENTER&vertical_alignment=TOP" +
      "&fzr=true"; // fzr=true untuk mengulang header di setiap halaman

    return { status: "success", url: url };

  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}

// Fungsi Tambahan untuk menampilkan kembali semua baris
function showAllRows(type, tahun) {
  const ss = SpreadsheetApp.openByUrl(SS_MAP[type]);
  const sheet = ss.getSheetByName(tahun.toString());
  if (sheet) {
    sheet.showRows(1, sheet.getMaxRows());
  }
}

// Fungsi bantu jika kolom tanggal Anda bukan objek DATE murni
function parseIndoDate(str) {
  const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  for (let i = 0; i < bulanIndo.length; i++) {
    if (str.includes(bulanIndo[i])) {
      let parts = str.split(" ");
      let tgl = parts[1];
      let thn = parts[3];
      return new Date(thn, i, tgl);
    }
  }
  return null;
}

function updateDataUniversal(type, subArsip, rowNum, updatedRowData) {
  try {
    const ss = SpreadsheetApp.openByUrl(SS_MAP[type]);
    const sekarang = new Date();
    const tahunPilihan = sekarang.getFullYear().toString();
    
    let sheet;
    if (type === 'ARSIP') {
      sheet = ss.getSheetByName(subArsip || 'NOTARIS');
    } else {
      sheet = ss.getSheetByName(tahunPilihan) || ss.getSheets()[0];
    }

    const row = parseInt(rowNum);
    if (isNaN(row)) throw new Error("Baris tidak valid");

    // Langsung timpa baris tersebut dengan data baru dari form edit
    // Pastikan jumlah kolom updatedRowData sama dengan jumlah kolom di sheet
    sheet.getRange(row, 1, 1, updatedRowData.length).setValues([updatedRowData]);

    return { status: "success", message: "Data berhasil diperbarui!" };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}
/* ============================================================================
 *  MODUL 3 - PENCATATAN SERTIFIKAT (dari file: PENCATATAN_SERTIFIKAT/Kode.gs)
 * ============================================================================
 */

// ==================== KONFIGURASI UTAMA DATABASE SPREADSHEET ====================
const SPREADSHEET_ID = "1ACxiMQHeAfYziZ2I55FGbbi7xZ_PT3JvX-sBvvyUMO8"; 
const DRIVE_FOLDER_ID = "1Cm6Nzsv7TVDAyr1Yps3PHrBFk7aeBTan"; 

// Mengambil Daftar Bank & Data Dropdown SETUP
function INITIALIZE_APP_DATA() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    
    const listBank = sheets
      .map(s => s.getName())
      .filter(name => name !== "SETUP");
      
    const setupSheet = ss.getSheetByName("SETUP");
    let setupData = { jenisHak: [], proses: [], penanggungJawab: [] };
    
    if (setupSheet) {
      const lastRowH = _lastRowKolom(setupSheet, "H");
      const lastRowD = _lastRowKolom(setupSheet, "D");
      const lastRowF = _lastRowKolom(setupSheet, "F");
      setupData.jenisHak = lastRowH >= 2 ? setupSheet.getRange("H2:H" + lastRowH).getValues().flat().filter(String) : [];
      setupData.proses = lastRowD >= 2 ? setupSheet.getRange("D2:D" + lastRowD).getValues().flat().filter(String) : [];
      setupData.penanggungJawab = lastRowF >= 2 ? setupSheet.getRange("F2:F" + lastRowF).getValues().flat().filter(String) : [];
    }
    
    return { success: true, listBank: listBank, setupData: setupData };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Fitur Tambah Bank Baru
function tambahBankBaru(namaBankBaru) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const namaClean = namaBankBaru.toUpperCase().trim();
    
    if (ss.getSheetByName(namaClean)) {
      return { success: false, message: "Nama Bank/Sheet sudah terdaftar!" };
    }
    
    const newSheet = ss.insertSheet(namaClean);
    newSheet.appendRow([
      "NO", "TANGGAL TERIMA SERTIFIKAT", "NAMA DEBITUR", "NAMA PEMILIK SERTIFIKAT", 
      "NO HP", "JENIS HAK", "KECAMATAN", "KELURAHAN/DESA", 
      "NO SERTIFIKAT", "PROSES", "KETERANGAN", "PENANGGUNG JAWAB", "TANGGAL SELESAI", "LINK FILE"
    ]);
    return { success: true, message: "Bank " + namaClean + " berhasil ditambahkan!" };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Membaca Data Bank Sesuai Struktur Kolom
function getDataBank(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const values = sheet.getRange(2, 1, lastRow - 1, 14).getDisplayValues();
    return values.map(row => ({
      no: row[0],
      tanggalTerima: row[1],
      namaDebitur: row[2],
      namaPemilik: row[3],
      noHp: row[4],
      jenisHak: row[5],
      kecamatan: row[6],
      kelurahan: row[7],
      noSertifikat: row[8],
      proses: row[9],
      keterangan: row[10],
      penanggungJawab: row[11],
      tanggalSelesai: row[12],
      linkFile: row[13]
    }));
  } catch(e) {
    return [];
  }
}

// Pencarian GLOBAL lintas semua bank/sheet (dipakai di Dashboard modul Sertifikat).
// Menyapu semua sheet (kecuali SETUP) dan mengembalikan baris yang cocok,
// masing-masing ditandai nama bank/sheet asalnya.
function cariGlobalSertifikat(keyword) {
  try {
    if (!keyword || keyword.toString().trim() === "") return { success: true, hasil: [] };
    const kw = keyword.toString().trim().toLowerCase();

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets().filter(s => s.getName() !== "SETUP");
    const hasil = [];

    sheets.forEach(sheet => {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) return;
      const values = sheet.getRange(2, 1, lastRow - 1, 14).getDisplayValues();
      values.forEach(row => {
        const gabungan = row.join(" ").toLowerCase();
        if (gabungan.indexOf(kw) !== -1) {
          hasil.push({
            bankSheet: sheet.getName(),
            no: row[0],
            tanggalTerima: row[1],
            namaDebitur: row[2],
            namaPemilik: row[3],
            noHp: row[4],
            jenisHak: row[5],
            kecamatan: row[6],
            kelurahan: row[7],
            noSertifikat: row[8],
            proses: row[9],
            keterangan: row[10],
            penanggungJawab: row[11],
            tanggalSelesai: row[12],
            linkFile: row[13]
          });
        }
      });
    });

    return { success: true, hasil: hasil };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Cetak Laporan (per Card/Bank): mengekspor data ASLI pada sheet bank yang
// bersangkutan langsung dari Spreadsheet menjadi file PDF, dibatasi hanya
// kolom A sampai M (kolom N "LINK FILE" tidak ikut dicetak).
function exportLaporanSertifikatPDF(bankName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(bankName);
    if (!sheet) {
      return { success: false, message: "Sheet/Bank '" + bankName + "' tidak ditemukan." };
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, message: "Belum ada data pada bank ini untuk dicetak." };
    }
    const gid = sheet.getSheetId();

    const url = "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/export"
      + "?format=pdf"
      + "&gid=" + gid
      + "&range=A1:M" + lastRow
      + "&size=A4"
      + "&portrait=false"
      + "&fitw=true"
      + "&top_margin=0.4&bottom_margin=0.4&left_margin=0.3&right_margin=0.3"
      + "&sheetnames=false&printtitle=false&pagenumbers=false"
      + "&gridlines=true"
      + "&fzr=true";

    const token = ScriptApp.getOAuthToken();
    const response = UrlFetchApp.fetch(url, {
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      return { success: false, message: "Gagal membuat PDF dari Spreadsheet (kode " + response.getResponseCode() + ")." };
    }

    const namaFileBersih = bankName.toString().trim().replace(/[^a-zA-Z0-9]+/g, "_");
    const blob = response.getBlob().setName("Laporan_" + namaFileBersih + ".pdf");
    const base64 = Utilities.base64Encode(blob.getBytes());

    return {
      success: true,
      base64: base64,
      fileName: "Laporan_" + namaFileBersih + ".pdf",
      mimeType: "application/pdf"
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * ============================================================================
 *  MODUL 4 - SETUP ADMIN (halaman: ?page=setup)
 *  Semua fungsi di bawah ini WAJIB divalidasi ulang dengan ID & Password Admin
 *  (kredensial sama dengan gerbang "Edit Spreadsheet") sebelum melakukan
 *  perubahan apapun, sebagai lapisan keamanan kedua selain gerbang saat
 *  membuka halaman Setup.
 * ============================================================================
 */
function _cekAdmin(idAdmin, pwAdmin) {
  return (idAdmin || "").toString().trim().toUpperCase() === AKSES_SPREADSHEET_ID
      && (pwAdmin || "").toString() === AKSES_SPREADSHEET_PASSWORD;
}
const _PESAN_AKSES_DITOLAK = "Akses ditolak. ID/Password Admin salah atau sesi kedaluwarsa, silakan masuk ulang.";

// ---------- 4.1 KELOLA DAFTAR BANK (MODUL SERTIFIKAT) ----------

function getDaftarBankSetup(idAdmin, pwAdmin) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets().filter(s => s.getName() !== "SETUP");
    const daftar = sheets.map(s => ({
      nama: s.getName(),
      jumlahData: Math.max(s.getLastRow() - 1, 0)
    }));
    return { success: true, daftar: daftar };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function tambahBankSetup(idAdmin, pwAdmin, namaBankBaru) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  if (!namaBankBaru || namaBankBaru.toString().trim() === "") {
    return { success: false, message: "Nama Bank tidak boleh kosong." };
  }
  if (namaBankBaru.toString().trim().toUpperCase() === "SETUP") {
    return { success: false, message: "Nama 'SETUP' adalah nama khusus sistem dan tidak boleh dipakai." };
  }
  return tambahBankBaru(namaBankBaru);
}

// Menghapus sheet/bank. Jika masih ada data dan force belum true, akan
// menolak dan meminta konfirmasi ulang dari admin (dua langkah).
function hapusBankSertifikat(idAdmin, pwAdmin, namaBank, force) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const namaClean = namaBank.toString().trim().toUpperCase();
    if (namaClean === "SETUP") {
      return { success: false, message: "Sheet SETUP tidak boleh dihapus." };
    }
    const sheet = ss.getSheetByName(namaClean);
    if (!sheet) {
      return { success: false, message: "Bank/Sheet '" + namaClean + "' tidak ditemukan." };
    }
    const jumlahData = Math.max(sheet.getLastRow() - 1, 0);
    if (jumlahData > 0 && !force) {
      return { success: false, needForce: true, jumlahData: jumlahData, message: "Bank ini masih memiliki " + jumlahData + " data." };
    }
    if (ss.getSheets().length <= 1) {
      return { success: false, message: "Tidak bisa menghapus, minimal harus ada 1 sheet bank yang tersisa." };
    }
    ss.deleteSheet(sheet);
    return { success: true, message: "Bank '" + namaClean + "' berhasil dihapus." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ---------- 4.2 KELOLA DROPDOWN SERTIFIKAT (Jenis Hak / Proses / PJ) ----------

function _kolomDropdownSetup(jenis) {
  const map = { jenisHak: "H", proses: "D", penanggungJawab: "F" };
  return map[jenis] || null;
}

// Cari baris terakhir yang terisi KHUSUS pada satu kolom tertentu (bukan
// getLastRow() satu sheet, karena kolom D/F/H punya panjang daftar berbeda).
function _lastRowKolom(sheet, kolom) {
  const maxRows = sheet.getMaxRows();
  const values = sheet.getRange(kolom + "1:" + kolom + maxRows).getValues();
  let last = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] !== "" && values[i][0] !== null) last = i + 1;
  }
  return last;
}

function getSetupDropdownSertifikat(idAdmin, pwAdmin) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("SETUP");
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    function bacaKolom(kolom) {
      const lastRow = _lastRowKolom(sheet, kolom);
      if (lastRow < 2) return [];
      return sheet.getRange(kolom + "2:" + kolom + lastRow).getValues().flat().filter(String);
    }

    return {
      success: true,
      jenisHak: bacaKolom("H"),
      proses: bacaKolom("D"),
      penanggungJawab: bacaKolom("F")
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function tambahDropdownSertifikat(idAdmin, pwAdmin, jenis, nilai) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const kolom = _kolomDropdownSetup(jenis);
    if (!kolom) return { success: false, message: "Jenis dropdown tidak dikenali." };
    nilai = (nilai || "").toString().trim();
    if (!nilai) return { success: false, message: "Nilai tidak boleh kosong." };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("SETUP");
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    const lastRow = _lastRowKolom(sheet, kolom);
    const existing = lastRow >= 2 ? sheet.getRange(kolom + "2:" + kolom + lastRow).getValues().flat().filter(String) : [];
    if (existing.some(v => v.toString().trim().toUpperCase() === nilai.toUpperCase())) {
      return { success: false, message: "Data sudah ada dalam daftar." };
    }

    const targetRow = Math.max(lastRow, 1) + 1;
    sheet.getRange(kolom + targetRow).setValue(nilai);
    return { success: true, message: "Berhasil ditambahkan." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function hapusDropdownSertifikat(idAdmin, pwAdmin, jenis, nilai) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const kolom = _kolomDropdownSetup(jenis);
    if (!kolom) return { success: false, message: "Jenis dropdown tidak dikenali." };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("SETUP");
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    const lastRow = _lastRowKolom(sheet, kolom);
    if (lastRow < 2) return { success: false, message: "Data tidak ditemukan." };

    const values = sheet.getRange(kolom + "2:" + kolom + lastRow).getValues().flat();
    const nilaiCari = (nilai || "").toString().trim().toUpperCase();
    const filtered = values.filter(v => v.toString().trim().toUpperCase() !== nilaiCari);

    if (filtered.length === values.length) {
      return { success: false, message: "Data tidak ditemukan dalam daftar." };
    }

    sheet.getRange(kolom + "2:" + kolom + lastRow).clearContent();
    if (filtered.length > 0) {
      sheet.getRange(kolom + "2:" + kolom + (1 + filtered.length)).setValues(filtered.map(v => [v]));
    }
    return { success: true, message: "Berhasil dihapus." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ---------- 4.2b KELOLA DROPDOWN ARSIP (Bank Umum / Penanggung Jawab) ----------
// Catatan: Arsip punya spreadsheet terpisah per jenis buku (NOTARIS/PPAT), jadi
// setiap fungsi di bawah menerima parameter "jenisPembukuan" untuk menentukan
// spreadsheet mana yang dibuka (memakai getTargetSheet yang sudah ada).

function _kolomDropdownArsip(jenis) {
  const map = { bankUmum: "A", penanggungJawab: "C" };
  return map[jenis] || null;
}

function getSetupDropdownArsip(idAdmin, pwAdmin, jenisPembukuan) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const sheet = getTargetSheet(jenisPembukuan, SHEET_SETUP);
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    function bacaKolom(kolom) {
      const lastRow = _lastRowKolom(sheet, kolom);
      if (lastRow < 2) return [];
      return sheet.getRange(kolom + "2:" + kolom + lastRow).getValues().flat().filter(String);
    }

    return {
      success: true,
      bankUmum: bacaKolom("A"),
      penanggungJawab: bacaKolom("C")
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function tambahDropdownArsip(idAdmin, pwAdmin, jenisPembukuan, jenis, nilai) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const kolom = _kolomDropdownArsip(jenis);
    if (!kolom) return { success: false, message: "Jenis dropdown tidak dikenali." };
    nilai = (nilai || "").toString().trim();
    if (!nilai) return { success: false, message: "Nilai tidak boleh kosong." };

    const sheet = getTargetSheet(jenisPembukuan, SHEET_SETUP);
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    const lastRow = _lastRowKolom(sheet, kolom);
    const existing = lastRow >= 2 ? sheet.getRange(kolom + "2:" + kolom + lastRow).getValues().flat().filter(String) : [];
    if (existing.some(v => v.toString().trim().toUpperCase() === nilai.toUpperCase())) {
      return { success: false, message: "Data sudah ada dalam daftar." };
    }

    const targetRow = Math.max(lastRow, 1) + 1;
    sheet.getRange(kolom + targetRow).setValue(nilai);
    return { success: true, message: "Berhasil ditambahkan." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function hapusDropdownArsip(idAdmin, pwAdmin, jenisPembukuan, jenis, nilai) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const kolom = _kolomDropdownArsip(jenis);
    if (!kolom) return { success: false, message: "Jenis dropdown tidak dikenali." };

    const sheet = getTargetSheet(jenisPembukuan, SHEET_SETUP);
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    const lastRow = _lastRowKolom(sheet, kolom);
    if (lastRow < 2) return { success: false, message: "Data tidak ditemukan." };

    const values = sheet.getRange(kolom + "2:" + kolom + lastRow).getValues().flat();
    const nilaiCari = (nilai || "").toString().trim().toUpperCase();
    const filtered = values.filter(v => v.toString().trim().toUpperCase() !== nilaiCari);

    if (filtered.length === values.length) {
      return { success: false, message: "Data tidak ditemukan dalam daftar." };
    }

    sheet.getRange(kolom + "2:" + kolom + lastRow).clearContent();
    if (filtered.length > 0) {
      sheet.getRange(kolom + "2:" + kolom + (1 + filtered.length)).setValues(filtered.map(v => [v]));
    }
    return { success: true, message: "Berhasil dihapus." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ---------- 4.2c KELOLA DROPDOWN PEMBUKUAN (Jenis Akta / Bank) ----------
// Catatan: sumber data dropdown Pembukuan berada di sheet "SETUP" pada
// spreadsheet Dashboard (DASHBOARD_SS_ID), kolom E (Jenis Akta) & G (Bank),
// dengan daftar dimulai dari baris ke-5 (baris 1-4 dipakai untuk judul/label).

function _kolomDropdownPembukuan(jenis) {
  const map = { jenisAkta: "E", bank: "G" };
  return map[jenis] || null;
}

function getSetupDropdownPembukuan(idAdmin, pwAdmin) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const ss = SpreadsheetApp.openById(DASHBOARD_SS_ID);
    const sheet = ss.getSheetByName("SETUP");
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    function bacaKolom(kolom) {
      const lastRow = _lastRowKolom(sheet, kolom);
      if (lastRow < 5) return [];
      return sheet.getRange(kolom + "5:" + kolom + lastRow).getValues().flat().filter(String);
    }

    return {
      success: true,
      jenisAkta: bacaKolom("E"),
      bank: bacaKolom("G")
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function tambahDropdownPembukuan(idAdmin, pwAdmin, jenis, nilai) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const kolom = _kolomDropdownPembukuan(jenis);
    if (!kolom) return { success: false, message: "Jenis dropdown tidak dikenali." };
    nilai = (nilai || "").toString().trim();
    if (!nilai) return { success: false, message: "Nilai tidak boleh kosong." };

    const ss = SpreadsheetApp.openById(DASHBOARD_SS_ID);
    const sheet = ss.getSheetByName("SETUP");
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    const lastRow = _lastRowKolom(sheet, kolom);
    const existing = lastRow >= 5 ? sheet.getRange(kolom + "5:" + kolom + lastRow).getValues().flat().filter(String) : [];
    if (existing.some(v => v.toString().trim().toUpperCase() === nilai.toUpperCase())) {
      return { success: false, message: "Data sudah ada dalam daftar." };
    }

    const targetRow = Math.max(lastRow, 4) + 1;
    sheet.getRange(kolom + targetRow).setValue(nilai);
    return { success: true, message: "Berhasil ditambahkan." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function hapusDropdownPembukuan(idAdmin, pwAdmin, jenis, nilai) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    const kolom = _kolomDropdownPembukuan(jenis);
    if (!kolom) return { success: false, message: "Jenis dropdown tidak dikenali." };

    const ss = SpreadsheetApp.openById(DASHBOARD_SS_ID);
    const sheet = ss.getSheetByName("SETUP");
    if (!sheet) return { success: false, message: "Sheet SETUP tidak ditemukan." };

    const lastRow = _lastRowKolom(sheet, kolom);
    if (lastRow < 5) return { success: false, message: "Data tidak ditemukan." };

    const values = sheet.getRange(kolom + "5:" + kolom + lastRow).getValues().flat();
    const nilaiCari = (nilai || "").toString().trim().toUpperCase();
    const filtered = values.filter(v => v.toString().trim().toUpperCase() !== nilaiCari);

    if (filtered.length === values.length) {
      return { success: false, message: "Data tidak ditemukan dalam daftar." };
    }

    sheet.getRange(kolom + "5:" + kolom + lastRow).clearContent();
    if (filtered.length > 0) {
      sheet.getRange(kolom + "5:" + kolom + (4 + filtered.length)).setValues(filtered.map(v => [v]));
    }
    return { success: true, message: "Berhasil dihapus." };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// ---------- 4.3 KELOLA DAFTAR KARYAWAN (whitelist login Menu Utama) ----------

const _PROP_KEY_KARYAWAN = "DAFTAR_KARYAWAN_DIIZINKAN";
const _DEFAULT_KARYAWAN = ["RAIHAN", "WIRDA", "ARMAN", "ARMANSYAH", "DICKY", "DINDA", "WARI"];

// Dipanggil PUBLIK (tanpa ID/Password) dari Menu Utama untuk memvalidasi nama
// karyawan saat login pertama kali. Ini setara dengan whitelist yang dulunya
// hardcode di client, jadi tidak menambah risiko baru, namun sekarang bisa
// dikelola Admin lewat halaman Setup tanpa harus mengedit kode.
function getDaftarKaryawan() {
  try {
    const props = PropertiesService.getScriptProperties();
    const raw = props.getProperty(_PROP_KEY_KARYAWAN);
    let daftar;
    if (raw) {
      daftar = JSON.parse(raw);
    } else {
      daftar = _DEFAULT_KARYAWAN.slice();
      props.setProperty(_PROP_KEY_KARYAWAN, JSON.stringify(daftar));
    }
    return { success: true, daftar: daftar };
  } catch (err) {
    return { success: false, message: err.toString(), daftar: _DEFAULT_KARYAWAN.slice() };
  }
}

function getDaftarKaryawanSetup(idAdmin, pwAdmin) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  return getDaftarKaryawan();
}

function tambahKaryawan(idAdmin, pwAdmin, nama) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    nama = (nama || "").toString().trim().toUpperCase();
    if (nama.length < 2) return { success: false, message: "Nama minimal 2 huruf." };

    const props = PropertiesService.getScriptProperties();
    const res = getDaftarKaryawan();
    let daftar = res.daftar || [];
    if (daftar.indexOf(nama) !== -1) return { success: false, message: "Nama sudah terdaftar." };

    daftar.push(nama);
    props.setProperty(_PROP_KEY_KARYAWAN, JSON.stringify(daftar));
    return { success: true, message: "Karyawan '" + nama + "' berhasil ditambahkan.", daftar: daftar };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function hapusKaryawan(idAdmin, pwAdmin, nama) {
  if (!_cekAdmin(idAdmin, pwAdmin)) return { success: false, message: _PESAN_AKSES_DITOLAK };
  try {
    nama = (nama || "").toString().trim().toUpperCase();
    const props = PropertiesService.getScriptProperties();
    const res = getDaftarKaryawan();
    let daftar = res.daftar || [];
    const idx = daftar.indexOf(nama);
    if (idx === -1) return { success: false, message: "Nama tidak ditemukan dalam daftar." };
    if (daftar.length <= 1) return { success: false, message: "Tidak bisa menghapus, minimal harus ada 1 karyawan tersisa." };

    daftar.splice(idx, 1);
    props.setProperty(_PROP_KEY_KARYAWAN, JSON.stringify(daftar));
    return { success: true, message: "Karyawan '" + nama + "' berhasil dihapus.", daftar: daftar };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// LOGIKA UPLOAD FILE TERKOMPRES KE GOOGLE DRIVE
function uploadMultipleFiles(filesArr, debiturName, pemilikName) {
  if (!filesArr || filesArr.length === 0) return "";

  var urlLinks = [];
  var errorLog = [];
  var parentFolder;
  var targetFolder;

  try {
    parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (e) {
    throw new Error("Folder induk Drive tidak dapat diakses: " + e.toString());
  }

  var cleanDebitur = (debiturName || "TANPA NAMA DEBITUR").toString().toUpperCase().trim();
  var subFolderName = cleanDebitur;

  var subFolders = parentFolder.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    targetFolder = subFolders.next();
  } else {
    targetFolder = parentFolder.createFolder(subFolderName);
  }

  for (var i = 0; i < filesArr.length; i++) {
    try {
      var fileData = filesArr[i];
      if (!fileData || !fileData.base64) {
        errorLog.push("File ke-" + (i + 1) + " tidak memiliki data (base64 kosong).");
        continue;
      }

      var splitData = fileData.base64.split(",");
      if (splitData.length < 2) {
        errorLog.push("File ke-" + (i + 1) + " format Base64 tidak valid.");
        continue;
      }
      var contentType = splitData[0].split(":")[1].split(";")[0];
      var base64Data = splitData[1];

      var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, fileData.fileName);
      var file = targetFolder.createFile(blob);

      var namaAsliFile = fileData.fileName || file.getName();
      urlLinks.push(namaAsliFile + "::" + file.getUrl());

      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErrAny) {
        try {
          file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErrDomain) {
          Logger.log("Sharing dibatasi kebijakan Workspace untuk file " + fileData.fileName);
        }
      }
    } catch (errFile) {
      errorLog.push("File ke-" + (i + 1) + " gagal diunggah: " + errFile.toString());
    }
  }

  if (urlLinks.length === 0 && errorLog.length > 0) {
    throw new Error("Semua file gagal diunggah. Detail: " + errorLog.join(" | "));
  }

  return urlLinks.join(", ");
}

// Simpan Entri Baru Sesuai Pemetaan Kolom A-N
function simpanEntriBaru(sheetName, data, filesArr) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    
    let nextId = 1;
    if (lastRow > 1) {
      const lastId = parseInt(sheet.getRange(lastRow, 1).getValue());
      if (!isNaN(lastId)) nextId = lastId + 1;
    }
    
    let fileUrlsString = "";
    let warningMessage = "";
    try {
      fileUrlsString = uploadMultipleFiles(filesArr, data.namaDebitur, data.namaPemilik);
    } catch (uploadErr) {
      warningMessage = "PERHATIAN: Data tersimpan, namun file GAGAL diunggah. Detail: " + uploadErr.toString();
    }
    
    sheet.appendRow([
      nextId,
      data.tanggalTerima,
      data.namaDebitur,
      data.namaPemilik,
      data.noHp,
      data.jenisHak,
      data.kecamatan,
      data.kelurahan,
      data.noSertifikat,
      data.proses,
      data.keterangan,
      data.penanggungJawab,
      "",
      fileUrlsString
    ]);
    
    if (data.proses === "Selesai") {
      const resSelesai = setBerkasSelesai(sheetName, nextId);
      if (warningMessage) resSelesai.message = warningMessage;
      return resSelesai;
    }
    
    return { success: true, message: warningMessage || "DATA BERHASIL TERSIMPAN" };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Update Edit Data Entri
function updateDataEntri(sheetName, idBerkas, data, filesArr, existingLinksArr) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    const dataId = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    let rowIndex = -1;
    for (let i = 0; i < dataId.length; i++) {
      if (dataId[i][0].toString() === idBerkas.toString()) {
        rowIndex = i + 2;
        break;
      }
    }
    
    if (rowIndex === -1) throw new Error("Data tidak ditemukan.");
    
    sheet.getRange(rowIndex, 2).setValue(data.tanggalTerima);
    sheet.getRange(rowIndex, 3).setValue(data.namaDebitur);
    sheet.getRange(rowIndex, 4).setValue(data.namaPemilik);
    sheet.getRange(rowIndex, 5).setValue(data.noHp);
    sheet.getRange(rowIndex, 6).setValue(data.jenisHak);
    sheet.getRange(rowIndex, 7).setValue(data.kecamatan);
    sheet.getRange(rowIndex, 8).setValue(data.kelurahan);
    sheet.getRange(rowIndex, 9).setValue(data.noSertifikat);
    sheet.getRange(rowIndex, 10).setValue(data.proses);
    sheet.getRange(rowIndex, 11).setValue(data.keterangan);
    sheet.getRange(rowIndex, 12).setValue(data.penanggungJawab);
    
    if (data.proses === "Selesai") {
      sheet.getRange(rowIndex, 13).setValue(Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm"));
    }
    
    let finalLinksList = Array.isArray(existingLinksArr) ? existingLinksArr : [];
    var warningMessage = "";

    if (filesArr && filesArr.length > 0) {
      try {
        let newUrlsString = uploadMultipleFiles(filesArr, data.namaDebitur, data.namaPemilik);
        if (newUrlsString) {
          let newLinksArray = newUrlsString.split(/,\s*/).filter(String);
          finalLinksList = finalLinksList.concat(newLinksArray);
        }
      } catch (uploadErr) {
        warningMessage = "PERHATIAN: Perubahan tersimpan, namun file baru GAGAL diunggah. Detail: " + uploadErr.toString();
      }
    }
    
    sheet.getRange(rowIndex, 14).setValue(finalLinksList.join(", "));
    
    if (data.proses === "Selesai") {
      const resSelesai = setBerkasSelesai(sheetName, idBerkas);
      if (typeof warningMessage !== "undefined" && warningMessage) resSelesai.message = warningMessage;
      return resSelesai;
    }
    
    return { success: true, message: (typeof warningMessage !== "undefined" && warningMessage) ? warningMessage : "DATA BERHASIL PERBAHARUI DAN TERSIMPAN" };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

// Logika Pemindahan Otomatis Ke Sheet "BERKAS SELESAI"
function setBerkasSelesai(sheetName, id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const srcSheet = ss.getSheetByName(sheetName);
    let targetSheet = ss.getSheetByName("BERKAS SELESAI");
    
    if (!targetSheet) {
      targetSheet = ss.insertSheet("BERKAS SELESAI");
      targetSheet.appendRow([
        "NO", "TANGGAL TERIMA SERTIFIKAT", "NAMA DEBITUR", "NAMA PEMILIK SERTIFIKAT", 
        "NO HP WHATSAPP", "JENIS HAK", "KECAMATAN", "KELURAHAN/DESA", 
        "NOMOR SERTIFIKAT", "STATUS PROSES BERKAS", "BANK/UMUM", 
        "PENANGGUNG JAWAB", "TANGGAL SELESAI", "LINK FILE"
      ]);
    }
    
    const data = srcSheet.getDataRange().getValues();
    let targetRowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id.toString()) {
        targetRowIndex = i + 1;
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return { success: false, message: "Data berkas tidak ditemukan." };
    }
    
    const rowValues = srcSheet.getRange(targetRowIndex, 1, 1, 14).getValues()[0];
    const tglSelesaiFormatted = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm");
    
    const targetRowData = [
      rowValues[0],          
      rowValues[1],          
      rowValues[2],          
      rowValues[3],          
      rowValues[4],          
      rowValues[5],          
      rowValues[6],          
      rowValues[7],          
      rowValues[8],          
      "Selesai",             
      sheetName,
      rowValues[11],         
      tglSelesaiFormatted,   
      rowValues[13]          
    ];
    
    targetSheet.appendRow(targetRowData);
    srcSheet.deleteRow(targetRowIndex); 
    
    return { success: true, message: "Berkas Berhasil Diselesaikan!" };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}