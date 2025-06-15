/**
 * HIIT Timer - 設定表示切り替え対応版
 * 自動/手動実行 + 設定表示のオン・オフ機能
 */

// アプリケーション設定
const APP_CONFIG = {
    tickInterval: 100, // 100msで高精度チェック
    displayUpdateInterval: 1000, // 表示更新は1秒間隔
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
    isWaitingForNext: false, // 手動モードでタスク完了待ち状態
    infiniteLoop: false, // 無限ループモード
    loopCount: 0, // 完了したループの回数
    startTime: null, // タイマー開始時刻
    expectedEndTime: null // 予定終了時刻
};

// UI状態
let uiState = {
    currentScreen: 'home', // 'home', 'timer', 'settings'
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

// 保存されたワークアウト
let savedWorkouts = JSON.parse(localStorage.getItem('savedWorkouts') || '[]');
let currentWorkoutId = localStorage.getItem('lastUsedWorkoutId') || null;

// DOM要素の取得
const elements = {
    // 画面要素
    homeDisplay: document.getElementById('homeDisplay'),
    mainDisplay: document.getElementById('mainDisplay'),
    
    // ホーム画面の要素
    workoutList: document.getElementById('workoutList'),
    createWorkoutBtn: document.getElementById('createWorkoutBtn'),
    homeBtn: document.getElementById('homeBtn'),
    
    // メイン画面の要素
    timeDisplay: document.querySelector('#mainDisplay .time'),
    phaseDisplay: document.querySelector('#mainDisplay .phase'),
    currentTaskDisplay: document.querySelector('#mainDisplay .current-task'),
    taskNameDisplay: document.querySelector('#mainDisplay .task-name'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    nextTaskBtn: document.getElementById('nextTaskBtn'),
    manualControls: document.getElementById('manualControls'),
    completionBtn: document.getElementById('completionBtn'),
    completionControls: document.getElementById('completionControls'),
    
    
    // 設定関連の要素
    settingsToggleBtn: document.getElementById('settingsToggleBtn'),
    taskSettings: document.getElementById('taskSettings'),
    workoutNameInput: document.getElementById('workoutName'),
    taskList: document.getElementById('taskList'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    autoModeBtn: document.getElementById('autoModeBtn'),
    manualModeBtn: document.getElementById('manualModeBtn'),
    infiniteLoopToggle: document.getElementById('infiniteLoopToggle'),
    skipTaskBtn: document.getElementById('skipTaskBtn'),
    resetBtnSettings: document.getElementById('resetBtnSettings'),
    saveWorkoutBtn: document.getElementById('saveWorkoutBtn')
};

/**
 * 音声合成（改良版）
 */
const voiceManager = {
    isSupported: 'speechSynthesis' in window,
    lastCountdownTime: 0, // 重複防止用
    
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
        this.speak(task.name);
    },
    
    countdown(number) {
        const now = Date.now();
        // 500ms以内の重複音声を防止
        if (now - this.lastCountdownTime < 500) {
            console.log(`カウントダウン音声スキップ: ${number}秒（重複防止）`);
            return;
        }
        
        this.lastCountdownTime = now;
        console.log(`カウントダウン音声実行: ${number}秒`);
        this.speak(number.toString());
    },
    
    announceTaskComplete(isManual) {
        if (isManual) {
            this.speak('タスク完了');
        }
    },
    
    announceLoopStart(loopNumber) {
        this.speak(`${loopNumber}周目を開始します！`);
    },
    
    announceLoopComplete(loopNumber) {
        this.speak(`${loopNumber}周目が完了しました！`);
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
/**
 * 画面を切り替える
 */
function showScreen(screenName) {
    // 全ての画面を非表示
    elements.homeDisplay.classList.add('hidden');
    elements.mainDisplay.classList.add('hidden');
    elements.taskSettings.classList.remove('show');
    elements.taskSettings.classList.add('hidden');
    
    uiState.currentScreen = screenName;
    
    const settingsIcon = elements.settingsToggleBtn.querySelector('.settings-icon');
    const settingsText = elements.settingsToggleBtn.querySelector('.settings-text');
    
    switch (screenName) {
        case 'home':
            elements.homeDisplay.classList.remove('hidden');
            elements.settingsToggleBtn.style.display = 'none';
            break;
        case 'timer':
            elements.mainDisplay.classList.remove('hidden');
            elements.settingsToggleBtn.style.display = 'flex';
            settingsIcon.textContent = '⚙️';
            settingsText.textContent = '';
            break;
        case 'settings':
            elements.taskSettings.classList.remove('hidden');
            elements.taskSettings.classList.add('show');
            elements.settingsToggleBtn.style.display = 'flex';
            settingsIcon.textContent = '❌';
            settingsText.textContent = '閉じる';
            break;
    }
}

function toggleSettings() {
    if (uiState.currentScreen === 'settings') {
        showScreen('timer');
    } else {
        showScreen('settings');
    }
}

/**
 * 実行モードを設定
 */
function setExecutionMode(mode) {
    timerState.executionMode = mode;
    
    // ボタンの状態更新
    elements.autoModeBtn.classList.toggle('active', mode === 'auto');
    elements.manualModeBtn.classList.toggle('active', mode === 'manual');
    
    
    console.log(`実行モードを ${mode} に設定しました`);
}

/**
 * 表示を更新
 */
function updateDisplay() {
    const timeText = formatTime(timerState.currentTime);
    
    // 時間表示
    elements.timeDisplay.textContent = timeText;
    
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
        let taskDisplay = `タスク ${timerState.currentTaskIndex + 1} / ${customTasks.length}`;
        if (timerState.infiniteLoop && timerState.loopCount > 0) {
            taskDisplay += ` (${timerState.loopCount + 1}周目)`;
        }
        elements.currentTaskDisplay.textContent = taskDisplay;
        elements.taskNameDisplay.textContent = currentTask.name;
    } else {
        elements.currentTaskDisplay.textContent = 'ワークアウト完了';
        elements.taskNameDisplay.textContent = 'お疲れ様でした！';
    }
    
    // 手動コントロールの表示/非表示
    const showManualControls = timerState.executionMode === 'manual' && 
                              timerState.isWaitingForNext && 
                              timerState.currentTaskIndex < customTasks.length;
    elements.manualControls.style.display = showManualControls ? 'block' : 'none';
    
    // 完了コントロールの表示/非表示
    const showCompletionControls = timerState.currentTaskIndex >= customTasks.length && 
                                  !timerState.isRunning;
    elements.completionControls.style.display = showCompletionControls ? 'block' : 'none';
    
    // スキップボタンの状態更新
    const canSkip = timerState.isRunning && 
                   !timerState.isPreparation && 
                   !timerState.isWaitingForNext && 
                   timerState.currentTaskIndex < customTasks.length;
    elements.skipTaskBtn.disabled = !canSkip;
    
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
    }
}

/**
 * 高精度タイマー開始
 */
function startHighPrecisionTimer() {
    clearInterval(timerState.intervalId);
    
    function highPrecisionTick() {
        if (!timerState.isRunning) {
            return; // タイマーが停止していれば終了
        }
        
        timerTick();
        
        // 高精度で継続実行
        if (timerState.isRunning) {
            timerState.intervalId = requestAnimationFrame(highPrecisionTick);
        }
    }
    
    // 初回実行
    timerState.intervalId = requestAnimationFrame(highPrecisionTick);
}

/**
 * タイマーのメインループ（高精度・バックグラウンド対応版）
 */
function timerTick() {
    if (!timerState.isRunning) {
        return; // タイマーが停止していれば終了
    }
    
    const now = Date.now();
    const remainingTime = Math.max(0, timerState.expectedEndTime - now);
    const newCurrentTime = Math.ceil(remainingTime / 1000);
    
    // 時間が変化した場合の処理
    if (newCurrentTime !== timerState.currentTime) {
        const timeDiff = timerState.currentTime - newCurrentTime;
        const previousTime = timerState.currentTime;
        timerState.currentTime = newCurrentTime;
        
        // バックグラウンド検出（3秒以上のズレ、かつ正常なカウントダウンではない場合）
        const isBackgroundReturn = timeDiff > 3 && timeDiff > 1;
        if (isBackgroundReturn) {
            console.log(`バックグラウンド復帰検出: ${timeDiff}秒の補正`);
            // バックグラウンド復帰時は音声なしで静かに補正
        }
        
        // 通常のカウントダウン音声（3秒、2秒、1秒）
        // バックグラウンド復帰時ではなく、正常な1秒減少時のみ
        const isNormalCountdown = timeDiff === 1 && !isBackgroundReturn;
        if (timerState.currentTime <= 3 && timerState.currentTime > 0 && isNormalCountdown) {
            console.log(`カウントダウン音声: ${timerState.currentTime}秒`);
            voiceManager.countdown(timerState.currentTime);
        }
        
        // タイマー終了処理
        if (timerState.currentTime <= 0) {
            handleTaskComplete();
            return;
        }
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
            cancelAnimationFrame(timerState.intervalId);
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
    } else if (timerState.infiniteLoop) {
        // 無限ループモード：最初のタスクから再開
        timerState.loopCount++;
        timerState.currentTaskIndex = 0;
        startTask(0);
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
    
    // 高精度タイマーのための時刻設定
    timerState.startTime = Date.now();
    timerState.expectedEndTime = timerState.startTime + (task.duration * 1000);
    
    voiceManager.announceTask(task, taskIndex + 1, customTasks.length);
    updateDisplay();
}

/**
 * ワークアウト完了
 */
function completeWorkout() {
    timerState.isRunning = false;
    timerState.isWaitingForNext = false;
    
    // タイマー停止
    clearInterval(timerState.intervalId);
    cancelAnimationFrame(timerState.intervalId);
    
    voiceManager.speak('お疲れ様でした！ワークアウト完了です！');
    
    updateDisplay();
}

/**
 * タイマーを初期化
 */
function initializeTimer() {
    // タイマー停止（両方のタイマータイプに対応）
    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        cancelAnimationFrame(timerState.intervalId);
    }
    
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.currentTaskIndex = 0;
    timerState.currentTime = customTasks.length > 0 ? customTasks[0].duration : 0;
    timerState.intervalId = null;
    timerState.isPreparation = false;
    timerState.isWaitingForNext = false;
    timerState.loopCount = 0;
    timerState.startTime = null;
    timerState.expectedEndTime = null;
    
    updateDisplay();
}

/**
 * 新しいセッションを開始（音声完了待機対応）
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
    
    // 音声読み上げ完了待機の実装
    function startCountdownAfterSpeech() {
        return new Promise((resolve) => {
            if (!voiceManager.isSupported) {
                console.log('音声通知:', `${timerState.workoutName}を開始します`);
                resolve();
                return;
            }
            
            // 既存の音声をキャンセル
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(`${timerState.workoutName}を開始します`);
            utterance.lang = 'ja-JP';
            utterance.rate = 1.0;
            utterance.volume = 0.8;
            
            // 音声完了のイベントハンドラ
            utterance.onend = () => {
                console.log('音声読み上げ完了 - カウントダウン開始');
                resolve();
            };
            
            // 音声エラー時の処理
            utterance.onerror = (error) => {
                console.warn('音声読み上げエラー:', error);
                resolve(); // エラーでもカウントダウンを開始
            };
            
            // タイムアウト処理（3秒で強制開始に短縮）
            const timeout = setTimeout(() => {
                console.warn('音声読み上げタイムアウト - カウントダウンを強制開始');
                resolve();
            }, 3000);
            
            utterance.onend = () => {
                clearTimeout(timeout);
                console.log('音声読み上げ完了 - カウントダウン開始');
                resolve();
            };
            
            utterance.onerror = (error) => {
                clearTimeout(timeout);
                console.warn('音声読み上げエラー:', error);
                resolve(); // エラーでもカウントダウンを開始
            };
            
            speechSynthesis.speak(utterance);
        });
    }
    
    // 音声読み上げ完了後にカウントダウン開始
    startCountdownAfterSpeech().then(() => {
        if (!timerState.isRunning) return; // 途中でキャンセルされた場合
        
        console.log('準備カウントダウン開始');
        
        // 高精度タイマーのための時刻設定
        timerState.startTime = Date.now();
        timerState.expectedEndTime = timerState.startTime + (APP_CONFIG.countdownFrom * 1000);
        
        // 初回の3秒カウントダウン音声を即座に再生
        if (timerState.currentTime <= 3 && timerState.currentTime > 0) {
            console.log(`初回カウントダウン音声: ${timerState.currentTime}秒`);
            voiceManager.countdown(timerState.currentTime);
        }
        
        // 高精度タイマーを開始
        clearInterval(timerState.intervalId); // 既存のタイマーをクリア
        startHighPrecisionTimer();
        
        updateDisplay();
    });
    
    // 初期表示を更新
    updateDisplay();
}

/**
 * スタートボタンのクリックハンドラ（高精度対応）
 */
function handleStart() {
    if (timerState.isPaused) {
        timerState.isRunning = true;
        timerState.isPaused = false;
        
        // 一時停止から再開時の時刻調整
        timerState.startTime = Date.now();
        timerState.expectedEndTime = timerState.startTime + (timerState.currentTime * 1000);
        
        // 高精度タイマーで再開
        clearInterval(timerState.intervalId);
        startHighPrecisionTimer();
        voiceManager.speak('タイマーを再開');
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
    
    // タイマー停止（setIntervalとrequestAnimationFrame両方に対応）
    clearInterval(timerState.intervalId);
    cancelAnimationFrame(timerState.intervalId);
    
    voiceManager.speak('一時停止');
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
}

/**
 * 次のタスクボタンのクリックハンドラ（高精度対応）
 */
function handleNextTask() {
    if (!timerState.isWaitingForNext) return;
    
    // タイマーを再開して次のタスクに進む
    timerState.isRunning = true;
    clearInterval(timerState.intervalId);
    startHighPrecisionTimer();
    
    proceedToNextTask();
}

/**
 * 完了ボタンのクリックハンドラ
 */
function handleCompletion() {
    // 最初の画面に戻る（タイマーを初期化）
    initializeTimer();
}

/**
 * タスクスキップボタンのクリックハンドラ
 */
function handleSkipTask() {
    if (!timerState.isRunning || timerState.isPreparation || timerState.isWaitingForNext) {
        return;
    }
    
    // 確認ダイアログ
    const currentTask = customTasks[timerState.currentTaskIndex];
    const confirmed = confirm(`現在のタスク「${currentTask.name}」をスキップして次のタスクに進みますか？`);
    
    if (!confirmed) return;
    
    // 現在のタスクを強制完了
    handleTaskComplete();
}

/**
 * タスクリストを表示
 */
function renderTaskList() {
    elements.taskList.innerHTML = '';
    
    customTasks.forEach((task, index) => {
        const minutes = Math.floor(task.duration / 60);
        const seconds = task.duration % 60;
        
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-details">
                <span class="task-number">${index + 1}</span>
                <input type="text" class="task-name-input" value="${task.name}" 
                       onchange="updateTaskName(${task.id}, this.value)">
                <div class="time-inputs">
                    <input type="number" class="task-minutes-input" value="${minutes}" min="0" max="59"
                           onchange="updateTaskTime(${task.id}, this.value, null)" placeholder="0">
                    <span class="time-label">分</span>
                    <input type="number" class="task-seconds-input" value="${seconds}" min="0" max="59"
                           onchange="updateTaskTime(${task.id}, null, this.value)" placeholder="0">
                    <span class="time-label">秒</span>
                </div>
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
 * タスク時間を更新（分・秒対応）
 */
function updateTaskTime(taskId, newMinutes, newSeconds) {
    const task = customTasks.find(t => t.id === taskId);
    if (!task) return;
    
    let minutes = newMinutes !== null ? parseInt(newMinutes) || 0 : Math.floor(task.duration / 60);
    let seconds = newSeconds !== null ? parseInt(newSeconds) || 0 : task.duration % 60;
    
    // 入力値の検証
    minutes = Math.max(0, Math.min(59, minutes));
    seconds = Math.max(0, Math.min(59, seconds));
    
    // 合計秒数を計算（最低1秒に設定）
    const totalSeconds = Math.max(1, minutes * 60 + seconds);
    
    task.duration = totalSeconds;
    initializeTimer();
}

/**
 * 旧関数（後方互換性のため残す）
 */
function updateTaskDuration(taskId, newDuration) {
    const task = customTasks.find(t => t.id === taskId);
    if (task) {
        task.duration = Math.max(1, parseInt(newDuration) || 30);
        initializeTimer();
    }
}

/**
 * 無限ループモードを切り替え
 */
function toggleInfiniteLoop() {
    timerState.infiniteLoop = elements.infiniteLoopToggle.checked;
    console.log(`無限ループモード: ${timerState.infiniteLoop ? '有効' : '無効'}`);
}

/**
 * ワークアウトを保存
 */
function saveWorkout() {
    const workoutName = elements.workoutNameInput.value.trim();
    if (!workoutName) {
        alert('ワークアウト名を入力してください');
        return;
    }
    
    if (customTasks.length === 0) {
        alert('少なくとも1つのタスクを追加してください');
        return;
    }
    
    const workout = {
        id: Date.now(),
        name: workoutName,
        tasks: [...customTasks],
        executionMode: timerState.executionMode,
        infiniteLoop: timerState.infiniteLoop,
        createdAt: new Date().toISOString()
    };
    
    // 同じ名前のワークアウトがある場合は更新
    const existingIndex = savedWorkouts.findIndex(w => w.name === workoutName);
    if (existingIndex >= 0) {
        const confirmed = confirm(`「${workoutName}」は既に存在します。上書きしますか？`);
        if (!confirmed) return;
        savedWorkouts[existingIndex] = workout;
    } else {
        savedWorkouts.push(workout);
    }
    
    localStorage.setItem('savedWorkouts', JSON.stringify(savedWorkouts));
    currentWorkoutId = workout.id;
    localStorage.setItem('lastUsedWorkoutId', currentWorkoutId);
    renderWorkoutList();
    console.log(`ワークアウト「${workoutName}」を保存しました`);
}

/**
 * ホーム画面のワークアウト一覧を表示
 */
function renderWorkoutList() {
    elements.workoutList.innerHTML = '';
    
    if (savedWorkouts.length === 0) {
        elements.workoutList.innerHTML = `
            <div class="empty-state">
                <h3>📝 ワークアウトがありません</h3>
                <p>新しいワークアウトを作成して始めましょう</p>
            </div>
        `;
        return;
    }
    
    savedWorkouts.forEach(workout => {
        const workoutItem = document.createElement('div');
        workoutItem.className = `workout-item ${workout.id === currentWorkoutId ? 'selected' : ''}`;
        
        const totalTime = workout.tasks.reduce((sum, task) => sum + task.duration, 0);
        
        workoutItem.innerHTML = `
            <div class="workout-info" onclick="selectWorkoutFromHome(${workout.id})">
                <div class="workout-name">${workout.name}</div>
                <div class="workout-details">
                    ${workout.tasks.length}タスク・${formatTime(totalTime)}・${workout.executionMode === 'auto' ? '自動' : '手動'}${workout.infiniteLoop ? '・ループ' : ''}
                </div>
            </div>
            <div class="workout-actions">
                <button onclick="deleteWorkout(${workout.id})" class="delete-btn">🗑️</button>
            </div>
        `;
        
        elements.workoutList.appendChild(workoutItem);
    });
}

/**
 * ワークアウトを選択
 */
function selectWorkout(workoutId) {
    const workout = savedWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // 現在のワークアウトを選択したワークアウトに置き換え
    customTasks = [...workout.tasks];
    timerState.workoutName = workout.name;
    timerState.executionMode = workout.executionMode;
    timerState.infiniteLoop = workout.infiniteLoop;
    currentWorkoutId = workout.id;
    
    // UI更新
    elements.workoutNameInput.value = workout.name;
    elements.infiniteLoopToggle.checked = workout.infiniteLoop;
    setExecutionMode(workout.executionMode);
    renderTaskList();
    renderWorkoutList();
    initializeTimer();
    
    // 最後に使用したワークアウトとして記録
    localStorage.setItem('lastUsedWorkoutId', currentWorkoutId);
    
    console.log(`ワークアウト「${workout.name}」を選択しました`);
}

/**
 * ホーム画面からワークアウトを選択してタイマー画面に移動
 */
function selectWorkoutFromHome(workoutId) {
    selectWorkout(workoutId);
    showScreen('timer');
}

/**
 * 新しいワークアウト作成ボタンのハンドラ
 */
function handleCreateWorkout() {
    // デフォルトのタスクで新しいワークアウトを開始
    customTasks = [
        { id: Date.now(), name: 'エクササイズ', duration: 30 }
    ];
    timerState.workoutName = 'カスタムワークアウト';
    timerState.executionMode = 'auto';
    timerState.infiniteLoop = false;
    currentWorkoutId = null;
    
    // UI更新
    elements.workoutNameInput.value = timerState.workoutName;
    elements.infiniteLoopToggle.checked = timerState.infiniteLoop;
    setExecutionMode(timerState.executionMode);
    renderTaskList();
    initializeTimer();
    
    showScreen('settings');
}

/**
 * 完了ボタンクリック後の処理を修正
 */
function handleCompletion() {
    // ホーム画面に戻る
    showScreen('home');
}

/**
 * ホームボタンのクリックハンドラ
 */
function handleHome() {
    // タイマーが実行中の場合は確認
    if (timerState.isRunning) {
        const confirmed = confirm('タイマーが実行中です。ホーム画面に戻りますか？');
        if (!confirmed) return;
        
        // タイマーを停止
        timerState.isRunning = false;
        timerState.isPaused = false;
        clearInterval(timerState.intervalId);
    }
    
    showScreen('home');
}

/**
 * ワークアウトを削除
 */
function deleteWorkout(workoutId) {
    const workout = savedWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    const confirmed = confirm(`ワークアウト「${workout.name}」を削除しますか？`);
    if (!confirmed) return;
    
    savedWorkouts = savedWorkouts.filter(w => w.id !== workoutId);
    localStorage.setItem('savedWorkouts', JSON.stringify(savedWorkouts));
    
    if (currentWorkoutId === workoutId) {
        currentWorkoutId = null;
        localStorage.removeItem('lastUsedWorkoutId');
    }
    
    renderWorkoutList();
    console.log(`ワークアウト「${workout.name}」を削除しました`);
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // メイン画面のボタン
    elements.startBtn.addEventListener('click', handleStart);
    elements.pauseBtn.addEventListener('click', handlePause);
    elements.nextTaskBtn.addEventListener('click', handleNextTask);
    elements.completionBtn.addEventListener('click', handleCompletion);
    
    
    // その他のボタン
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.skipTaskBtn.addEventListener('click', handleSkipTask);
    elements.resetBtnSettings.addEventListener('click', handleReset);
    elements.saveWorkoutBtn.addEventListener('click', saveWorkout);
    elements.createWorkoutBtn.addEventListener('click', handleCreateWorkout);
    elements.homeBtn.addEventListener('click', handleHome);
    
    // 設定表示切り替え
    elements.settingsToggleBtn.addEventListener('click', toggleSettings);
    
    // 実行モード切り替え
    elements.autoModeBtn.addEventListener('click', () => setExecutionMode('auto'));
    elements.manualModeBtn.addEventListener('click', () => setExecutionMode('manual'));
    
    // 無限ループ切り替え
    elements.infiniteLoopToggle.addEventListener('change', toggleInfiniteLoop);
    
    elements.workoutNameInput.addEventListener('input', (e) => {
        timerState.workoutName = e.target.value || 'カスタムワークアウト';
    });
}

/**
 * 最後に使用したワークアウトを読み込み
 */
function loadLastUsedWorkout() {
    if (currentWorkoutId) {
        const lastWorkout = savedWorkouts.find(w => w.id === parseInt(currentWorkoutId));
        if (lastWorkout) {
            selectWorkout(lastWorkout.id);
            console.log(`最後に使用したワークアウト「${lastWorkout.name}」を読み込みました`);
            return true;
        } else {
            // 保存されたワークアウトが見つからない場合
            currentWorkoutId = null;
            localStorage.removeItem('lastUsedWorkoutId');
        }
    }
    return false;
}

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log('HIIT Timer - 設定表示切り替え対応版を初期化中...');
    
    setExecutionMode('auto'); // デフォルトは自動実行
    renderWorkoutList();
    
    // 最後に使用したワークアウトを読み込み、タイマー画面に移動
    if (loadLastUsedWorkout()) {
        showScreen('timer');
    } else {
        // 保存されたワークアウトがない場合はホーム画面を表示
        renderTaskList();
        initializeTimer();
        showScreen('home');
    }
    
    setupEventListeners();
    
    console.log('✅ 初期化完了！');
}

// グローバル関数として公開
window.updateTaskName = updateTaskName;
window.updateTaskDuration = updateTaskDuration;
window.updateTaskTime = updateTaskTime;
window.deleteTask = deleteTask;
window.selectWorkout = selectWorkout;
window.selectWorkoutFromHome = selectWorkoutFromHome;
window.deleteWorkout = deleteWorkout;

// DOMContentLoadedイベントでアプリケーションを初期化
document.addEventListener('DOMContentLoaded', initializeApp);