

/** @jsxImportSource react */
import React, { useEffect, useRef, useState } from 'react';

// 🛡️ ブラウザの型定義補正
interface SecureWindow extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}
declare const window: SecureWindow;

export default function App() {
  const [status, setStatus] = useState<string>('待機中');
  const ws = useRef<WebSocket | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const nextStartTime = useRef<number>(0);

  // --- (ロジック部分は変更なし) ---
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/ws');
    socket.binaryType = 'arraybuffer';
    ws.current = socket;

    socket.onopen = () => {
      console.log("---------------------------");
      console.log("Windows Script Host");
      console.log("---------------------------");
      console.log("🛡️ フロントエンド：ゲートウェイ接続完了。");
      setStatus('⚖️ 判決確定：安全な接続を確立');
      const setup = { setup: { model: "models/gemini-2.0-flash-exp" } };
      socket.send(JSON.stringify(setup));
    };

    socket.onmessage = async (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        handleIncomingAudio(event.data);
      }
    };

    socket.onclose = () => {
      setStatus('🚨 執行終了：接続が切断されました');
    };

    return () => {
      socket.close();
      mediaStream.current?.getTracks().forEach(track => track.stop());
      if (audioCtx.current && audioCtx.current.state !== 'closed') {
        void audioCtx.current.close();
      }
    };
  }, []);

  const handleIncomingAudio = async (data: ArrayBuffer) => {
    if (!audioCtx.current) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx.current = new AudioCtxClass({ sampleRate: 24000 });
    }
    const int16Data = new Int16Array(data);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32767;
    }
    const buffer = audioCtx.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    const source = audioCtx.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.current.destination);
    const startTime = Math.max(audioCtx.current.currentTime, nextStartTime.current);
    source.start(startTime);
    nextStartTime.current = startTime + buffer.duration;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx.current = new AudioCtxClass({ sampleRate: 16000 });
      if (audioCtx.current.state === 'suspended') await audioCtx.current.resume();
      const source = audioCtx.current.createMediaStreamSource(stream);
      const processor = audioCtx.current.createScriptProcessor(2048, 1, 1);
      processor.onaudioprocess = (e) => {
        if (ws.current?.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
        }
        ws.current.send(pcm16.buffer);
      };
      source.connect(processor);
      processor.connect(audioCtx.current.destination);
      setStatus('📢 神速執行中：Geminiへ強行突破中');
    } catch (err) {
      setStatus('🚨 執行失敗：権限を確認せよ');
    }
  };

  return (
    <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#00d4ff', borderBottom: '2px solid #00d4ff', paddingBottom: '10px' }}>🛡️ 要塞フロントエンド</h1>
      <div style={{ margin: '20px', padding: '40px', background: '#1a1a1a', borderRadius: '10px', border: '1px solid #333', textAlign: 'center' }}>
        <p style={{ color: '#00ff00', fontSize: '1.2rem' }}>{status}</p>
        <button 
          onClick={startRecording} 
          style={{ 
            marginTop: '30px', padding: '20px 50px', fontSize: '1.2rem', cursor: 'pointer', 
            background: '#0044cc', border: '1px solid #00d4ff', color: 'white',
            fontWeight: 'bold', textTransform: 'uppercase'
          }}
        >
          正規手順で執行開始
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#444' }}>CAUTION: 不届き者には「山びこ山」が発動します</p>
    </div>
  );
}// // /** @jsxImportSource react */ // 👈 これを追加すると、環境に依存せずJSXが正しく認識されます
// // import React, { useEffect, useRef, useState } from 'react';
// // // 🛡️ 厳格補正：ブラウザの型定義を明示的に拡張
// // // Windowの型を拡張して webkitAudioContext などのエラーを抹殺
// // interface SecureWindow extends Window {
// //   AudioContext: typeof AudioContext; // 👈 これを追加
// //   webkitAudioContext?: typeof AudioContext;
// // }
// // declare const window: SecureWindow;

