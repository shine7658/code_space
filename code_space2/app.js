// 1. 系統內建初始環保任務
const initialTasks = [
    { id: 1, text: "🥤 自備環保杯/保溫瓶購買飲料", points: 10, completed: false, category: "飲食", tagClass: "tag-diet" },
    { id: 2, text: "Bus 搭乘大眾運輸工具或騎乘 YouBike", points: 15, completed: false, category: "交通", tagClass: "tag-traffic" },
    { id: 3, text: "🍱 用餐時不索取一次性免洗筷/塑膠袋", points: 10, completed: false, category: "飲食", tagClass: "tag-diet" },
    { id: 4, text: "🥗 今日實行一餐吃蔬食（無肉飲食）", points: 20, completed: false, category: "飲食", tagClass: "tag-diet" },
    { id: 5, text: "💡 隨手關閉不必要的房間/教室電源", points: 10, completed: false, category: "節能", tagClass: "tag-energy" }
];

// 2. 實用性生活減碳指南知識庫
const quotes = [
    "自備環保杯購買飲料，平均每次可減少約 0.15 公斤的碳排放與塑膠浪費。",
    "每搭乘公車通勤一次，相較於開車，能為地球減少將近 60% 的二氧化碳排放量。",
    "冷氣每調高 1 度，就可節省約 6% 的空調電力，隨手關燈更是省電的基本步。",
    "實行一日無肉飲食，能直接幫地球減少 2.4 公斤的碳排放，相當於樹木一天的吸碳量。",
    "拔除不常使用的電器插頭（如微波爐、床頭音響），可省下高達 10% 的日常待機電力。"
];

// 3. 讀取或初始化 LocalStorage
let appState = JSON.parse(localStorage.getItem('ecoStepState')) || {
    score: 0,
    tasks: initialTasks.map(t => ({ ...t }))
};

// 4. 智慧夜間與隨機任務感知
function checkInnovativeFeatures() {
    const currentHour = new Date().getHours();
    const bodyEl = document.body;
    
    if (currentHour >= 23 || currentHour < 5) {
        if (bodyEl) bodyEl.classList.add('eco-dark-mode');
        const hasNightTask = appState.tasks.some(t => t.id === 'night-saving');
        if (!hasNightTask) {
            appState.tasks.unshift({
                id: 'night-saving',
                text: "🌙 深夜守護：關閉電腦延長線總開關並準時就寢",
                points: 25,
                completed: false,
                category: "節能",
                tagClass: "tag-energy"
            });
        }
    } else {
        if (bodyEl) bodyEl.classList.remove('eco-dark-mode');
        const nightTaskIndex = appState.tasks.findIndex(t => t.id === 'night-saving');
        if (nightTaskIndex !== -1 && !appState.tasks[nightTaskIndex].completed) {
            appState.tasks.splice(nightTaskIndex, 1);
        }
    }

    const todayStr = new Date().toDateString();
    const challengeState = JSON.parse(localStorage.getItem('ecoChallengeState')) || { date: '', active: false };

    if (challengeState.date !== todayStr) {
        const triggerChallenge = Math.random() < 0.3; 
        if (triggerChallenge) {
            challengeState.active = true;
            const hasFlashTask = appState.tasks.some(t => t.id === 'flash-challenge');
            if (!hasFlashTask) {
                appState.tasks.push({
                    id: 'flash-challenge',
                    text: "⚡【今日限時挑戰】達成全天完全不使用一次性塑膠袋與塑膠吸管",
                    points: 30,
                    completed: false,
                    category: "飲食",
                    tagClass: "tag-diet"
                });
            }
        }
        challengeState.date = todayStr;
        localStorage.setItem('ecoChallengeState', JSON.stringify(challengeState));
    }
}

