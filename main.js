// main.js

// Array global untuk menyimpan semua objek buku
let books = [];

// Kunci untuk localStorage
const STORAGE_KEY = 'BOOKSHELF_APPS';

// ===============================
// Fungsi Utilitas Local Storage
// ===============================

// Fungsi untuk memeriksa apakah localStorage didukung oleh browser
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser Anda tidak mendukung Local Storage');
    return false;
  }
  return true;
}

// Fungsi untuk menyimpan data buku ke localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

// Fungsi untuk memuat data buku dari localStorage
function loadDataFromStorage() {
  if (isStorageExist()) {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      books = data;
    }
  }
}

// ===============================
// Fungsi Data Buku
// ===============================

// Fungsi untuk membuat objek buku baru
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id: id,
    title: title,
    author: author,
    year: year,
    isComplete: isComplete
  };
}

// Fungsi untuk menemukan buku berdasarkan ID
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// Fungsi untuk menemukan indeks buku berdasarkan ID
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return parseInt(index); // Pastikan ini adalah number
    }
  }
  return -1;
}

// ===============================
// Fungsi Render dan Manipulasi DOM
// ===============================

// Fungsi untuk membuat elemen HTML untuk satu buku
function makeBookItem(bookObject) {
  const {
    id,
    title,
    author,
    year,
    isComplete
  } = bookObject;

  const bookItemContainer = document.createElement('div');
  bookItemContainer.setAttribute('data-bookid', id);
  bookItemContainer.setAttribute('data-testid', 'bookItem');

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = title;

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${year}`;

  const buttonContainer = document.createElement('div');

  // Tombol untuk mengubah kondisi buku (selesai/belum selesai)
  const completeButton = document.createElement('button');
  completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  completeButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  completeButton.addEventListener('click', () => toggleBookStatus(id));

  // Tombol untuk menghapus buku
  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus buku';
  deleteButton.addEventListener('click', () => deleteBook(id));

  // Tombol untuk mengedit buku (fitur opsional)
  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit buku';
  editButton.addEventListener('click', () => openEditForm(id));

  buttonContainer.append(completeButton, deleteButton, editButton);
  bookItemContainer.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  return bookItemContainer;
}

// Fungsi untuk merender semua buku ke rak yang sesuai
function renderBooks(filteredBooks = books) {
  // Mengambil referensi elemen rak buku dari DOM
  const incompleteBookshelf = document.getElementById('incompleteBookList');
  const completeBookshelf = document.getElementById('completeBookList');

  // Penting: Pastikan elemen rak ada sebelum membersihkan/menambahkan
  if (!incompleteBookshelf || !completeBookshelf) {
    console.error("Elemen rak buku (incompleteBookList atau completeBookList) tidak ditemukan di DOM. Periksa ID di index.html.");
    return; // Hentikan fungsi jika elemen tidak ditemukan
  }

  // Bersihkan rak sebelum merender ulang untuk menghindari duplikasi
  incompleteBookshelf.innerHTML = '';
  completeBookshelf.innerHTML = '';

  // Iterasi melalui daftar buku (bisa buku lengkap atau hasil filter pencarian)
  for (const book of filteredBooks) {
    const bookElement = makeBookItem(book); // Buat elemen HTML untuk setiap buku
    if (book.isComplete) {
      completeBookshelf.append(bookElement); // Tambahkan ke rak 'Selesai dibaca'
    } else {
      incompleteBookshelf.append(bookElement); // Tambahkan ke rak 'Belum selesai dibaca'
    }
  }
}

// ===============================
// Fungsi Aksi Buku (Tambah, Pindah, Hapus, Edit)
// ===============================

// Fungsi untuk menambahkan buku baru
function addBook() {
  // Mengambil nilai dari input form. Pastikan ID sesuai dengan index.html.
  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');

  // Validasi sederhana jika input null (harusnya tidak terjadi jika ID benar)
  if (!titleInput || !authorInput || !yearInput || !isCompleteCheckbox) {
      console.error("Salah satu input form (bookFormTitle, bookFormAuthor, bookFormYear, bookFormIsComplete) tidak ditemukan. Periksa ID di index.html.");
      return;
  }

  const id = Number(new Date()); // ID unik menggunakan timestamp
  const title = titleInput.value;
  const author = authorInput.value;
  const year = Number(yearInput.value); // Pastikan year adalah number
  const isComplete = isCompleteCheckbox.checked;

  const newBook = generateBookObject(id, title, author, year, isComplete);
  books.push(newBook); // Tambahkan buku baru ke array global

  saveData(); // Simpan array buku yang diperbarui ke localStorage
  renderBooks(); // Render ulang tampilan untuk menampilkan buku baru

  // Reset form setelah penambahan
  document.getElementById('bookForm').reset();
}

// Fungsi untuk memindahkan status buku (selesai dibaca / belum selesai dibaca)
function toggleBookStatus(bookId) {
  const bookTarget = findBook(bookId); // Cari buku berdasarkan ID

  if (bookTarget === null) return; // Jika buku tidak ditemukan, hentikan

  bookTarget.isComplete = !bookTarget.isComplete; // Balik status isComplete (true jadi false, false jadi true)
  saveData(); // Simpan perubahan ke localStorage
  renderBooks(); // Render ulang tampilan agar buku berpindah rak
}

// Fungsi untuk menghapus buku
function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId); // Cari indeks buku berdasarkan ID

  if (bookIndex === -1) return; // Jika buku tidak ditemukan, hentikan

  // Konfirmasi sebelum menghapus untuk mencegah penghapusan yang tidak disengaja
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    books.splice(bookIndex, 1); // Hapus buku dari array global
    saveData(); // Simpan array buku yang diperbarui ke localStorage
    renderBooks(); // Render ulang tampilan
  }
}

// ===============================
// Fungsi Fitur Opsional (Pencarian dan Edit Buku)
// ===============================

// Fungsi untuk mencari buku (Kriteria Opsional 1)
function searchBook() {
  const searchInput = document.getElementById('searchBookTitle');
  if (!searchInput) {
      console.error("Input pencarian dengan ID 'searchBookTitle' tidak ditemukan. Fitur pencarian tidak akan berfungsi.");
      return;
  }
  const searchTitle = searchInput.value.toLowerCase(); // Ambil teks pencarian dan ubah ke lowercase
  // Filter array buku berdasarkan judul yang mengandung teks pencarian
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTitle));
  renderBooks(filteredBooks); // Render hanya buku yang cocok dengan pencarian
}

// Fungsi untuk membuka formulir edit (Kriteria Opsional 2)
function openEditForm(bookId) {
  const bookToEdit = findBook(bookId);
  if (!bookToEdit) return; // Jika buku tidak ditemukan, hentikan

  // Mengambil referensi elemen form tambah buku
  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');
  const submitButton = document.getElementById('bookFormSubmit');
  const bookForm = document.getElementById('bookForm');

  // Validasi: Pastikan semua elemen form ditemukan
  if (!titleInput || !authorInput || !yearInput || !isCompleteCheckbox || !submitButton || !bookForm) {
      console.error("Salah satu elemen form untuk edit (misalnya bookFormTitle, bookFormSubmit) tidak ditemukan. Periksa ID di index.html.");
      return;
  }

  // Mengisi form dengan data buku yang akan diedit
  titleInput.value = bookToEdit.title;
  authorInput.value = bookToEdit.author;
  yearInput.value = bookToEdit.year;
  isCompleteCheckbox.checked = bookToEdit.isComplete;

  // Mengubah teks tombol submit untuk menunjukkan mode edit
  submitButton.innerHTML = `Perbarui Buku <span>${bookToEdit.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca'}</span>`;

  // Menyimpan ID buku yang sedang diedit di atribut data-editing-id pada form
  // Ini akan digunakan oleh event listener submit form untuk menentukan apakah ini tambah atau edit
  bookForm.setAttribute('data-editing-id', bookId);

  // Mengarahkan tampilan ke bagian atas halaman untuk memudahkan pengguna melakukan edit
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Fungsi untuk mengedit buku (bagian dari Kriteria Opsional 2)
function editBook(bookId) {
  const bookToEdit = findBook(bookId);
  if (!bookToEdit) return; // Jika buku tidak ditemukan, hentikan

  // Mengambil nilai terbaru dari input form setelah diedit pengguna
  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');

  // Validasi: Pastikan semua input ditemukan
  if (!titleInput || !authorInput || !yearInput || !isCompleteCheckbox) {
      console.error("Salah satu input form (bookFormTitle, bookFormAuthor, bookFormYear, bookFormIsComplete) tidak ditemukan saat edit. Periksa ID di index.html.");
      return;
  }

  // Perbarui properti buku
  bookToEdit.title = titleInput.value;
  bookToEdit.author = authorInput.value;
  bookToEdit.year = Number(yearInput.value);
  bookToEdit.isComplete = isCompleteCheckbox.checked;

  saveData(); // Simpan perubahan ke localStorage
  renderBooks(); // Render ulang tampilan

  // Reset form dan kembalikan tombol submit ke teks default "Masukkan Buku"
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    bookForm.reset();
    bookForm.removeAttribute('data-editing-id'); // Hapus atribut penanda edit
    const submitButton = document.getElementById('bookFormSubmit');
    if (submitButton) {
      submitButton.innerHTML = `Masukkan Buku ke rak <span>Belum selesai dibaca</span>`;
    }
  }
}


// ===============================
// Event Listeners Utama (Dipanggil saat seluruh DOM siap)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // Muat data dari localStorage saat halaman pertama kali dimuat
  loadDataFromStorage();
  // Kemudian, render atau tampilkan buku-buku tersebut
  renderBooks();

  // Mendapatkan referensi ke form tambah/edit buku
  const bookForm = document.getElementById('bookForm');
  if (bookForm) { // Penting: Pastikan form ditemukan
    bookForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Mencegah refresh halaman default form

      const editingId = bookForm.getAttribute('data-editing-id');
      if (editingId) {
        editBook(Number(editingId)); // Jika ada ID editing, panggil fungsi edit
      } else {
        addBook(); // Jika tidak, panggil fungsi tambah buku baru
      }
    });
  } else {
    console.error("Formulir utama dengan ID 'bookForm' tidak ditemukan. Fungsi tambah/edit buku tidak akan berfungsi.");
  }


  // Mendapatkan referensi ke form pencarian buku
  const searchBookForm = document.getElementById('searchBook');
  if (searchBookForm) { // Penting: Pastikan form pencarian ditemukan
    searchBookForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Mencegah refresh halaman default form
      searchBook();
    });
  } else {
    console.warn("Formulir pencarian dengan ID 'searchBook' tidak ditemukan. Fitur pencarian mungkin tidak berfungsi.");
  }


  // Event listener untuk checkbox 'Selesai dibaca' pada form tambah/edit
  // Ini mengubah teks pada tombol submit sesuai dengan status checkbox
  const bookFormIsCompleteCheckbox = document.getElementById('bookFormIsComplete');
  const bookFormSubmitButtonSpan = document.querySelector('#bookFormSubmit span');

  if (bookFormIsCompleteCheckbox && bookFormSubmitButtonSpan) { // Penting: Pastikan kedua elemen ditemukan
      bookFormIsCompleteCheckbox.addEventListener('change', () => {
        if (bookFormIsCompleteCheckbox.checked) {
          bookFormSubmitButtonSpan.innerText = 'Selesai dibaca';
        } else {
          bookFormSubmitButtonSpan.innerText = 'Belum selesai dibaca';
        }
      });
  } else {
      console.error("Checkbox 'Selesai dibaca' (bookFormIsComplete) atau span pada tombol submit (bookFormSubmit span) tidak ditemukan. Fungsi perubahan teks tombol tidak aktif.");
  }
});