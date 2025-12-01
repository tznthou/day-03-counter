// 這裡可以加入你的 JavaScript 程式碼 
let count = 0;
let autoCountEnabled = false;
let lastStepTime = 0;
let stepThreshold = 4; // 步數檢測閾值（中等敏感度）
let stepCooldown = 300; // 步數檢測冷卻時間(ms)
let lastProcessTime = 0;
const PROCESS_INTERVAL = 50; // devicemotion 節流間隔(ms)

const display = document.getElementById('counter-display');
const incBtn = document.getElementById('increment');
const decBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');
const autoCountBtn = document.getElementById('toggle-auto-count');

// 音效
const clickAudio = new Audio('media/click.mp3');
const achievementAudio = new Audio('media/achievement.mp3');
const audienceAudio = new Audio('media/audience.mp3');

function getRandomColor() {
    const colors = ['#2196f3', '#e91e63', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#ffc107'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function playClickSound() {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
}

function playAchievementSound() {
    achievementAudio.currentTime = 0;
    achievementAudio.play().catch(() => {});
}

function playAudienceSound() {
    audienceAudio.currentTime = 0;
    audienceAudio.play().catch(() => {});
}

function updateDisplay(animate = true) {
    display.textContent = count;
    display.style.color = getRandomColor();
    if (animate) {
        display.classList.add('animated');
        setTimeout(() => display.classList.remove('animated'), 180);
    }
}

function incrementStep() {
    count++;
    playClickSound();
    updateDisplay();
    if ([10, 50, 100].includes(count)) {
        playAchievementSound();
    }
}

// 計步算法
function detectStep(acceleration) {
    const magnitude = Math.sqrt(
        acceleration.x * acceleration.x +
        acceleration.y * acceleration.y +
        acceleration.z * acceleration.z
    );
    
    const currentTime = Date.now();
    
    // 檢測是否超過閾值且冷卻時間已過
    if (magnitude > stepThreshold && (currentTime - lastStepTime) > stepCooldown) {
        lastStepTime = currentTime;
        incrementStep();
    }
}

// 自動計步功能
function toggleAutoCount() {
    if (!autoCountEnabled) {
        // 開啟自動計步
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS 13+ 需要請求權限
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startAutoCount();
                    } else {
                        alert('需要設備運動權限才能使用自動計步功能');
                    }
                })
                .catch(() => {
                    alert('無法啟動自動計步，請檢查瀏覽器設定');
                });
        } else {
            // Android 或其他平台
            startAutoCount();
        }
    } else {
        // 關閉自動計步
        stopAutoCount();
    }
}

function startAutoCount() {
    autoCountEnabled = true;
    autoCountBtn.innerHTML = '<i class="fa-solid fa-stop"></i> 停止計步';
    autoCountBtn.classList.add('active');

    // 先移除再綁定，確保只有一個 listener
    window.removeEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('devicemotion', handleDeviceMotion);
}

function stopAutoCount() {
    autoCountEnabled = false;
    autoCountBtn.innerHTML = '<i class="fa-solid fa-person-running"></i> 自動計步';
    autoCountBtn.classList.remove('active');

    window.removeEventListener('devicemotion', handleDeviceMotion);
}

function handleDeviceMotion(event) {
    if (!autoCountEnabled || !event.accelerationIncludingGravity) return;

    // 節流：每 50ms 處理一次，避免 60Hz 頻繁觸發
    const now = Date.now();
    if (now - lastProcessTime < PROCESS_INTERVAL) return;

    lastProcessTime = now;
    detectStep(event.accelerationIncludingGravity);
}

// 事件監聽器
incBtn.addEventListener('click', incrementStep);

decBtn.addEventListener('click', () => {
    if (count > 0) {
        count--;
        playClickSound();
        updateDisplay();
    } else {
        // 低於0時不動，並有輕微動畫提示
        display.classList.add('shake');
        setTimeout(() => display.classList.remove('shake'), 180);
    }
});

resetBtn.addEventListener('click', () => {
    count = 0;
    playAudienceSound();
    updateDisplay();
});

autoCountBtn.addEventListener('click', toggleAutoCount);

// 檢查設備是否支援動作感應
if (!window.DeviceMotionEvent) {
    autoCountBtn.style.display = 'none';
}

updateDisplay(false); 