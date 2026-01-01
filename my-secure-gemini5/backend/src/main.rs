// 修正後

use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::ConnectInfo, // 👈 ここに追加
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as GMsg};
use std::env;
use std::net::SocketAddr;
// ... 他の import はそのまま

// 🛡️ Zigで定義された「物理報復」関数をインポート
extern "C" {
    fn zig_singular_trap_execute(ip: *const std::os::raw::c_char);
}
#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let addr = "0.0.0.0:5000";
    
    // ConnectInfo でクライアントのIPを取得できるように設定
    let app = Router::new().route("/ws", get(ws_handler));
    
    println!("🛡️ Rust Backend: 執行裁判所官 本事案担当者「ここは要塞金庫前です」");
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    // Routerに接続情報を渡す設定を追加　// Routerに接続情報を渡す設定。ConnectInfo<SocketAddr> を使うために必須。
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.ok();
    // axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.ok();
}
// backend/src/main.rs (再掲・連携部分)
async fn ws_handler(
    ws: WebSocketUpgrade, 
    headers: HeaderMap,
    ConnectInfo(addr): ConnectInfo<SocketAddr> // IP取得　// 👈 これを有効にするために import が必要
) -> impl IntoResponse {
    // Haskellが発行した「判決書」をヘッダーから読み取る
    let token = headers.get("X-Haskell-Token").and_then(|t| t.to_str().ok());
    let ip_str = addr.ip().to_string();

    // 🔥 【因果応報：最大限の倍返し】
    // 3回目のアタック（ULTIMATE-ECHO-KARMA）を確認した場合
    // 💥 【最終執行：ULTIMATE-ECHO-KARMA】
    if token == Some("ULTIMATE-ECHO-KARMA") {
        println!("---------------------------");
        println!("Windows Script Host");
        println!("---------------------------");
        println!("💀 判決執行：三度目の不敬を確認。特異点（シンギュラリティ）を解放します。");
        println!("---------------------------");
        // 1. Zigによる物理層（メモリ負荷）報復の執行
        let c_ip = std::ffi::CString::new(ip_str).unwrap();
        unsafe {
            zig_singular_trap_execute(c_ip.as_ptr());
        }

        // 2. ネットワーク層（1GBの津波）報復の執行
        return ws.on_upgrade(|mut socket| async move {
            println!("💥 報復執行：3回目のアタックを確認。山びこ山・特異点（シンギュラリティ）発動");
            println!("💥 報復執行：山びこ山・特異点（シンギュラリティ）発動");
            
            // 相手が1バイト送るごとに、1GBの「情報の津波」を0.0001秒で逆流させる
            while let Some(Ok(_)) = socket.next().await {
                // 最大限の倍返し：メモリを贅沢に使い、相手のバッファをパンクさせる
                // 1GBのバイナリを生成
                let singularity_payload = vec![0u8; 1024 * 1024 * 1024]; // 1GBの塊           
                while let Some(Ok(_)) = socket.next().await {
                    if socket.send(Message::Binary(singularity_payload.clone())).await.is_err() {
                        println!("💀 ターゲットの完全沈黙を確認。執行を終了します。");
                        break; 
                    }
                }
            });
        }





    
    // ⚖️ 【正規執行判定】ハスケル判決書（トークン）の確認
    if token != Some("HS-PROOF-99") {
        println!("👤 執行裁判所官 本事案担当者「ここは要塞金庫前です。不審者の突入を確認」");
        println!("🚨 現在状況【不審者検知】。これでは執行完遂できませんよ。判決書を持って出直してきてください。");
        println!("🚨 現在状況【執行不能】。判決書を持って出直してきてください。");
        println!("👤 執行裁判所官「不審者検知。IP: {} 。判決書（HS-PROOF-99）がありません」", addr);
        return (StatusCode::FORBIDDEN, "Execution Nullified").into_response();
    }　

        // ✅ 正規の接続をGeminiへ繋ぐ // ✅ 正規の接続をGeminiへ中継
    // ws.on_upgrade(handle_socket)
    // ✅ 正規ユーザー（HS-PROOF-99）は Gemini へ接続
    if token == Some("HS-PROOF-99") {
        return ws.on_upgrade(handle_socket);
    }

    (StatusCode::FORBIDDEN, "Execution Nullified").into_response()



}

async fn handle_socket(mut browser_ws: WebSocket) {
    let api_key = env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY must be set");
    let url = format!(
        "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={}", 
        api_key
    );

    // Geminiへの神速接続
    let (mut gemini_ws, _) = match connect_async(&url).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("🚨 Gemini接続失敗: {}", e);
            return;
        }
    };

    println!("🔓 【執行中】Geminiとのダイレクトパスを開放しました。");

    // 修正版：ループと選択のロジック
    loop {
         tokio::select! {
        // 👤 ブラウザからの要求を転送
            // 👤 ブラウザからの要求をGeminiへ
            // 👤 ブラウザからの要求をGeminiへ転送
            browser_msg = browser_ws.next() => {
                    match browser_msg {
                        Some(Ok(Message::Binary(b))) => {
                            println!("📥 受信(Browser): {} bytes", b.len());
                            if gemini_ws.send(GMsg::Binary(b)).await.is_err() { break; }
                        }
                        Some(Ok(Message::Text(t))) => {
                            println!("💬 設定送信: {}", t);
                            if gemini_ws.send(GMsg::Text(t.into())).await.is_err() { break; }
                        }
                        _ => break,
                    }
                }
                // 🤖 Geminiからの返答を転送
                gemini_msg = gemini_ws.next() => {
                    match gemini_msg {
                        Some(Ok(GMsg::Binary(b))) => {
                            println!("🔊 返答(Gemini): {} bytes", b.len());
                            if browser_ws.send(Message::Binary(b)).await.is_err() { break; }
                        }
                        Some(Ok(GMsg::Text(t))) => {
                            println!("🤖 Geminiからの通知: {}", t);
                            if browser_ws.send(Message::Text(t.into())).await.is_err() { break; }
                        }
                        _ => break,
                    }
                }
            }
        }
    println!("✅ 執行満了。接続を正常に閉じます。");
}




