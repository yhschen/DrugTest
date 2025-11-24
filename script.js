// 頁面載入時執行
document.addEventListener('DOMContentLoaded', () => {
    // 設定預設時間為當前時間
    setDefaultTime();
    // 載入並顯示已儲存的資料
    renderUsageTable();
    renderInventoryTable();
});

// 切換分頁功能
function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    contents.forEach(content => content.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 設定輸入框預設為現在時間
function setDefaultTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const currentDateTime = now.toISOString().slice(0, 16);
    
    document.getElementById('useTime').value = currentDateTime;
    document.getElementById('invTime').value = currentDateTime;
}

// --- 功能 1: 處理使用紀錄 ---

const usageForm = document.getElementById('usageForm');
usageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const record = {
        unit: document.getElementById('useUnit').value,
        person: document.getElementById('usePerson').value,
        time: document.getElementById('useTime').value.replace('T', ' '),
        item: document.getElementById('useItem').value,
        batch: document.getElementById('useBatch').value,
        result: document.getElementById('testResult').value
    };

    // 取得舊資料，加入新資料，再存回去
    const records = JSON.parse(localStorage.getItem('drugTest_usage')) || [];
    records.unshift(record); // 加在最前面
    localStorage.setItem('drugTest_usage', JSON.stringify(records));

    usageForm.reset();
    setDefaultTime();
    renderUsageTable();
    alert('使用紀錄已儲存！');
});

function renderUsageTable() {
    const tbody = document.querySelector('#usageTable tbody');
    const records = JSON.parse(localStorage.getItem('drugTest_usage')) || [];
    
    tbody.innerHTML = records.map(r => `
        <tr>
            <td>${r.time}</td>
            <td>${r.unit}</td>
            <td>${r.person}</td>
            <td>${r.item}</td>
            <td>${r.batch}</td>
            <td style="color: ${r.result === '陽性' ? 'red' : 'green'}">${r.result}</td>
        </tr>
    `).join('');
}

// --- 功能 2: 處理入庫管理 ---

const inventoryForm = document.getElementById('inventoryForm');
inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const item = {
        unit: document.getElementById('invUnit').value,
        time: document.getElementById('invTime').value.replace('T', ' '),
        batch: document.getElementById('invBatch').value,
        qty: document.getElementById('invQty').value
    };

    const items = JSON.parse(localStorage.getItem('drugTest_inventory')) || [];
    items.unshift(item);
    localStorage.setItem('drugTest_inventory', JSON.stringify(items));

    inventoryForm.reset();
    setDefaultTime();
    renderInventoryTable();
    alert('入庫資料已儲存！');
});

function renderInventoryTable() {
    const tbody = document.querySelector('#inventoryTable tbody');
    const items = JSON.parse(localStorage.getItem('drugTest_inventory')) || [];

    tbody.innerHTML = items.map(i => `
        <tr>
            <td>${i.time}</td>
            <td>${i.unit}</td>
            <td>${i.batch}</td>
            <td>${i.qty}</td>
        </tr>
    `).join('');
}