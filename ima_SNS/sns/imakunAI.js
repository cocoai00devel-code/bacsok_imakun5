/* imakunAI.js */

// --- 設定とグローバル変数 ---

// VercelのAPIエンドポイント（最新のものに更新）
const LLM_API_URL = "https://ks903-l1noby5fs-takeshi-kumuras-projects.vercel.app/api/chat";

// 会話ログ送信API & IoT制御API（既存のHuggingFace等）
const LOG_API_URL = "https://atjmuwnwmtjw-hello.hf.space/llm/log_conversation";
const MQTT_API_URL = "https://atjmuwnwmtjw-hello.hf.space/iot/control";

// ★ 自動送信先メールアドレス ★
const TARGET_EMAIL = "imakugijikirokusyu@gmail.com";

let recognition = null;
let isListening = false;
let isSpeaking = false;
const synth = window.speechSynthesis;

// DOM要素の取得
const chatLog = document.getElementById('chat-log');
const voiceInput = document.getElementById('voice-input');
const sendBtn = document.getElementById('send-btn');
const logBtn = document.getElementById('log-btn'); 
const sendIcon = document.getElementById('send-icon');
const statusBox = document.getElementById('status');
const messageBox = document.getElementById('message-box');

// 会話履歴を保持する配列
let chatHistory = []; 

// --- UIヘルパー関数 ---
function setStatus(message, isListeningStatus = false) {
    statusBox.textContent = message;
    statusBox.style.opacity = '1';
    if (sendBtn) sendBtn.classList.toggle('listening', isListeningStatus);
    if (sendIcon) sendIcon.textContent = isListeningStatus ? '🔴' : '🎤';
}

function setStandbyStatus() {
    setTimeout(() => {
        if (!isListening && !isSpeaking) {
            setStatus('スタンバイ中', false);
        }
    }, 100);
}

function showMessageBox(message) {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.classList.add('visible');
    setTimeout(() => {
        messageBox.classList.remove('visible');
    }, 5000);
}

/**
 * メッセージをチャットログに追加し、自動スクロールする
 */
function appendMessage(role, content) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${role}-message`);
    
    // 改行コードを維持して表示
    messageElement.style.whiteSpace = 'pre-wrap';
    messageElement.textContent = content; 
    
    chatLog.appendChild(messageElement);
    
    // 描画を待ってから最下部へスクロール
    setTimeout(() => {
        chatLog.scrollTo({
            top: chatLog.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

function recordMessage(role, content) {
    chatHistory.push({
        role: role,
        content: content,
        timestamp: Date.now() / 1000
    });
}

// --- API連携関数 ---

/**
 * LLM (Vercel/Groq) へのリクエスト
 */
async function sendLLMRequest(prompt) {
    if (!prompt.trim()) return;

    appendMessage('user', prompt);
    recordMessage('user', prompt);
    
    setStatus('🤖 監査思考中...');
    voiceInput.value = '';
    
    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        if (!response.ok) {
            // Vercel APIからのカスタムエラーメッセージ（KS-903等）を抽出
            throw new Error(data.message || `API Error ${response.status}`);
        }

        // ★重要: Vercel版のレスポンスフィールドは "answer" です
        const aiResponse = data.answer || data.text || "応答が得られませんでした。";

        appendMessage('ai', aiResponse);
        recordMessage('ai', aiResponse);
        
        speak(aiResponse);
        
        // ログを自動送信
        await sendLogPerTurn();

    } catch (error) {
        console.error("LLMリクエストエラー:", error);
        const errorMessage = `【システム不具合】${error.message}`;
        appendMessage('ai', errorMessage);
        speak("システムエラーが発生しました。");
    } finally {
        setStandbyStatus();
    }
}

/**
 * 会話ログを外部APIへ送信
 */
async function sendLogPerTurn() {
    try {
        await fetch(LOG_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                history: chatHistory, 
                target_email: TARGET_EMAIL 
            })
        });
        console.log(`✅ ログ自動送信完了`);
    } catch (error) {
        console.error("ログ送信失敗:", error);
    }
}

// --- 音声合成 (TTS) ---
function speak(text) {
    if (synth.speaking) synth.cancel();
    
    isSpeaking = true;
    setStatus('🔊 発話中...');
    
    // マークダウン記号などを除外して読み上げる（任意）
    const cleanText = text.replace(/[#*`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    
    const voices = synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Kyoko') || v.name.includes('Google 日本語'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
        isSpeaking = false;
        setStandbyStatus();
    };
    synth.speak(utterance);
}