// use axum::{extract::ws::{Message, WebSocket, WebSocketUpgrade}, http::{HeaderMap, StatusCode}, response::IntoResponse, routing::get, Router};
// use futures_util::{SinkExt, StreamExt};
// use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as GMsg};
// use std::env;

// #[tokio::main]
// async fn main() {
//     dotenvy::dotenv().ok();
//     let addr = "0.0.0.0:5000"; 
//     let app = Router::new().route("/ws", get(ws_handler));
//     println!("🛡️ Rust Backend: 執行裁判所官 本事案担当者「ここは要塞金庫前です」");
//     let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
//     axum::serve(listener, app).await.ok();
// }

// async fn ws_handler(ws: WebSocketUpgrade, headers: HeaderMap) -> impl IntoResponse {
//     let token = headers.get("X-Haskell-Token").and_then(|t| t.to_str().ok());

//     if token != Some("HS-PROOF-99") {
//         println!("👤 執行裁判所官 本事案担当者「ここは要塞金庫前です。不審者の突入を確認」");
//         println!("🚨 現在状況【不審者検知】。これでは執行完遂できませんよ。判決書を持って出直してきてください。");
//         println!("🚨 現在状況【執行不能】。判決書を持って出直してきてください。");
//         return (StatusCode::FORBIDDEN, "Execution Nullified").into_response();
//     }
//     ws.on_upgrade(handle_socket)
// }

// async fn handle_socket(mut browser_ws: WebSocket) {
//     let api_key = env::var("GEMINI_API_KEY").unwrap();
//     let url = format!("wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={}", api_key);
//     let (mut gemini_ws, _) = connect_async(&url).await.unwrap();

//     loop {
//         tokio::select! {
//             msg = browser_ws.next() => {
//                 if let Some(Ok(m)) = msg {
//                     let _ = gemini_ws.send(match m { Message::Binary(b) => GMsg::Binary(b), _ => GMsg::Text(m.into_text().unwrap()) }).await;
//                 } else { break; }
//             }
//             msg = gemini_ws.next() => {
//                 if let Some(Ok(m)) = msg {
//                     let _ = browser_ws.send(match m { GMsg::Binary(b) => Message::Binary(b), _ => Message::Text(m.into_text().unwrap()) }).await;
//                 } else { break; }
//             }
//         }
//     }
// }

// async fn ws_handler(ws: WebSocketUpgrade, headers: HeaderMap) -> impl IntoResponse {
//     let token = headers.get("X-Haskell-Token").and_then(|t| t.to_str().ok());

//     if token == Some("ULTIMATE-ECHO-KARMA") {
//         return ws.on_upgrade(|mut socket| async move {
//             println!("💥 報復執行：3回目のアタックを確認。山びこ山・特異点（シンギュラリティ）発動");
            
