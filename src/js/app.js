/**
 * HIIT Timer - 設定表示切り替え対応版
 * 自動/手動実行 + 設定表示のオン・オフ機能
 */

// アプリケーション設定
const APP_CONFIG = {
    tickInterval: 1000,
    countdownFrom: 3
};

// アプリケーション状態
let timerState = {
    isRunning: false,
    isPaused: false,
    currentTime: 0,
    currentTaskIndex: 0,
    intervalId: null,
    isPreparation: false,
    workoutName: 'カスタムワークアウト',
    executionMode: 'auto', // 'auto' または 'manual'
    isWaitingForNext: false // 手動モードでタスク完了待ち状態
};

// UI状態
let uiState = {
    settingsVisible: false // 設定表示状態
};

// カスタムタスクリスト
let customTasks = [
    { id: 1, name: 'スクワット', duration: 45 },
    { id: 2, name: '休憩', duration: 15 },
    { id: 3, name: 'プッシュアップ', duration: 30 },
    { id: 4, name: '休憩', duration: 20 },
    { id: 5, name: 'プランク', duration: 60 },
    { id: 6, name: '休憩', duration: 10 }
];

let nextTaskId = 7;

// DOM要素の取得
const elements = {
    timeDisplay: document.querySelector('.time'),
    phaseDisplay: document.querySelector('.phase'),
    currentTaskDisplay: document.querySelector('.current-task'),
    taskNameDisplay: document.querySelector('.task-name'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    nextTaskBtn: document.getElementById('nextTaskBtn'),
    manualControls: document.getElementById('manualControls'),
    settingsToggleBtn: document.getElementById('settingsToggleBtn'),
    taskSettings: document.getElementById('taskSettings'),
    workoutNameInput: document.getElementById('workoutName'),
    taskList: document.getElementById('taskList'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    autoModeBtn: document.getElementById('autoModeBtn'),
    manualModeBtn: document.getElementById('manualModeBtn'),
    modeDescription: document.getElementById('modeDescription')
};

/**
 * 音声合成
 */
const voiceManager = {
    isSupported: 'speechSynthesis' in window,
    
    speak(text) {
        if (!this.isSupported) {
            console.log('音声通知:', text);
            return;
        }
        
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
    },
    
    announceTask(task, taskNumber, totalTasks) {
        this.speak(`${task.name}を開始します！`);
    },
    
    countdown(number) {
        this.speak(number.toString());
    },
    
    announceTaskComplete(isManual) {
        if (isManual) {
            this.speak('タスク完了！次へボタンを押してください。');
        }
    }
};

/**
 * 時間を MM:SS 形式にフォーマット
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 設定表示の切り替え
 */
function toggleSettings() {
    uiState.settingsVisible = !uiState.settingsVisible;
    
    const settingsText = elements.settingsToggleBtn.querySelector('.settings-text');
    
    if (uiState.settingsVisible) {
        // 設定を表示
        elements.taskSettings.classList.remove('hidden');
        elements.taskSettings.classList.add('show');
        elements.settingsToggleBtn.classList.add('active');
        settingsText.textContent = '設定を閉じる';
    } else {
        // 設定を非表示
        elements.taskSettings.classList.remove('show');
        elements.taskSettings.classList.add('hidden');
        elements.settingsToggleBtn.classList.remove('active');
        settingsText.textContent = '設定を開く';
    }
    
    console.log(`設定表示: ${uiState.settingsVisible ? '表示' : '非表示'}`);
}

/**
 * 実行モードを設定
 */
function setExecutionMode(mode) {
    timerState.executionMode = mode;
    
    // ボタンの状態更新
    elements.autoModeBtn.classList.toggle('active', mode === 'auto');
    elements.manualModeBtn.classList.toggle('active', mode === 'manual');
    
    // 説明文更新
    if (mode === 'auto') {
        elements.modeDescription.innerHTML = '<p>✅ 自動実行モード：タスク完了時に自動的に次のタスクに進みます</p>';
    } else {
        elements.modeDescription.innerHTML = '<p>👆 手動実行モード：タスク完了時に「次へ」ボタンで手動進行します</p>';
    }
    
    console.log(`実行モードを ${mode} に設定しました`);
}

/**
 * 表示を更新
 */
function updateDisplay() {
    // 時間表示
    elements.timeDisplay.textContent = formatTime(timerState.currentTime);
    
    // フェーズ表示
    let phaseText = '';
    if (timerState.isPreparation) {
        phaseText = '準備中';
    } else if (timerState.isWaitingForNext) {
        phaseText = '完了 - 次へ待ち';
    } else if (timerState.currentTaskIndex < customTasks.length) {
        phaseText = '実行中';
    } else {
        phaseText = '完了！';
    }
    elements.phaseDisplay.textContent = phaseText;
    
    // タスク情報表示
    if (timerState.currentTaskIndex < customTasks.length) {
        const currentTask = customTasks[timerState.currentTaskIndex];
        elements.currentTaskDisplay.textContent = `タスク ${timerState.currentTaskIndex + 1} / ${customTasks.length}`;
        elements.taskNameDisplay.textContent = currentTask.name;
    } else {
        elements.currentTaskDisplay.textContent = '完了';
        elements.taskNameDisplay.textContent = 'お疲れ様でした！';
    }
    
    // 手動コントロールの表示/非表示
    const showManualControls = timerState.executionMode === 'manual' && 
                              timerState.isWaitingForNext && 
                              timerState.currentTaskIndex < customTasks.length;
    elements.manualControls.style.display = showManualControls ? 'block' : 'none';
    
    // ボタンの状態更新
    updateButtonStates();
}

/**
 * ボタンの状態を更新
 */
function updateButtonStates() {
    if (timerState.currentTaskIndex >= customTasks.length) {
        elements.startBtn.style.display = 'none';
        elements.pauseBtn.style.display = 'none';
        elements.resetBtn.textContent = '新しいセッション';
    } else if (timerState.isWaitingForNext) {
        elements.startBtn.style.display = 'none';
        elements.pauseBtn.style.display = 'none';
    } else if (timerState.isRunning && !timerState.isPaused) {
        elements.startBtn.style.display = 'none';
        elements.pauseBtn.style.display = 'inline-block';
        elements.pauseBtn.textContent = '一時停止';
    } else if (timerState.isPaused) {
        elements.startBtn.style.display = 'inline-block';
        elements.startBtn.textContent = '再開';
        elements.pauseBtn.style.display = 'none';
    } else {
        elements.startBtn.style.display = 'inline-block';
        elements.startBtn.textContent = 'スタート';
        elements.pauseBtn.style.display = 'none';
        elements.resetBtn.textContent = 'リセット';
    }
}

/**
 * タイマーのメインループ
 */
function timerTick() {
    timerState.currentTime--;
    
    if (timerState.currentTime <= 3 && timerState.currentTime > 0) {
        voiceManager.countdown(timerState.currentTime);
    }
    
    if (timerState.currentTime <= 0) {
        handleTaskComplete();
    }
    
    updateDisplay();
}

/**
 * タスク完了時の処理
 */
function handleTaskComplete() {
    if (timerState.isPreparation) {
        // 準備完了 → 最初のタスク開始
        startTask(0);
    } else {
        // 現在のタスク完了
        if (timerState.executionMode === 'auto') {
            // 自動実行：自動的に次のタスクに進む
            proceedToNextTask();
        } else {
            // 手動実行：次へボタン待ち状態にする
            clearInterval(timerState.intervalId);
            timerState.isRunning = false;
            timerState.isWaitingForNext = true;
            voiceManager.announceTaskComplete(true);
            updateDisplay();
        }
    }
}

/**
 * 次のタスクに進む
 */
function proceedToNextTask() {
    timerState.currentTaskIndex++;
    
    if (timerState.currentTaskIndex < customTasks.length) {
        startTask(timerState.currentTaskIndex);
    } else {
        completeWorkout();
    }
}

/**
 * 指定されたタスクを開始
 */
function startTask(taskIndex) {
    timerState.isPreparation = false;
    timerState.currentTaskIndex = taskIndex;
    timerState.isWaitingForNext = false;
    
    const task = customTasks[taskIndex];
    timerState.currentTime = task.duration;
    
    voiceManager.announceTask(task, taskIndex + 1, customTasks.length);
    updateDisplay();
}

/**
 * ワークアウト完了
 */
function completeWorkout() {
    timerState.isRunning = false;
    timerState.isWaitingForNext = false;
    clearInterval(timerState.intervalId);
    
    voiceManager.speak('お疲れ様でした！ワークアウト完了です！');
    
    const totalTime = customTasks.reduce((sum, task) => sum + task.duration, 0);
    
    const message = `
🎉 ワークアウト完了！

📊 結果:
- 総タスク数: ${customTasks.length}
- 総実行時間: ${formatTime(totalTime)}
- 実行モード: ${timerState.executionMode === 'auto' ? '自動実行' : '手動実行'}

お疲れ様でした！💪
    `;
    
    alert(message);
    updateDisplay();
}

/**
 * タイマーを初期化
 */
function initializeTimer() {
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
    }
    
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.currentTaskIndex = 0;
    timerState.currentTime = customTasks.length > 0 ? customTasks[0].duration : 0;
    timerState.intervalId = null;
    timerState.isPreparation = false;
    timerState.isWaitingForNext = false;
    
    updateDisplay();
}

/**
 * 新しいセッションを開始
 */
function startNewSession() {
    if (customTasks.length === 0) {
        alert('タスクを追加してからスタートしてください！');
        return;
    }
    
    timerState.isRunning = true;
    timerState.isPaused = false;
    timerState.isPreparation = true;
    timerState.currentTime = APP_CONFIG.countdownFrom;
    timerState.isWaitingForNext = false;
    
    voiceManager.speak('3秒後にワークアウトを開始します。準備してください！');
    
    timerState.intervalId = setInterval(timerTick, APP_CONFIG.tickInterval);
    updateDisplay();
}

/**
 * スタートボタンのクリックハンドラ
 */
function handleStart() {
    if (timerState.isPaused) {
        timerState.isRunning = true;
        timerState.isPaused = false;
        timerState.intervalId = setInterval(timerTick, APP_CONFIG.tickInterval);
        voiceManager.speak('タイマーを再開します');
    } else if (timerState.currentTaskIndex >= customTasks.length) {
        initializeTimer();
        startNewSession();
    } else {
        startNewSession();
    }
    updateDisplay();
}

/**
 * 一時停止ボタンのクリックハンドラ
 */
function handlePause() {
    timerState.isRunning = false;
    timerState.isPaused = true;
    clearInterval(timerState.intervalId);
    voiceManager.speak('一時停止しました');
    updateDisplay();
}

/**
 * リセットボタンのクリックハンドラ
 */
function handleReset() {
    if (timerState.isRunning || timerState.isPaused || timerState.isWaitingForNext) {
        const confirmed = confirm('進行中のタイマーをリセットしますか？');
        if (!confirmed) return;
    }
    
    initializeTimer();
    voiceManager.speak('タイマーをリセットしました');
}

/**
 * 次のタスクボタンのクリックハンドラ
 */
function handleNextTask() {
    if (!timerState.isWaitingForNext) return;
    
    // タイマーを再開して次のタスクに進む
    timerState.isRunning = true;
    timerState.intervalId = setInterval(timerTick, APP_CONFIG.tickInterval);
    
    proceedToNextTask();
}

/**
 * タスクリストを表示
 */
function renderTaskList() {
    elements.taskList.innerHTML = '';
    
    customTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-details">
                <span class="task-number">${index + 1}</span>
                <input type="text" class="task-name-input" value="${task.name}" 
                       onchange="updateTaskName(${task.id}, this.value)">
                <input type="number" class="task-duration-input" value="${task.duration}" min="1" max="3600"
                       onchange="updateTaskDuration(${task.id}, this.value)">
                <span>秒</span>
            </div>
            <div class="task-actions">
                <button onclick="deleteTask(${task.id})" class="delete-btn">🗑️</button>
            </div>
        `;
        elements.taskList.appendChild(taskItem);
    });
}

/**
 * 新しいタスクを追加
 */
function addTask() {
    const newTask = {
        id: nextTaskId++,
        name: 'エクササイズ',
        duration: 30
    };
    customTasks.push(newTask);
    renderTaskList();
    initializeTimer();
}

/**
 * タスクを削除
 */
function deleteTask(taskId) {
    customTasks = customTasks.filter(task => task.id !== taskId);
    renderTaskList();
    initializeTimer();
}

/**
 * タスク名を更新
 */
function updateTaskName(taskId, newName) {
    const task = customTasks.find(t => t.id === taskId);
    if (task) {
        task.name = newName || 'エクササイズ';
        initializeTimer();
    }
}

/**
 * タスク時間を更新
 */
function updateTaskDuration(taskId, newDuration) {
    const task = customTasks.find(t => t.id === taskId);
    if (task) {
        task.duration = Math.max(1, parseInt(newDuration) || 30);
        initializeTimer();
    }
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    elements.startBtn.addEventListener('click', handleStart);
    elements.pauseBtn.addEventListener('click', handlePause);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.nextTaskBtn.addEventListener('click', handleNextTask);
    elements.addTaskBtn.addEventListener('click', addTask);
    
    // 設定表示切り替え
    elements.settingsToggleBtn.addEventListener('click', toggleSettings);
    
    // 実行モード切り替え
    elements.autoModeBtn.addEventListener('click', () => setExecutionMode('auto'));
    elements.manualModeBtn.addEventListener('click', () => setExecutionMode('manual'));
    
    elements.workoutNameInput.addEventListener('input', (e) => {
        timerState.workoutName = e.target.value || 'カスタムワークアウト';
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.target.tagName === 'INPUT') return;
        
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                if (timerState.isRunning) {
                    handlePause();
                } else {
                    handleStart();
                }
                break;
            case 'KeyR':
                event.preventDefault();
                handleReset();
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (timerState.isWaitingForNext) {
                    handleNextTask();
                }
                break;
            case 'KeyS':
                event.preventDefault();
                toggleSettings();
                break;
        }
    });
}

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log('HIIT Timer - 設定表示切り替え対応版を初期化中...');
    
    setExecutionMode('auto'); // デフォルトは自動実行
    renderTaskList();
    initializeTimer();
    setupEventListeners();
    
    console.log('✅ 初期化完了！');
}

// グローバル関数として公開
window.updateTaskName = updateTaskName;
window.updateTaskDuration = updateTaskDuration;
window.deleteTask = deleteTask;

// DOMContentLoadedイベントでアプリケーションを初期化
document.addEventListener('DOMContentLoaded', initializeApp);