// // export default function App() { // 👈 一旦 : JSX.Element を外してもOK（自動推論されます）
// // // export default function App(): JSX.Element { // 👈 戻り値の型を明示
// //   const [sta/** @jsxImportSource react */
// import React, { useEffect, useRef, useState } from 'react';

// // ブラウザの型定義補正
// interface SecureWindow extends Window {
//   AudioContext: typeof AudioContext;
//   webkitAudioContext?: typeof AudioContext;
// }
// declare const window: SecureWindow;

// export default function App() {
//   const [status, setStatus] = useState<string>('待機中');
//   const ws = useRef<WebSocket | null>(null);
//   const audioCtx = useRef<AudioContext | null>(null);
//   const mediaStream = useRef<MediaStream | null>(null);
//   const nextStartTime = useRef<number>(0);

//   useEffect(() => {
//     // 🏛️ 執行官(Go)への直通パイプ
//     const socket = new WebSocket('ws://localhost:3000/ws');
//     socket.binaryType = 'arraybuffer';
//     ws.current = socket;

//     socket.onopen = () => {
//       setStatus('⚖️ 判決確定：安全な接続を確立');
//       // Gemini 2.0 Flash の初期セットアップ送信
//       const setup = { setup: { model: "models/gemini-2.0-flash-exp" } };
//       socket.send(JSON.stringify(setup));
//     };

//     socket.onmessage = async (event: MessageEvent) => {
//       if (event.data instanceof ArrayBuffer) {
//         handleIncomingAudio(event.data);
//       }
//     };

//     socket.onclose = () => setStatus('🚨 執行終了：接続が切断されました');

//     return () => {
//       socket.close();
//       mediaStream.current?.getTracks().forEach(track => track.stop());
//       if (audioCtx.current && audioCtx.current.state !== 'closed') {
//         void audioCtx.current.close();
//       }
//     };
//   }, []);

//   // 🤖 受信した音声を神速で再生
//   const handleIncomingAudio = async (data: ArrayBuffer) => {
//     if (!audioCtx.current) {
//       const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
//       audioCtx.current = new AudioCtxClass({ sampleRate: 24000 });
//     }
//     const int16Data = new Int16Array(data);
//     const float32Data = new Float32Array(int16Data.length);
//     for (let i = 0; i < int16Data.length; i++) {
//       float32Data[i] = int16Data[i] / 32767;
//     }
//     const buffer = audioCtx.current.createBuffer(1, float32Data.length, 24000);
//     buffer.getChannelData(0).set(float32Data);
//     const source = audioCtx.current.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioCtx.current.destination);

//     const startTime = Math.max(audioCtx.current.currentTime, nextStartTime.current);
//     source.start(startTime);
//     nextStartTime.current = startTime + buffer.duration;
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaStream.current = stream;

//       const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
//       audioCtx.current = new AudioCtxClass({ sampleRate: 16000 });
      
//       if (audioCtx.current.state === 'suspended') {
//         await audioCtx.current.resume();
//       }

//       const source = audioCtx.current.createMediaStreamSource(stream);
      
//       // 🛡️ 補正：2048サンプルで回転率を上げ、Go/Rustの執行速度に同期させる
//       const processor = audioCtx.current.createScriptProcessor(2048, 1, 1);

//       processor.onaudioprocess = (e) => {
//         if (ws.current?.readyState !== WebSocket.OPEN) return;
//         const input = e.inputBuffer.getChannelData(0);
//         const pcm16 = new Int16Array(input.length);
//         for (let i = 0; i < input.length; i++) {
//           pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
//         }
//         ws.current.send(pcm16.buffer);
//       };

//       source.connect(processor);
//       processor.connect(audioCtx.current.destination);
//       setStatus('📢 神速執行中：Geminiへ強行突破を開始');
//     } catch (err) {
//       setStatus('🚨 執行失敗：権限を確認せよ');
//     }
//   };