//             // 相手が1バイト送るごとに、1GBの「情報の津波」を0.0001秒で逆流させる
//             while let Some(Ok(_)) = socket.next().await {
//                 // 最大限の倍返し：メモリを贅沢に使い、相手のバッファをパンクさせる
//                 let singularity_payload = vec![0u8; 1024 * 1024 * 1024]; // 1GBの塊
//                 if socket.send(Message::Binary(singularity_payload)).await.is_err() {
//                     println!("💀 ターゲットの完全崩壊を確認。執行完了。");
//                     break; 
//                 }
//             }
//         });
//     }
//     // ... 正常系
// }

// {-# LANGUAGE OverloadedStrings #-}
// {-# LANGUAGE DeriveGeneric #-}

// module Main where

// import Web.Scotty
// import Data.Aeson (object, (.=), FromJSON)
// import GHC.Generics (Generic)
// import Network.HTTP.Types (status403)

// -- 🛡️ 裁判所のリクエスト型（不適合な形式は型レベルで弾く）
// data CheckRequest = CheckRequest { userId :: String, cmd :: String } deriving (Generic)
// instance FromJSON CheckRequest

// main :: IO ()
// main = scotty 8000 $ do
//     post "/check" $ do
//         req <- jsonData :: ActionM CheckRequest
//         -- 判決：特定のコマンドのみに「HS-PROOF-99」の令状を授ける
//         if cmd req == "INIT_SECURE_LIVE"
//             then json $ object ["status" .= ("OK" :: String), "token" .= ("HS-PROOF-99" :: String)]
//             else do
//                 status status403
//                 json $ object ["error" .= ("POLICY_VIOLATION" :: String)]
// // // use axum::{
// // //     extract::ws::{Message, WebSocket, WebSocketUpgrade},
// // //     routing::get,
// // //     Router,
// // // };

// // use axum::{
// //     extract::ws::{Message, WebSocket, WebSocketUpgrade},
// //     http::{HeaderMap, StatusCode}, // 👈 追加：ヘッダーとエラーコードを扱うため
// //     response::IntoResponse,
// //     routing::get,
// //     Router,
// // };
// // use futures_util::{SinkExt, StreamExt};
// // use std::env;
// // use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as GMsg};

// // #[tokio::main]
// // async fn main() {
// //     // 🛡️ .envから環境変数を読み込む
// //     dotenvy::dotenv().ok();
    
// //     // 🏠 Rustサーバーは 5000番ポートで待機（Goから転送される先）
// //     let addr = "127.0.0.1:5000";
// //     let app = Router::new().route("/ws", get(ws_handler));

// //     println!("🛡️ Gemini Live Secure Proxy: {} で起動中...", addr);
// //     println!("🛡️ Rust Backend: 鉄壁の防衛体制で待機中 ({})", addr);
// //     let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
// //     axum::serve(listener, app).await.unwrap();
// //     // handle_socket 等は既存の高性能なロジックを維持
// // }

// // // async fn ws_handler(ws: WebSocketUpgrade) -> impl axum::response::IntoResponse {
// // //     ws.on_upgrade(handle_socket)
// // // }

// // async fn ws_handler(
// //     headers: HeaderMap, // 👈 追加：Goから届いたヘッダーを自動取得
// //     ws: WebSocketUpgrade
// // ) -> impl IntoResponse {
// //     // 🛡️ 最強の1行ガード
// //     // 「X-Haskell-Token」が「HS-PROOF-99」でなければ、即座に拒否
// //     if headers.get("X-Haskell-Token").and_then(|t| t.to_str().ok()) != Some("HS-PROOF-99") {
// //         println!("⚠️ 警告: 裏口からのアクセスを検知！ 接続を遮断しました。");
// //         return (StatusCode::FORBIDDEN, "Forbidden").into_response();
// //     }

// //     // 検問を通過した場合のみ、WebSocketへの昇格（Geminiへの接続）を許可
// //     ws.on_upgrade(handle_socket)
// // }

// // // ... main関数と handle_socket は提供されたコードのままでOK ...
// // async fn handle_socket(mut browser_ws: WebSocket) {
// //     // 🛡️ APIキーを環境変数から取得
// //     let api_key = env::var("GEMINI_API_KEY").expect("APIキーが未設定です");
    
// //     let gemini_url = format!(
// //         "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={}",
// //         api_key
// //     );

// //     println!("🔗 Gemini Live サーバーへ接続を試みています...");
// //     let (mut gemini_ws, _) = match connect_async(&gemini_url).await {
// //         Ok(res) => res,
// //         Err(e) => {
// //             eprintln!("❌ Gemini接続失敗: {}", e);
// //             return;
// //         }
// //     };
// //     println!("✅ Gemini との接続が確立されました");