// 5. 畫面動態渲染
function renderApp() {
    const score = appState.score;
    document.getElementById('current-score').innerText = score;
    document.getElementById('carbon-text').innerText = (score * 0.12).toFixed(1);
    
    let plantIcon = "🌱";
    let plantLevel = "種子階段";
    const maxScore = appState.tasks.reduce((sum, t) => sum + t.points, 0);
    let progressPercent = maxScore > 0 ? (score / maxScore) * 100 : 0;

    if (score >= 15 && score < 35) {
        plantIcon = "🌿";
        plantLevel = "幼苗階段";
    } else if (score >= 35 && score < 55) {
        plantIcon = "🌳";
        plantLevel = "小樹階段";
    } else if (score >= 55) {
        plantIcon = "✨🎄✨";
        plantLevel = "神聖大樹";
        progressPercent = 100;
    }

    document.getElementById('plant-icon').innerText = plantIcon;
    document.getElementById('plant-level').innerText = `等級：${plantLevel}`;
    document.getElementById('score-progress').style.width = `${Math.min(progressPercent, 100)}%`;
    
    const completedCount = appState.tasks.filter(t => t.completed).length;
    const totalCount = appState.tasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    document.getElementById('completion-rate').innerText = `已完成 ${completionRate}%`;

    const taskListContainer = document.getElementById('task-list');
    taskListContainer.innerHTML = '';

    appState.tasks.forEach(task => {
        const taskCard = document.createElement('div');
        let specialClass = '';
        if (task.id === 'flash-challenge') specialClass = 'border-warning border-2 shadow-sm bg-warning bg-opacity-10';
        if (task.id === 'night-saving') specialClass = 'border-info border-2 bg-info bg-opacity-10';

        taskCard.className = `card p-3 task-item ${task.completed ? 'completed' : ''} ${specialClass}`;
        
        taskCard.innerHTML = `
            <div class="form-check d-flex align-items-center justify-content-between mb-0">
                <div class="d-flex align-items-center">
                    <input class="form-check-input me-3" type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
                    <span class="category-tag ${task.tagClass} me-2">${task.category}</span>
                    <label class="form-check-label fw-bold" for="task-${task.id}">${task.text}</label>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-success">+${task.points} XP</span>
                    ${typeof task.id === 'number' ? `<button class="btn btn-sm text-danger p-0 border-0 btn-delete" title="刪除任務"><i class="bi bi-x-circle-fill"></i></button>` : ''}
                </div>
            </div>
        `;

        taskCard.querySelector('.form-check-input').addEventListener('click', (e) => {
            toggleTask(task.id, e);
        });

        if (typeof task.id === 'number') {
            taskCard.querySelector('.btn-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });
        }

        taskListContainer.appendChild(taskCard);
    });

    localStorage.setItem('ecoStepState', JSON.stringify(appState));
}

// 6. 核心創新點：純前端綠色暴擊粒子生成引擎
function createLeafBurst(clickEvent) {
    const leafEmojis = ['🌿', '🌱', '🍃', '🍀', '✨'];
    const particleCount = 15; 
    
    const x = clickEvent.clientX;
    const y = clickEvent.clientY;

    for (let i = 0; i < particleCount; i++) {
        const leaf = document.createElement('span');
        leaf.className = 'eco-particle';
        leaf.innerText = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 100;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity;
        const rotation = Math.random() * 360 + 180; 

        leaf.style.setProperty('--tx', `${targetX}px`);
        leaf.style.setProperty('--ty', `${targetY}px`);
        leaf.style.setProperty('--rot', `${rotation}deg`);
        
        leaf.style.left = `${x}px`;
        leaf.style.top = `${y}px`;

        document.body.appendChild(leaf);

        leaf.addEventListener('animationend', () => {
            leaf.remove();
        });
    }
}

// 7. 語意防禦演算法
function validateAndGetCategory(text) {
    const carbonBlacklist = [
        '開車', '開汽車', '騎機車', '開冷氣', '吹冷氣', '吃肉', '吃排骨', '吃雞排', '吃牛肉', 
        '拿塑膠袋', '要塑膠袋', '索取塑膠袋', '用免洗筷', '拿免洗筷', '用塑膠吸管', '拿紙杯', 
        '開電燈', '開著燈', '沒關燈', '沒關電', '沒關冷氣', '搭電梯', '坐電梯'
    ];
    const negativeWords = ['沒有', '沒去', '沒搭', '忘了', '取消', '不打算', '無法', '不拿', '不用', '不開', '減少', '拒絕'];

    const actionVerbs = ['自備', '不用', '減少', '關閉', '隨手', '騎', '搭', '搭乘', '走路', '步行', '回收', '拔掉', '實行', '自帶', '不拿', '少用', '走'];
    const dietKeywords = ['環保杯', '保溫瓶', '免洗筷', '塑膠袋', '吸管', '蔬食', '無肉', '便當盒', '餐具', '購物袋', '紙杯'];
    const trafficKeywords = ['捷運', '公車', '大眾運輸', 'YouBike', '腳踏車', '單車', '電梯', '樓梯', '高鐵', '火車'];
    const energyKeywords = ['電源', '電燈', '冷氣', '插頭', '節能', '風扇', '關燈', '總開關', '電器'];

    for (let badBehavior of carbonBlacklist) {
        const badIndex = text.indexOf(badBehavior);
        if (badIndex !== -1) { 
            let isNegatedCorrectly = false;
            for (let neg of negativeWords) {
                const negIndex = text.indexOf(neg);
                if (negIndex !== -1 && negIndex < badIndex && (badIndex - negIndex) <= 5) {
                    isNegatedCorrectly = true; 
                    break;
                }
            }
            if (!isNegatedCorrectly) {
                return { success: false, reason: `系統偵測到非環保行為（${badBehavior}）。此網頁為綠色行動打卡網，無法新增此行為。` };
            }
        }
    }

    const hasAction = actionVerbs.some(verb => text.includes(verb));
    const hasDiet = dietKeywords.some(keyword => text.includes(keyword));
    const hasTraffic = trafficKeywords.some(keyword => text.includes(keyword));
    const hasEnergy = energyKeywords.some(keyword => text.includes(keyword));

    if (!hasAction) {
        return { success: false, reason: "請包含具體的環保行動動詞（例如：自備、隨手關、搭乘、少用...）。" };
    }

    if (hasTraffic) {
        return { success: true, category: "交通", tagClass: "tag-traffic", points: 15 };
    } else if (hasEnergy) {
        return { success: true, category: "節能", tagClass: "tag-energy", points: 10 };
    } else if (hasDiet) {
        return { success: true, category: "飲食", tagClass: "tag-diet", points: 10 };
    } else {
        return { success: false, reason: "系統無法辨識此行為與生活環保（飲食、交通、節能）的直接關聯性。" };
    }
}

function toggleTask(id, event) {
    const task = appState.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        appState.score += task.completed ? task.points : -task.points;
        
        if (task.completed && event) {
            createLeafBurst(event);
        }

        const container = document.getElementById('plant-container');
        if (container) {
            container.classList.remove('plant-pop');
            void container.offsetWidth; 
            container.classList.add('plant-pop');
        }

        renderApp();
    }
}