//   return (
//     <div style={{ background: '#1a1a1a', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
//       <h1 style={{ borderBottom: '2px solid #00d4ff', paddingBottom: '10px' }}>🛡️ 世界最高峰：要塞フロントエンド</h1>
//       <div style={{ margin: '20px', padding: '30px', background: '#2a2a2a', borderRadius: '15px', boxShadow: '0 0 20px rgba(0,212,255,0.2)', textAlign: 'center' }}>
//         <p style={{ color: '#00d4ff', fontSize: '1.4rem', fontWeight: 'bold' }}>{status}</p>
//         <button 
//           onClick={startRecording} 
//           style={{ 
//             marginTop: '20px', padding: '20px 40px', fontSize: '1.2rem', cursor: 'pointer', 
//             background: '#007bff', border: 'none', borderRadius: '10px', color: 'white',
//             transition: 'transform 0.1s', fontWeight: 'bold'
//           }}
//           onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
//           onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
//         >
//           正規の手順で執行開始
//         </button>
//       </div>
//       <p style={{ fontSize: '0.8rem', color: '#666' }}>※不届き者には「山びこ山」が発動します</p>
//     </div>
//   );
// }tus, setStatus] = useState<string>('待機中');
// //   // ... (中略) ...
// //   // --- 2. 参照（WebSocketやオーディオ Context） ---
// //   const ws = useRef<WebSocket | null>(null);
// //   const audioCtx = useRef<AudioContext | null>(null);
// //   const nextStartTime = useRef<number>(0);
// //   const mediaStream = useRef<MediaStream | null>(null); // 👈 ここに追加！
// //   useEffect(() => {
// //     const socket = new WebSocket('ws://localhost:3000/ws');
// //     socket.binaryType = 'arraybuffer';
// //     ws.current = socket;

// //     socket.onopen = () => {
// //       setStatus('安全な接続を確立しました');
// //       const setup = {
// //         setup: { model: "models/gemini-2.0-flash-exp" }
// //       };
// //       socket.send(JSON.stringify(setup));
// //     };

// //     socket.onmessage = (event: MessageEvent) => {
// //       if (event.data instanceof ArrayBuffer) {
// //         handleIncomingAudio(event.data);
// //       }
// //     };

// //     return () => {
// //       socket.close();
// //       // 👈 ここに追加！追加：マイクを確実にオフにする（プライバシー防御）
// //       mediaStream.current?.getTracks().forEach(track => track.stop());
// //       // ...
// //       if (audioCtx.current && audioCtx.current.state !== 'closed') {
// //         // void演算子で「戻り値を無視する」ことを明示（厳格モード対策）
// //         void audioCtx.current.close();
// //       }
// //     };
// //   }, []);

// //   const handleIncomingAudio = async (data: ArrayBuffer): Promise<void> => {
// //     if (!audioCtx.current) {
// //       const AudioContextClass = window.AudioContext || window.webkitAudioContext;
// //       if (AudioContextClass) {
// //         audioCtx.current = new AudioContextClass({ sampleRate: 24000 });
// //       }
// //     }
    
// //     if (!audioCtx.current) return;

// //     const int16Data = new Int16Array(data);
// //     const float32Data = new Float32Array(int16Data.length);
// //     for (let i = 0; i < int16Data.length; i++) {
// //       float32Data[i] = int16Data[i] / 32767;
// //     }

// //     const buffer = audioCtx.current.createBuffer(1, float32Data.length, 24000);
// //     buffer.getChannelData(0).set(float32Data);
// //     const source = audioCtx.current.createBufferSource();
// //     source.buffer = buffer;
// //     source.connect(audioCtx.current.destination);

// //     const startTime = Math.max(audioCtx.current.currentTime, nextStartTime.current);
// //     source.start(startTime);
// //     nextStartTime.current = startTime + buffer.duration;
// //   };

// //   const startStreaming = async (): Promise<void> => {
// //     try {
// //       setStatus('録音中...');
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //       mediaStream.current = stream; // 👈 streamを取得した直後のここに追加！