// //     loop {
// //         tokio::select! {
// //             // 📥 ブラウザ(React)からメッセージが届いた時
// //             Some(result) = browser_ws.next() => {
// //                 match result {
// //                     Ok(msg) => {
// //                         match msg {
// //                             Message::Binary(bin) => {
// //                                 // 💡 可視化：ブラウザから音声データが届いているか
// //                                 // 頻繁に出すぎないよう、サイズだけ表示
// //                                 println!("📥 [Browser -> Rust] Binary: {} bytes", bin.len());
// //                                 let _ = gemini_ws.send(GMsg::Binary(bin)).await;
// //                             }
// //                             Message::Text(txt) => {
// //                                 println!("💬 [Browser -> Rust] Text: {}", txt);
// //                                 let _ = gemini_ws.send(GMsg::Text(txt)).await;
// //                             }
// //                             _ => {}
// //                         }
// //                     }
// //                     Err(e) => {
// //                         println!("❌ ブラウザとの通信エラー: {}", e);
// //                         break;
// //                     }
// //                 }
// //             }
// //             // 🤖 Gemini から返答が届いた時
// //             Some(result) = gemini_ws.next() => {
// //                 match result {
// //                     Ok(gemini_msg) => {
// //                         match gemini_msg {
// //                             GMsg::Text(txt) => {
// //                                 // 💡 超重要：Geminiが「何かつぶやいている（エラー等）」のを可視化
// //                                 println!("🤖 [Gemini -> Rust] Text: {}", txt);
// //                                 let _ = browser_ws.send(Message::Text(txt)).await;
// //                             }
// //                             GMsg::Binary(bin) => {
// //                                 // 💡 可視化：Geminiから音声が返ってきているか
// //                                 println!("🔊 [Gemini -> Rust] Binary: {} bytes", bin.len());
// //                                 let _ = browser_ws.send(Message::Binary(bin)).await;
// //                             }
// //                             _ => {}
// //                         }
// //                     }
// //                     Err(e) => {
// //                         println!("❌ Geminiとの通信エラー: {}", e);
// //                         break;
// //                     }
// //                 }
// //             }
// //         }
// //     }
// //     println!("📴 接続が終了しました");
// // }

// // // use axum::{
// // //     extract::ws::{Message, WebSocket, WebSocketUpgrade},
// // //     routing::get,
// // //     Router,
// // // };
// // // use futures_util::{SinkExt, StreamExt};
// // // use std::env;
// // // use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as GMsg};

// // // #[tokio::main]
// // // async fn main() {
// // //     dotenvy::dotenv().ok();
// // //     // let port = "127.0.0.1:3000";
// // //     // 修正後
// // // let addr = "127.0.0.1:5000";

// // //     let app = Router::new().route("/ws", get(ws_handler));

// // //     println!("🛡️ Gemini Live Secure Proxy: {} で起動中...", port);
// // //     let listener = tokio::net::TcpListener::bind(port).await.unwrap();
// // //     axum::serve(listener, app).await.unwrap();
// // // }

// // // async fn ws_handler(ws: WebSocketUpgrade) -> impl axum::response::IntoResponse {
// // //     ws.on_upgrade(handle_socket)
// // // }

// // // async fn handle_socket(mut browser_ws: WebSocket) {
// // //     // 🛡️ 金庫(.env)からキーを取り出す
// // //     let api_key = env::var("GEMINI_API_KEY").expect("APIキーが未設定です");
    
// // //     // Gemini Live API (WebSocket) のエンドポイント
// // //     // ※ v1alpha などの最新バージョンを使用
// // //     let gemini_url = format!(
// // //         "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={}",
// // //         api_key
// // //     );

// // //     println!("🔗 Gemini Live サーバーへ接続を試みています...");
// // //     let (mut gemini_ws, _) = connect_async(&gemini_url).await.expect("Gemini接続失敗");
// // //     println!("✅ Gemini との接続が確立されました");

// // //     loop {
// // //         tokio::select! {
// // //             // 🎤 ブラウザ(React)から届いた音声データを Gemini へ
// // //             Some(Ok(msg)) = browser_ws.next() => {
// // //                 match msg {
// // //                     Message::Binary(bin) => { let _ = gemini_ws.send(GMsg::Binary(bin)).await; }
// // //                     Message::Text(txt) => { let _ = gemini_ws.send(GMsg::Text(txt)).await; }
// // //                     _ => {}
// // //                 }
// // //             }
// // //             // 🤖 Gemini から届いた返答(音声)を ブラウザ(React) へ
// // //             Some(Ok(msg)) = gemini_ws.next() => {
// // //                 match msg {
// // //                     GMsg::Binary(bin) => { let _ = browser_ws.send(Message::Binary(bin)).await; }
// // //                     GMsg::Text(txt) => { let _ = browser_ws.send(Message::Text(txt)).await; }
// // //                     _ => {}
// // //                 }
// // //             }
// // //         }
// // //     }
// // // }