// --- 音声認識 (STT) ---
function startRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        showMessageBox("音声認識非対応のブラウザです。");
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    
    recognition.onstart = () => {
        isListening = true;
        setStatus('👂 リスニング中...', true);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendLLMRequest(transcript);
    };

    recognition.onend = () => {
        isListening = false;
        setStandbyStatus();
    };

    recognition.start();
}

// --- イベントリスナー ---
sendBtn.addEventListener("click", () => {
    if (isListening) {
        recognition.stop();
    } else if (voiceInput.value.trim() !== "") {
        sendLLMRequest(voiceInput.value);
    } else {
        startRecognition();
    }
});

voiceInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && voiceInput.value.trim() !== "") {
        sendLLMRequest(voiceInput.value);
    }
});

// 初期化
window.onload = () => {
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = setStandbyStatus;
    }
    setStandbyStatus();
};



// // imakunAI.js
// /* <script> */
//         // // --- 設定とグローバル変数 ---
//         // const LLM_API_URL = "/llm/generate";
//         // const LOG_API_URL = "/log_conversation";
//         // const LLM_API_URL = "https://atjmuwnwmtjw-nose.hf.space/llm/generate";       
//         // const LLM_API_URL = "https://atjmuwnwmtjw-nose.hf.space/llm/log_conversation;
//         // const MQTT_API_URL = "https://atjmuwnwmtjw-nose.hf.space/iot/control"; 
// 　　
//         // --- 設定とグローバル変数 ---
//         // LLM応答生成API (以前のLLM_API_URLに対応)
//         // const LLM_API_URL = "https://atjmuwnwmtjw-hello.hf.space/llm/generate";
        
//         // 会話ログ送信API (以前のLOG_API_URLに対応)
//         // const LOG_API_URL = "https://atjmuwnwmtjw-hello.hf.space/llm/log_conversation";
        
//         // IoT制御API
//         // const MQTT_API_URL = "https://atjmuwnwmtjw-hello.hf.space/iot/control";


//         // --- 設定とグローバル変数 ---

// // 【修正前】
// // const LLM_API_URL = "https://atjmuwnwmtjw-hello.hf.space/llm/generate";

// // 【修正後】VercelのURLに書き換え
// const LLM_API_URL = "https://ks903-api.vercel.app/api/chat";


// // 会話ログ送信API (ここは既存のままでも、Vercel側にログ機能を作ったなら書き換えます)
// const LOG_API_URL = "https://atjmuwnwmtjw-hello.hf.space/llm/log_conversation";

// // IoT制御API (ここも既存のまま)
// const MQTT_API_URL = "https://atjmuwnwmtjw-hello.hf.space/iot/control";
//         // ★ 自動送信先メールアドレス ★
//         const TARGET_EMAIL = "imakugijikirokusyu@gmail.com";

//         let recognition = null;
//         let isListening = false;
//         let isSpeaking = false;
//         const synth = window.speechSynthesis;
//         const chatLog = document.getElementById('chat-log');
//         const voiceInput = document.getElementById('voice-input');
//         const sendBtn = document.getElementById('send-btn');
//         const logBtn = document.getElementById('log-btn'); 
//         const sendIcon = document.getElementById('send-icon');
//         const statusBox = document.getElementById('status');
//         const messageBox = document.getElementById('message-box');

//         // 会話履歴を保持する配列
//         let chatHistory = []; 

//         // --- UIヘルパー関数 ---
//         function setStatus(message, isListeningStatus = false) {
//             statusBox.textContent = message;
//             statusBox.style.opacity = '1';
//             sendBtn.classList.toggle('listening', isListeningStatus);
//             sendIcon.textContent = isListeningStatus ? '🔴' : '🎤';
//         }

//         function setStandbyStatus() {
//             setTimeout(() => {
//                 if (!isListening && !isSpeaking) {
//                     setStatus('スタンバイ中', false);
//                 }
//             }, 100);
//         }

