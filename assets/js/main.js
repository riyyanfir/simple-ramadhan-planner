const modal = document.querySelectorAll('.modal');
M.Modal.init(modal, {
    preventScroling: false,
    onCloseEnd: () => {
        modalDaily.innerHTML = "";
    }
});

const sidenav = document.querySelectorAll('.sidenav');
M.Sidenav.init(sidenav);

const parallax = document.querySelectorAll('.parallax');
M.Parallax.init(parallax);

const scrollspy = document.querySelectorAll('.scrollspy');
M.ScrollSpy.init(scrollspy, {
    scrollOffset: 50
});

const select = document.querySelector('select');
M.FormSelect.init(select);

//  API Jadwal Sholat

const tableJadwal = document.querySelector('#table-jadwal');

function jadwalSholat(kota, tanggal) {
    return fetch(`https://api.banghasan.com/sholat/format/json/jadwal/kota/${kota}/tanggal/${tanggal}`)
    .then(res => res.json())
    .then(res => res.jadwal);
}




window.addEventListener('load', async() => {
    const tanggal = new Date().getDate();
    const bulan = new Date().getMonth()+1;
    const tahun = new Date().getFullYear();
    const tanggalSekarang = `${tahun}-0${bulan}-${tanggal}`;
    const selectKota = document.querySelector('#selectKota');
    const value = selectKota.options[selectKota.selectedIndex].value;
    const jadwal = await jadwalSholat(value, tanggalSekarang);
    const tanggalAPI = document.querySelector('#tanggal');
    tanggalAPI.innerHTML = jadwal.data.tanggal;
    tableJadwal.innerHTML = `
        <tr>
            <td>${jadwal.data.subuh}</td>
            <td>${jadwal.data.dzuhur}</td>
            <td>${jadwal.data.ashar}</td>
            <td>${jadwal.data.maghrib}</td>
            <td>${jadwal.data.isya}</td>
            <td>${jadwal.data.imsak}</td>
        </tr>
    `;
    selectKota.addEventListener('change', async() => {
        const value = selectKota.options[selectKota.selectedIndex].value;
        const jadwal = await jadwalSholat(value, tanggalSekarang);
        tableJadwal.innerHTML = `
            <tr>
                <td>${jadwal.data.subuh}</td>
                <td>${jadwal.data.dzuhur}</td>
                <td>${jadwal.data.ashar}</td>
                <td>${jadwal.data.maghrib}</td>
                <td>${jadwal.data.isya}</td>
                <td>${jadwal.data.imsak}</td>
            </tr>
        `;
    })

})

// ------------------------------------------------------ //

const textTarget = document.querySelector('#target-text');
const btnTarget = document.querySelector('#btn-target');
const tableTarget = document.querySelector('#table-target');

function buatDatabase() {
    const request = window.indexedDB.open('ListAct', 1);
    request.onerror = kesalahanHandler;
    request.onupgradeneeded = function(e) {             
        const db = e.target.result;
        db.onerror = kesalahanHandler;                          
        db.createObjectStore('target_act', { keyPath: 'id' });
        db.createObjectStore('daily_act', { keyPath: 'id' });
    }
    request.onsuccess = function(e) {           
        db = e.target.result;
        db.onerror = kesalahanHandler;                        
        bacaDariDatabase();
        bacaDariDatabaseDaily();
    }
}

buatDatabase();

function tambahBaris(e) {

    const id = Math.floor(Math.random() * 10000).toString();

    if (textTarget.value !== '') {
        tambahKeDatabase({
            id: id,
            targetAct: textTarget.value,
        });
        
        const baris = tableTarget.insertRow();
        baris.id = id;
        baris.insertCell().appendChild(document.createTextNode(textTarget.value));
    
        const btnHapus = document.createElement('button');
        btnHapus.className = 'hapus-target btn orange darken-4';
        const iconHapus = document.createElement('i');
        iconHapus.className = 'material-icons';
        iconHapus.innerText = 'delete';
        iconHapus.id = id;
        btnHapus.id = id;            
        btnHapus.appendChild(iconHapus);
        baris.insertCell().appendChild(btnHapus);

        textTarget.value = '';
    }
    
    e.preventDefault();
}               

function hapusBaris(e) {
    if (e.target.id) {
        const confirm = `<span>Apakah kamu yakin?</span><button class="btn-flat toast-action" id="yaBtn">Ya</button> <button class="btn-flat toast-action" onclick="M.Toast.dismissAll()">Tidak</button>`;
        M.toast({html: confirm, displayLength: 8000, classes: 'taoster'});
        document.querySelector('#yaBtn').addEventListener('click', () => {
            M.Toast.dismissAll();
            tableTarget.deleteRow(tableTarget.rows.namedItem(e.target.id).sectionRowIndex);
            hapusDariDatabase(e.target.id);
        })
    }
}

btnTarget.addEventListener('click', tambahBaris, false);
tableTarget.addEventListener('click', hapusBaris, true);

         
function kesalahanHandler(e) {
    M.toast({html: 'Kesalahan : ' + e.target.errorCode, displayLength: 1000});      
}

function cetakPesanHandler(msg) {
    return function(e) {
        M.toast({html: msg, displayLength: 1000});
    }
}

function buatTransaksi() {
    const transaction = db.transaction(['target_act'], 'readwrite');
    transaction.onerror = kesalahanHandler;            
    return transaction;
}

function tambahKeDatabase(targetAct) {      
    const objectstore = buatTransaksi().objectStore('target_act');
    const request = objectstore.add(targetAct);
    request.onerror = kesalahanHandler;
    request.onsuccess = cetakPesanHandler('berhasil ditambahkan');            
}