function handleAddTask(e) {
    if (e && e.preventDefault) e.preventDefault();
    const textInput = document.getElementById('new-task-text');
    const taskText = textInput.value.trim();

    if (taskText.length < 5) {
        alert("新增失敗：描述過短！請輸入至少 5 個字具體說明您的環保行為。");
        return;
    }

    const repeatPattern = /(.)\1{3,}/; 
    const pureNumbers = /^[0-9]+$/;     
    if (pureNumbers.test(taskText) || repeatPattern.test(taskText)) {
        alert("新增失敗：檢測到重複字元或純數字，請勿隨意輸入無意義內容！");
        return;
    }

    const result = validateAndGetCategory(taskText);
    if (!result.success) {
        alert(`新增失敗！\n原因：${result.reason}`);
        return;
    }

    // ===================================================
    // 智慧語意感應區：自動抓出最配的 Emoji 圖示
    // ===================================================
    let detectedIcon = "🌱"; 
    const lowerText = taskText.toLowerCase();

    if (result.category === "交通") {
        if (lowerText.includes("單車") || lowerText.includes("bike") || lowerText.includes("騎") || lowerText.includes("youbike")) {
            detectedIcon = "🚲";
        } else if (lowerText.includes("捷運") || lowerText.includes("mrt")) {
            detectedIcon = "🚇";
        } else if (lowerText.includes("走路") || lowerText.includes("步") || lowerText.includes("樓梯")) {
            detectedIcon = "🚶";
        } else {
            detectedIcon = "🚌";
        }
    } else if (result.category === "節能") {
        if (lowerText.includes("插頭") || lowerText.includes("拔")) {
            detectedIcon = "🔌";
        } else if (lowerText.includes("冷氣")) {
            detectedIcon = "❄️";
        } else {
            detectedIcon = "💡";
        }
    } else if (result.category === "飲食") {
        if (lowerText.includes("杯") || lowerText.includes("飲") || lowerText.includes("保溫瓶")) {
            detectedIcon = "🥤";
        } else if (lowerText.includes("餐盒") || lowerText.includes("便當") || lowerText.includes("筷")) {
            detectedIcon = "🍱";
        } else if (lowerText.includes("肉") || lowerText.includes("菜") || lowerText.includes("蔬")) {
            detectedIcon = "🥗";
        } else {
            detectedIcon = "🛍️";
        }
    }
    // ===================================================

    // 防重複機制：如果原本就已經有包含該圖標的任務，就不重複新增
    const isDuplicate = appState.tasks.some(t => t.text.includes(taskText));
    if (isDuplicate) {
        alert("這項環保行動已經在你的清單中囉！");
        textInput.value = '';
        return;
    }

    const newTask = {
        id: Date.now(), 
        text: `${detectedIcon} ${taskText}`,
        points: result.points,
        completed: false,
        category: result.category,
        tagClass: result.tagClass
    };

    appState.tasks.push(newTask);
    textInput.value = ''; 
    renderApp();
}