//         function showMessageBox(message) {
//             messageBox.textContent = message;
//             messageBox.classList.add('visible');
//             setTimeout(() => {
//                 messageBox.classList.remove('visible');
//             }, 5000);
//         }

//         // imakunAI.js の appendMessage 関数を修正

//         /**
//          * メッセージをチャットログに追加し、
//          * 22文字ごとの改行を維持して最後まで表示させる
//          */
//         function appendMessage(role, content) {
//             const messageElement = document.createElement('div');
            
//             // ロールに応じたクラス（user-message / ai-message）を付与
//             messageElement.classList.add('chat-message', `${role}-message`);
            
//             // 【重要】22文字ごとの改行を含むテキストをそのまま流し込む
//             // CSSの white-space: pre-wrap と組み合わさることで全表示されます
//             messageElement.textContent = content; 
            
//             chatLog.appendChild(messageElement);
            
//             // 【合体ポイント】
//             // 描画の完了を待ち、確実に回答の「最後（最下部）」までスクロール
//             // 100msの待機時間を設けることで、長文でも失敗を防ぎます
//             setTimeout(() => {
//                 chatLog.scrollTo({
//                     top: chatLog.scrollHeight,
//                     behavior: 'smooth' // スムーズにスクロールさせる
//                 });
//             }, 100);
//         }

//         // 履歴を記録する関数
//         function recordMessage(role, content) {
//             chatHistory.push({
//                 role: role,
//                 content: content,
//                 timestamp: Date.now() / 1000 // 秒単位のUnixタイムスタンプ
//             });
//         }

//         // ★ 新規追加: LLM応答後に自動でログを送信する関数 ★
//         async function sendLogPerTurn() {
//             // chatHistoryの全履歴を指定メールアドレス宛に自動送信（シミュレーション）
//             setStatus('📧 ログを自動送信中...');
            
//             try {
//                 const response = await fetch(LOG_API_URL, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ 
//                         history: chatHistory, 
//                         target_email: TARGET_EMAIL 
//                     })
//                 });

//                 // if (!response.ok) {
//                 //     const errorDetail = (await response.json()).detail || response.statusText;
//                 //     throw new Error(`API Error ${response.status}: ${errorDetail}`);
//                 // }
//                 // sendLLMRequest 関数内
//                 // ...
//                 if (!response.ok) {
//                     let errorDetail = response.statusText;
                    
//                     // サーバーがJSONを返す可能性があるか試す
//                     try {
//                         const errorData = await response.json();
//                         // 'detail' フィールドがあるか確認するなど
//                         errorDetail = errorData.detail || JSON.stringify(errorData);
//                     } catch (e) {
//                         // JSON解析に失敗した場合（HTMLが返された場合など）は何もしない
//                         console.error("エラーレスポンスがJSONではありませんでした:", e);
//                         // response.text() を使ってHTML全体をログに出力しても良い
//                     }
                    
//                     throw new Error(`API Error ${response.status} (${response.statusText}): ${errorDetail}`);
//                 }
                
//                 // ...

//                 const data = await response.json();
                
//                 // 自動送信の成功はコンソールにのみ記録
//                 console.log(`✅ 自動ログ送信成功。ターゲット: ${TARGET_EMAIL}。メッセージ: ${data.message}`);
                
//             } catch (error) {
//                 console.error("自動ログ送信リクエストエラー:", error);
//                 // ユーザーには目立たないようにする
//             } finally {
//                 // setStandbyStatus() は sendLLMRequest の finally で呼ばれる
//             }
//         }

//         // --- LLM (Gemini) 処理 ---

//         async function sendLLMRequest(prompt) {
//             if (!prompt.trim()) return;

//             // ユーザーメッセージをUIに追加
//             appendMessage('user', prompt);
//             // 履歴に記録
//             recordMessage('user', prompt);
            
//             setStatus('🤖 応答を生成中...');
//             voiceInput.value = '';
            
//             try {
//                 const response = await fetch(LLM_API_URL, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         // Basic認証はブラウザが自動で処理するため、ここではCredentialsは不要
//                     },
//                     body: JSON.stringify({ prompt: prompt, max_length: 1000 })
//                 });