// // Menampilkan dari database
function bacaDariDatabase() {
    const objectstore = buatTransaksi().objectStore('target_act');
    objectstore.openCursor().onsuccess = function(e) {
        const result = e.target.result;
        if (result) {
            const baris = tableTarget.insertRow();  
            const p = document.createElement('p');
            const pText = document.createTextNode(result.value.targetAct);
            p.append(pText);
            baris.insertCell().appendChild(p);
            const btnHapus = document.createElement('button');
            btnHapus.className = 'hapus-target btn orange darken-4';
            btnHapus.id = result.value.id;
            const iconHapus = document.createElement('i');
            iconHapus.className = 'material-icons';
            iconHapus.innerText = 'delete';
            iconHapus.id = result.value.id;
            btnHapus.appendChild(iconHapus);
            baris.insertCell().appendChild(btnHapus);
            result.continue();
        }
    }   
}


// Hapus dari database
function hapusDariDatabase(id) {
    const objectstore = buatTransaksi().objectStore('target_act');
    const request = objectstore.delete(id);
    request.onerror = kesalahanHandler;
    request.onsuccess = cetakPesanHandler('berhasil dihapus');
}

// ------------------------------------------------------------------------------------------------------ //
// Daily Activity

const btnDailyAct = document.querySelector('.addDailyAct');
const tableDaily = document.querySelector('#table-daily');
const modalDaily = document.querySelector('.modal-content');
const cardDaily = document.querySelector('#card-daily');
const pDaily = document.querySelector('#pAct');

function tambahBarisDaily(e) {

    const id = Math.floor(Math.random() * 10000).toString();
    const dateDaily = new Date().getTime();

    const dailyCheck = document.getElementsByName('dailyAct[]');
    let dailyAct = [];
    for (let i = 0; i < dailyCheck.length; i++) {
        if(dailyCheck[i].checked === true) {
            dailyAct.push(dailyCheck[i].value);
        }
    }

    if (dailyAct.length > 0) {
        tambahKeDatabaseDaily({
            id: id,
            date: dateDaily,
            dailyAct: dailyAct,
        });
    
        const baris = tableDaily.insertRow();                  
        baris.id = id;
        const dateRow = new Date(dateDaily).getDate();
        const monthRow = new Date(dateDaily).getMonth()+1;
        const yearRow = new Date(dateDaily).getFullYear();
        baris.insertCell().appendChild(document.createTextNode(`${dateRow}-${monthRow}-${yearRow}`));
        const btnView = document.createElement('button');
        btnView.className = 'modal-trigger btn orange darken-4';
        btnView.id = id;
        btnView.dataset.target = 'view';
        const iconHapus = document.createElement('i');
        iconHapus.className = 'material-icons';
        iconHapus.innerText = 'open_in_new';
        iconHapus.id = id;
        btnView.appendChild(iconHapus);
        baris.insertCell().appendChild(btnView);
        cardDaily.classList.toggle('hide');
        pDaily.classList.toggle('hide');
    }


    e.preventDefault();
}

function buatTransaksiDaily() {
    const transaction = db.transaction(['daily_act'], 'readwrite');
    transaction.onerror = kesalahanHandler;               
    return transaction;
}

function tambahKeDatabaseDaily(dailyAct) {      
    const objectstore = buatTransaksiDaily().objectStore('daily_act');
    const request = objectstore.add(dailyAct);
    request.onerror = kesalahanHandler;
    request.onsuccess = cetakPesanHandler('berhasil ditambahkan');            
}

function bacaDariDatabaseDaily() {
    const objectstore = buatTransaksiDaily().objectStore('daily_act');
    objectstore.openCursor().onsuccess = function(e) {
        const result = e.target.result;
        if (result) {
            const data = [result.value].find(item => new Date(item.date).getDate() == new Date().getDate() );
            if(data !== undefined) {
                cardDaily.classList.toggle('hide');
                pDaily.classList.toggle('hide');
            }
            const baris = tableDaily.insertRow();                  
            baris.id = result.value.id;
            const dateRow = new Date(result.value.date).getDate();
            const monthRow = new Date(result.value.date).getMonth()+1;
            const yearRow = new Date(result.value.date).getFullYear();
            baris.insertCell().appendChild(document.createTextNode(`${dateRow}-${monthRow}-${yearRow}`));
            const btnView = document.createElement('button');
            btnView.className = 'modal-trigger btn orange darken-4';
            btnView.id = result.value.id;
            btnView.dataset.target = 'view';
            const iconHapus = document.createElement('i');
            iconHapus.className = 'material-icons';
            iconHapus.innerText = 'open_in_new';
            iconHapus.id = result.value.id;
            btnView.appendChild(iconHapus);
            baris.insertCell().appendChild(btnView);
            result.continue();
        }
    }   
}


function bacaDataModal(e) {
   if (e.target.id) {
        const objectstore = buatTransaksiDaily().objectStore('daily_act');
        objectstore.openCursor(e.target.id).onsuccess = function(e) {
            const result = e.target.result;
            if (result) {
                const data = result.value.dailyAct;
                const h4 = document.createElement('h4');
                const h4Text = document.createTextNode('Checklist Aktivitas Harian');
                h4.appendChild(h4Text);
                modalDaily.appendChild(h4);
                data.forEach(item => {
                    const pModal = document.createElement('p');
                    pModal.innerHTML = `<i class="material-icons green-text">done</i> ${item}`;
                    modalDaily.appendChild(pModal);
                });
                result.continue();
            }
        } 
   }
}

btnDailyAct.addEventListener('click', tambahBarisDaily);
tableDaily.addEventListener('click', bacaDataModal);