function deleteTask(id) {
    const taskIndex = appState.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        if (appState.tasks[taskIndex].completed) {
            appState.score -= appState.tasks[taskIndex].points;
        }
        appState.tasks.splice(taskIndex, 1);
        renderApp();
    }
}

function resetApp() {
    if (confirm("確定要將所有紀錄（包含自訂任務）重設嗎？")) {
        appState = {
            score: 0,
            tasks: initialTasks.map(t => ({ ...t }))
        };
        localStorage.setItem('ecoStepState', JSON.stringify(appState));
        localStorage.removeItem('ecoChallengeState');
        changeQuote();
        checkInnovativeFeatures();
        renderApp();
    }
}

function changeQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote-text').innerText = randomQuote;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-reset').addEventListener('click', resetApp);
    document.getElementById('add-task-form').addEventListener('submit', handleAddTask);
    
    // ===================================================
    // 【終極修復】：用原生最穩定的 DOM Value 寫入法，保證按下去字元一定跑出來
    // ===================================================
    const quickButtons = document.querySelectorAll('.quick-btn');
    const textInput = document.getElementById('new-task-text');

    quickButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. 抓取按鈕資料
            const targetText = btn.getAttribute('data-text');
            
            // 2. 直擊核心：直接把字元灌進 input 欄位中
            textInput.value = targetText;
            
            // 3. 貼心視覺回饋：讓輸入框亮起來
            textInput.focus();
            
            // 4. 強制執行審查新增函式
            handleAddTask();
        });
    });
    // ===================================================

    const menuOverlay = document.getElementById('full-screen-menu');
    document.getElementById('menu-open-btn').addEventListener('click', () => {
        menuOverlay.classList.add('open');
    });

    menuOverlay.addEventListener('click', (event) => {
        if (!event.target.closest('.menu-links')) {
            menuOverlay.classList.remove('open');
        }
    });

    changeQuote();
    checkInnovativeFeatures();
    renderApp();
});