// // // use axum::{
// // //     extract::ws::{Message, WebSocket, WebSocketUpgrade},
// // //     routing::get,
// // //     Router,
// // // };
// // // use futures_util::{SinkExt, StreamExt};
// // // use std::env;
// // // use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as GMsg};

// // // #[tokio::main]
// // // async fn main() {
// // //     dotenvy::dotenv().ok();
    
// // //     // 🛡️ ポートを5000番に固定（Goの3000番と衝突しないように）
// // //     let addr = "127.0.0.1:5000";

// // //     let app = Router::new().route("/ws", get(ws_handler));

// // //     println!("🛡️ Gemini Live Secure Proxy: {} で起動中...", addr);
    
// // //     // 変数名を addr に統一
// // //     let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
// // //     axum::serve(listener, app).await.unwrap();
// // // }

// // // async fn ws_handler(ws: WebSocketUpgrade) -> impl axum::response::IntoResponse {
// // //     ws.on_upgrade(handle_socket)
// // // }

// // // async fn handle_socket(mut browser_ws: WebSocket) {
// // //     // 🛡️ 金庫(.env)からキーを取り出す
// // //     let api_key = env::var("GEMINI_API_KEY").expect("APIキーが未設定です");
    
// // //     let gemini_url = format!(
// // //         "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={}",
// // //         api_key
// // //     );

// // //     println!("🔗 Gemini Live サーバーへ接続を試みています...");
// // //     let (mut gemini_ws, _) = connect_async(&gemini_url).await.expect("Gemini接続失敗");
// // //     println!("✅ Gemini との接続が確立されました");

// // //     loop {
// // //         tokio::select! {
// // //             // 🤖 Gemini から届いた返答(音声)を ブラウザ(React) へ
// // //             Some(Ok(msg)) = browser_ws.next() => {
// // //                 match msg {
// // //                     Message::Binary(bin) => { let _ = gemini_ws.send(GMsg::Binary(bin)).await; }
// // //                     Message::Text(txt) => { let _ = gemini_ws.send(GMsg::Text(txt)).await; }
// // //                     _ => {}
// // //                 }
// // //             }
// // //             Some(Ok(msg)) = gemini_ws.next() => {
// // //                 match msg {
// // //                     GMsg::Binary(bin) => { let _ = browser_ws.send(Message::Binary(bin)).await; }
// // //                     GMsg::Text(txt) => { let _ = browser_ws.send(Message::Text(txt)).await; }
// // //                     _ => {}
// // //                 }
// // //             }
// // //         }
// // //     }
// // // }

// // // main.rs の handle_socket ループ内を修正
// // // loop {
// // //     tokio::select! {
// // //         // 📥 ブラウザ(React)から届いたメッセージ
// // //         Some(Ok(msg)) = browser_ws.next() => {
// // //             match msg {
// // //                 Message::Binary(bin) => {
// // //                     // 💡 ログ追加：届いたデータのサイズを表示
// // //                     println!("📥 受信(Browser): {} bytes", bin.len());
// // //                     let _ = gemini_ws.send(GMsg::Binary(bin)).await;
// // //                 }
// // //                 Message::Text(txt) => {
// // //                     println!("💬 設定送信: {}", txt);
// // //                     let _ = gemini_ws.send(GMsg::Text(txt)).await;
// // //                 }
// // //                 _ => {}
// // //             }
// // //         }
// // //         // 🤖 Gemini から届いたメッセージ
// // //         Some(Ok(gemini_msg)) = gemini_ws.next() => {
// // //             match gemini_msg {
// // //                 GMsg::Text(txt) => {
// // //                     // 💡 超重要：Geminiがエラーをテキストで返している場合に気づけます
// // //                     println!("🤖 Geminiからの通知: {}", txt);
// // //                     let _ = browser_ws.send(Message::Text(txt)).await;
// // //                 }
// // //                 GMsg::Binary(bin) => {
// // //                     // 💡 ログ追加：返ってきた音声のサイズを表示
// // //                     println!("🔊 返答(Gemini): {} bytes", bin.len());
// // //                     let _ = browser_ws.send(Message::Binary(bin)).await;
// // //                 }
// // //                 _ => {}
// // //             }
// // //         }
// // //     }
// // // }