//                 // if (!response.ok) {
//                 //     const errorDetail = (await response.json()).detail || response.statusText;
//                 //     throw new Error(`API Error ${response.status}: ${errorDetail}`);
//                 // }
//                 // sendLLMRequest 関数内
//                 // ...
//                 if (!response.ok) {
//                     let errorDetail = response.statusText;
                    
//                     // サーバーがJSONを返す可能性があるか試す
//                     try {
//                         const errorData = await response.json();
//                         // 'detail' フィールドがあるか確認するなど
//                         errorDetail = errorData.detail || JSON.stringify(errorData);
//                     } catch (e) {
//                         // JSON解析に失敗した場合（HTMLが返された場合など）は何もしない
//                         console.error("エラーレスポンスがJSONではありませんでした:", e);
//                         // response.text() を使ってHTML全体をログに出力しても良い
//                     }
                    
//                     throw new Error(`API Error ${response.status} (${response.statusText}): ${errorDetail}`);
//                 }
//                 // ...

//                 const data = await response.json();
//                 const aiResponse = data.text;

//                 // AIメッセージをUIに追加
//                 appendMessage('ai', aiResponse);
//                 // 履歴に記録
//                 recordMessage('ai', aiResponse);
                
//                 speak(aiResponse);
                
//                 // ★ 自動ログ送信を呼び出す ★
//                 await sendLogPerTurn();

//             } catch (error) {
//                 console.error("LLMリクエストエラー:", error);
//                 const errorMessage = `エラーが発生しました: ${error.message}`;
//                 appendMessage('ai', errorMessage);
//                 recordMessage('ai', errorMessage);
//                 speak("システムエラーが発生しました。コンソールを確認してください。");
//             } finally {
//                 setStandbyStatus();
//             }
//         }

//         // --- 音声合成 (TTS) ---

//         function speak(text) {
//             if (synth.speaking) {
//                 synth.cancel();
//             }
            
//             isSpeaking = true;
//             setStatus('🔊 発話中...');
            
//             const utterance = new SpeechSynthesisUtterance(text);
//             utterance.lang = 'ja-JP';
            
//             // 日本語で落ち着いた声を探す
//             const preferredVoice = synth.getVoices().find(v => v.lang === 'ja-JP' && v.name.includes('Kyoko'));
//             if (preferredVoice) {
//                 utterance.voice = preferredVoice;
//             }

//             utterance.onend = () => {
//                 isSpeaking = false;
//                 setStandbyStatus();
//             };
//             utterance.onerror = (event) => {
//                 console.error('SpeechSynthesisUtterance.onerror', event);
//                 isSpeaking = false;
//                 setStandbyStatus();
//             };

//             synth.speak(utterance);
//         }

//         // --- 音声認識 (STT) ---

//         function startRecognition() {
//             if (!('webkitSpeechRecognition' in window)) {
//                 showMessageBox("お使いのブラウザは音声認識に対応していません。テキスト入力をご利用ください。");
//                 return;
//             }

//             if (recognition) {
//                 recognition.stop();
//                 recognition = null;
//             }

//             recognition = new webkitSpeechRecognition();
//             recognition.lang = 'ja-JP';
//             recognition.interimResults = false;
//             recognition.maxAlternatives = 1;

//             recognition.onstart = () => {
//                 isListening = true;
//                 setStatus('👂 リスニング中...', true);
//             };

//             recognition.onresult = (event) => {
//                 const transcript = event.results[0][0].transcript;
//                 voiceInput.value = transcript;
//                 recognition.stop();
//                 sendLLMRequest(transcript); // 認識結果をLLMに送信
//             };

//             recognition.onerror = (event) => {
//                 console.error('Recognition error:', event.error);
//                 if (event.error !== 'no-speech') {
//                     showMessageBox(`音声認識エラー: ${event.error}`);
//                 }
//                 isListening = false;
//                 setStandbyStatus();
//             };

//             recognition.onend = () => {
//                 isListening = false;
//                 setStandbyStatus();
//             };

//             recognition.start();
//         }

//         // --- イベントリスナー ---

//         // マイク/送信ボタンのクリックイベント
//         sendBtn.addEventListener("click", () => {
//             if (isListening) {
//                 // 録音中に再度押された場合は停止
//                 recognition.stop();
//             } else if (voiceInput.value.trim() !== "") {
//                 // テキスト入力がある場合は送信
//                 sendLLMRequest(voiceInput.value);
//             } else {
//                 // テキスト入力がなく、録音中でない場合は録音開始
//                 startRecognition();
//             }
//         });