// //       if (!audioCtx.current) {
// //         const AudioContextClass = window.AudioContext || window.webkitAudioContext;
// //         if (AudioContextClass) {
// //           audioCtx.current = new AudioContextClass({ sampleRate: 16000 });
// //         }
// //       }

// //       if (audioCtx.current && audioCtx.current.state === 'suspended') {
// //         await audioCtx.current.resume();
// //       }
      
// //       if (!audioCtx.current) return;

// //       const source = audioCtx.current.createMediaStreamSource(stream);
// //       // 第3引数を明示。@ts-ignoreを外して型を正攻法で合わせる
// //       const processor = audioCtx.current.createScriptProcessor(4096, 1, 1);

// //       processor.onaudioprocess = (e: AudioProcessingEvent) => {
// //         const input = e.inputBuffer.getChannelData(0);
// //         const pcm16 = new Int16Array(input.length);
// //         for (let i = 0; i < input.length; i++) {
// //           pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
// //         }
// //         if (ws.current?.readyState === WebSocket.OPEN) {
// //           ws.current.send(pcm16.buffer);
// //         }
// //       };

// //       source.connect(processor);
// //       processor.connect(audioCtx.current.destination);
// //     } catch (err) {
// //       console.error("要塞内部エラー:", err); // 👈 console.logより詳細なerrorを使う
// //         // 👈 ここを書き換え！
// //         setStatus(`エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
// //       }
// //   };
// //       // console.error("エラー:", err);
// //       // setStatus('エラーが発生しました');
// //     // }


// //   return (
// //     <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
// //       <h1>🛡️ Secure Gemini Live</h1>
// //       <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
// //         <p>ステータス: <strong>{String(status)}</strong></p>
// //         <button 
// //           type="button" // 👈 明示的に指定
// //           onClick={() => { void startStreaming(); }} 
// //           style={{ 
// //             padding: '15px 30px', 
// //             fontSize: '18px', 
// //             backgroundColor: '#007bff', 
// //             color: 'white', 
// //             border: 'none', 
// //             borderRadius: '5px',
// //             cursor: 'pointer'
// //           }}>
// //           対話を開始する
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }



// // import React, { useEffect, useRef, useState } from 'react';

// // // --- 型定義の補正 ---
// // // ScriptProcessorなどは古いので、明示的に型を補強します
// // interface CustomWindow extends Window {
// //   webkitAudioContext?: typeof AudioContext;
// // }

// // declare const window: CustomWindow;

// // export default function App() {
// //   const [status, setStatus] = useState<string>('待機中');
  
// //   const ws = useRef<WebSocket | null>(null);
// //   const audioCtx = useRef<AudioContext | null>(null);
// //   const nextStartTime = useRef<number>(0);

// //   useEffect(() => {
// //     // 玄関（Go Gateway）へ接続
// //     const socket = new WebSocket('ws://localhost:3000/ws');
// //     socket.binaryType = 'arraybuffer';
// //     ws.current = socket;

// //     socket.onopen = () => {
// //       setStatus('安全な接続を確立しました');
// //       const setup = {
// //         setup: { model: "models/gemini-2.0-flash-exp" }
// //       };
// //       socket.send(JSON.stringify(setup));
// //     };

// //     socket.onmessage = (event: MessageEvent) => {
// //       if (event.data instanceof ArrayBuffer) {
// //         handleIncomingAudio(event.data);
// //       }
// //     };

// //     return () => {
// //       socket.close();
// //       if (audioCtx.current && audioCtx.current.state !== 'closed') {
// //         void audioCtx.current.close();
// //       }
// //     };
// //   }, []);

// //   const handleIncomingAudio = async (data: ArrayBuffer) => {
// //     if (!audioCtx.current) {
// //       const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
// //       if (!AudioCtxClass) return;
// //       audioCtx.current = new AudioCtxClass({ sampleRate: 24000 });
// //     }
    
// //     const int16Data = new Int16Array(data);
// //     const float32Data = new Float32Array(int16Data.length);
// //     for (let i = 0; i < int16Data.length; i++) {
// //       float32Data[i] = int16Data[i] / 32767;
// //     }

