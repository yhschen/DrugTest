// !重要! 請將下方的網址換成你剛剛部署的 Google Apps Script 網址
const API_URL = "https://script.google.com/macros/s/AKfycbw4kwJek0SLROc01YJD9XDlNneFUc8RHQZ94DLgLf8sNgDuADQKqxqatjR1ebjrfR68Tw/exec";

document.addEventListener('DOMContentLoaded', () => {
    setDefaultTime();
    loadData(); // 載入資料
});

function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    contents.forEach(c => c.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

function setDefaultTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('useTime').value = now.toISOString().slice(0, 16);
    document.getElementById('invTime').value = now.toISOString().slice(0, 16);
}

// --- 從 Google Sheets 讀取資料 ---
function loadData() {
    // 顯示載入中...
    const tbodyUsage = document.querySelector('#usageTable tbody');
    tbodyUsage.innerHTML = '<tr><td colspan="6" style="text-align:center;">資料載入中...</td></tr>';

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            renderUsageTable(data.usage);
            renderInventoryTable(data.inventory);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('讀取資料失敗，請檢查網路或 Script 網址');
        });
}

// --- 功能 1: 送出使用紀錄 ---
const usageForm = document.getElementById('usageForm');
usageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = usageForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "儲存中...";
    btn.disabled = true;

    const record = {
        type: 'usage', // 告訴後端這是使用紀錄
        unit: document.getElementById('useUnit').value,
        person: document.getElementById('usePerson').value,
        time: document.getElementById('useTime').value.replace('T', ' '),
        item: document.getElementById('useItem').value,
        batch: document.getElementById('useBatch').value,
        result: document.getElementById('testResult').value
    };

    sendData(record, () => {
        usageForm.reset();
        setDefaultTime();
        btn.innerText = originalText;
        btn.disabled = false;
        alert('使用紀錄已儲存至雲端！');
        loadData(); // 重新讀取列表
    });
});

// --- 功能 2: 送出入庫管理 ---
const inventoryForm = document.getElementById('inventoryForm');
inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = inventoryForm.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "儲存中...";
    btn.disabled = true;

    const item = {
        type: 'inventory', // 告訴後端這是入庫紀錄
        unit: document.getElementById('invUnit').value,
        time: document.getElementById('invTime').value.replace('T', ' '),
        batch: document.getElementById('invBatch').value,
        qty: document.getElementById('invQty').value
    };

    sendData(item, () => {
        inventoryForm.reset();
        setDefaultTime();
        btn.innerText = originalText;
        btn.disabled = false;
        alert('入庫資料已儲存至雲端！');
        loadData(); // 重新讀取列表
    });
});

// --- 共用：傳送資料到 Google Sheets ---
function sendData(dataObj, callback) {
    // 使用 'no-cors' 模式或是 text/plain 以避免跨域問題
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(dataObj)
    })
    .then(response => response.text())
    .then(result => {
        callback();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('儲存失敗，請稍後再試');
        // 即使失敗也要恢復按鈕
        document.querySelector('.btn-submit').disabled = false;
        document.querySelector('.btn-submit').innerText = "儲存紀錄";
    });
}

// --- 渲染表格 ---
function renderUsageTable(records) {
    const tbody = document.querySelector('#usageTable tbody');
    if(records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">目前無資料</td></tr>';
        return;
    }
    tbody.innerHTML = records.map(r => `
        <tr>
            <td>${r.time}</td>
            <td>${r.unit}</td>
            <td>${r.person}</td>
            <td>${r.item}</td>
            <td>${r.batch}</td>
            <td style="font-weight:bold; color: ${r.result === '陽性' ? 'red' : 'green'}">${r.result}</td>
        </tr>
    `).join('');
}

function renderInventoryTable(items) {
    const tbody = document.querySelector('#inventoryTable tbody');
    if(items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">目前無資料</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(i => `
        <tr>
            <td>${i.time}</td>
            <td>${i.unit}</td>
            <td>${i.batch}</td>
            <td>${i.qty}</td>
        </tr>
    `).join('');
}