//         // Enterキーでの送信
//         voiceInput.addEventListener("keypress", (e) => {
//             if (e.key === "Enter" && voiceInput.value.trim() !== "") {
//                 sendLLMRequest(voiceInput.value);
//             }
//         });

//         // ログ送信ボタンのクリックイベント (手動送信確認用)
//         logBtn.addEventListener("click", async () => {
//             if (chatHistory.length === 0) {
//                 showMessageBox("会話履歴がありません。");
//                 return;
//             }

//             setStatus('📧 ログを手動で確認中...');
            
//             try {
//                 const response = await fetch(LOG_API_URL, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ 
//                         history: chatHistory, 
//                         target_email: TARGET_EMAIL 
//                     })
//                 });

//                 // if (!response.ok) {
//                 //     const errorDetail = (await response.json()).detail || response.statusText;
//                 //     throw new Error(`API Error ${response.status}: ${errorDetail}`);
//                 // }

//                 // sendLLMRequest 関数内
//                 // ...
//                 if (!response.ok) {
//                     let errorDetail = response.statusText;
                    
//                     // サーバーがJSONを返す可能性があるか試す
//                     try {
//                         const errorData = await response.json();
//                         // 'detail' フィールドがあるか確認するなど
//                         errorDetail = errorData.detail || JSON.stringify(errorData);
//                     } catch (e) {
//                         // JSON解析に失敗した場合（HTMLが返された場合など）は何もしない
//                         console.error("エラーレスポンスがJSONではありませんでした:", e);
//                         // response.text() を使ってHTML全体をログに出力しても良い
//                     }
                    
//                     throw new Error(`API Error ${response.status} (${response.statusText}): ${errorDetail}`);
//                 }
//                 // ...

//                 const data = await response.json();
                
//                 // 手動送信のメッセージをユーザーに表示
//                 showMessageBox(`手動ログ送信シミュレーション完了。メッセージ: ${data.message}`);
                
//                 // ログ内容をコンソールにも表示（確認用）
//                 console.log("--- 手動ログファイル出力内容 ---");
//                 console.log(data.log_content);

//             } catch (error) {
//                 console.error("手動ログ送信リクエストエラー:", error);
//                 showMessageBox(`ログ送信エラーが発生しました: ${error.message}`);
//             } finally {
//                 setStandbyStatus();
//             }
//         });

//         // ページロード時の初期化
//         window.onload = () => {
//             // TTS初期化
//             if (synth.getVoices().length === 0) {
//                  // 音声がロードされるまで待機
//                 window.speechSynthesis.onvoiceschanged = () => {
//                     setStandbyStatus();
//                 };
//             } else {
//                 setStandbyStatus();
//             }
//         };

//         // --- 波形アニメーション (Canvas) ---
//         const canvas = document.getElementById('waveCanvas');
//         const ctx = canvas.getContext('2d');
//         let animationFrameId;

//         function resizeCanvas() {
//             canvas.width = window.innerWidth;
//             canvas.height = window.innerHeight;
//         }
//         window.addEventListener('resize', resizeCanvas);
//         resizeCanvas();

//         function drawWave() {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
            
//             if (isListening || isSpeaking) {
//                 const centerX = canvas.width / 2;
//                 const centerY = canvas.height / 2;
//                 // よりリッチな波形アニメーション (省略)
//                 const time = Date.now() * 0.005;
//                 const waveCount = 3;
                
//                 for(let i = 0; i < waveCount; i++) {
//                     const baseRadius = 50 + i * 20;
//                     const radius = baseRadius + Math.sin(time + i * 1.5) * 15;
                    
//                     ctx.beginPath();
//                     ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    
//                     let alpha = 0.3 - i * 0.1;
//                     if (isListening) {
//                         ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`; // リスニング中: 黄色
//                     } else {
//                         ctx.strokeStyle = `rgba(0, 128, 255, ${alpha})`; // 発話中: 青
//                     }
//                     ctx.lineWidth = 4;
//                     ctx.stroke();
//                 }
//             }

//             animationFrameId = requestAnimationFrame(drawWave);
//         }
        
//         drawWave();

//     // </script>