// //     const buffer = audioCtx.current.createBuffer(1, float32Data.length, 24000);
// //     buffer.getChannelData(0).set(float32Data);
// //     const source = audioCtx.current.createBufferSource();
// //     source.buffer = buffer;
// //     source.connect(audioCtx.current.destination);

// //     const startTime = Math.max(audioCtx.current.currentTime, nextStartTime.current);
// //     source.start(startTime);
// //     nextStartTime.current = startTime + buffer.duration;
// //   };

// //   const startStreaming = async () => {
// //     try {
// //       setStatus('録音中...');
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
// //       if (!audioCtx.current) {
// //         const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
// //         if (!AudioCtxClass) return;
// //         audioCtx.current = new AudioCtxClass({ sampleRate: 16000 });
// //       }

// //       if (audioCtx.current.state === 'suspended') {
// //         await audioCtx.current.resume();
// //       }
      
// //       const source = audioCtx.current.create
// // Source(stream);
// //       // 第3引数を 1 (モノラル) に明示して型を安定させます
// //       const processor = audioCtx.current.createScriptProcessor(4096, 1, 1);

// //       processor.onaudioprocess = (e: AudioProcessingEvent) => {
// //         const input = e.inputBuffer.getChannelData(0);
// //         const pcm16 = new Int16Array(input.length);
// //         for (let i = 0; i < input.length; i++) {
// //           pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
// //         }
// //         if (ws.current?.readyState === WebSocket.OPEN) {
// //           ws.current.send(pcm16.buffer);
// //         }
// //       };

// //       source.connect(processor);
// //       processor.connect(audioCtx.current.destination);
// //     } catch (err) {
// //       console.error("エラー:", err);
// //       setStatus('エラーが発生しました');
// //     }
// //   };

// //   return (
// //     <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
// //       <h1>🛡️ Secure Gemini Live</h1>
// //       <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
// //         <p>ステータス: <strong>{String(status)}</strong></p>
// //         <button 
// //           type="button"
// //           onClick={() => { void startStreaming(); }} 
// //           style={{ 
// //             padding: '15px 30px', 
// //             fontSize: '18px', 
// //             backgroundColor: '#007bff', 
// //             color: 'white', 
// //             border: 'none', 
// //             borderRadius: '5px',
// //             cursor: 'pointer'
// //           }}>
// //           対話を開始する
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }


// // // import React, { useEffect, useRef, useState } from 'react';

// // // export default function App() {
// // //   // --- 1. 状態管理（ステータス） ---
// // //   const [status, setStatus] = useState<string>('待機中');
  
// // //   // --- 2. 参照（WebSocketやオーディオ Context） ---
// // //   const ws = useRef<WebSocket | null>(null);
// // //   const audioCtx = useRef<AudioContext | null>(null);
// // //   const nextStartTime = useRef<number>(0);

// // //   // --- 3. 接続設定 (useEffect) ---
// // //   useEffect(() => {
// // //     // Rustプロキシに接続
// // //     const socket = new WebSocket('ws://localhost:3000/ws');
// // //     socket.binaryType = 'arraybuffer';
// // //     ws.current = socket;

// // //     socket.onopen = () => {
// // //   setStatus('安全な接続を確立しました');
// // //   // Gemini Live を起動するための初期設定を送信
// // //   const setup = {
// // //     setup: { 
// // //       model: "models/gemini-2.0-flash-exp" // 👈 Live対応モデルを指定
// // //     }
// // //   };
// // //   socket.send(JSON.stringify(setup));
// // // };
// // //     socket.onmessage = (event: MessageEvent) => {
// // //       if (event.data instanceof ArrayBuffer) {
// // //         handleIncomingAudio(event.data);
// // //       }
// // //     };

// // //     return () => {
// // //       socket.close();
// // //       if (audioCtx.current && audioCtx.current.state !== 'closed') {
// // //         audioCtx.current.close();
// // //       }
// // //     };
// // //   }, []);

// // //   // --- 4. 音声再生ロジック ---
// // //   const handleIncomingAudio = async (data: ArrayBuffer) => {
// // //     if (!audioCtx.current) {
// // //       audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
// // //     }
    
// // //     const int16Data = new Int16Array(data);
// // //     const float32Data = new Float32Array(int16Data.length);
// // //     for (let i = 0; i < int16Data.length; i++) {
// // //       float32Data[i] = int16Data[i] / 32767;
// // //     }

// // //     const buffer = audioCtx.current.createBuffer(1, float32Data.length, 24000);
// // //     buffer.getChannelData(0).set(float32Data);
// // //     const source = audioCtx.current.createBufferSource();
// // //     source.buffer = buffer;
// // //     source.connect(audioCtx.current.destination);

// // //     const startTime = Math.max(audioCtx.current.currentTime, nextStartTime.current);
// // //     source.start(startTime);
// // //     nextStartTime.current = startTime + buffer.duration;
// // //   };

// // //   // --- 5. 録音・送信ロジック ---
// // //   const startStreaming = async () => {
// // //     try {
// // //       setStatus('録音中...');
// // //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
// // //       if (!audioCtx.current) {
// // //         audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
// // //       }

// // //       if (audioCtx.current.state === 'suspended') {
// // //         await audioCtx.current.resume();
// // //       }
      
// // //       const source = audioCtx.current.createMediaStreamSource(stream);
// // //       // 👇 ここ！この2行をセットで記述します
// // //     // @ts-ignore
// // //     // const processor = audioCtx.current.createScriptProcessor(4096, 1, 1);
// // //       const processor = audioCtx.current.createScriptProcessor(4096, 1, 1);

// // //       // processor.onaudioprocess = (e) => {
// // //       //   const input = e.inputBuffer.getChannelData(0);
// // //       //   const pcm16 = new Int16Array(input.length);
// // //       //   for (let i = 0; i < input.length; i++) {
// // //       //     pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
// // //       //   }
// // //       //   if (ws.current?.readyState === WebSocket.OPEN) {
// // //       //     ws.current.send(pcm16.buffer);
// // //       //   }
// // //       // };
// // //       // App.tsx の onaudioprocess 内を修正
// // //       processor.onaudioprocess = (e) => {
// // //         const input = e.inputBuffer.getChannelData(0);
// // //         const pcm16 = new Int16Array(input.length);
// // //         for (let i = 0; i < input.length; i++) {
// // //           pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
// // //         }
// // //         if (ws.current?.readyState === WebSocket.OPEN) {
// // //           // 💡 ログ追加：送信サイズと、最初の数サンプルを表示
// // //           // これが 0 ばかりならマイクが音を拾っていません
// // //           if (Math.random() < 0.1) { // 負荷軽減のため10回に1回表示
// // //               console.log("🎤 送信中: ", pcm16.length, "bytes", pcm16[0], pcm16[1]);
// // //           }
// // //           ws.current.send(pcm16.buffer);
// // //         }
// // //       };

// // //       source.connect(processor);
// // //       processor.connect(audioCtx.current.destination);
// // //     } catch (err) {
// // //       console.error("エラー:", err);
// // //       setStatus('エラーが発生しました');
// // //     }
// // //   };

// // //   // --- 6. 画面表示 (HTML/JSX) ---
// // //   return (
// // //     <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
// // //       <h1>🛡️ Secure Gemini Live</h1>
// // //       <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
// // //         <p>ステータス: <strong>{status}</strong></p>
// // //         <button 
// // //           onClick={startStreaming} 
// // //           style={{ 
// // //             padding: '15px 30px', 
// // //             fontSize: '18px', 
// // //             backgroundColor: '#007bff', 
// // //             color: 'white', 
// // //             border: 'none', 
// // //             borderRadius: '5px',
// // //             cursor: 'pointer'
// // //           }}>
// // //           対話を開始する
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );
// // // }
