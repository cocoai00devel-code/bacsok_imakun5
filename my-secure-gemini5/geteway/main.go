package main

/*
#cgo LDFLAGS: -L. -limmune -Wl,-rpath,.
#include <stdbool.h>
bool check_packet_immunity(char* data);
*/
import "C"

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
	"unsafe"

	"github.com/gorilla/websocket"
)

// WebSocketアップグレーダーの設定
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// ⚖️ 因果応報の記録簿（IPごとの累積アタック回数）
var karmaRegistry = struct {
	sync.RWMutex
	counts map[string]int
}{counts: make(map[string]int)}

// Haskell 裁判所への請求構造
type VerdictRequest struct {
	UserID string `json:"userId"`
	Cmd    string `json:"cmd"`
	Karma  int    `json:"karma"`
	Token  string `json:"token,omitempty"`
}

// 🛡️ 記憶層: access.log への刻印
func recordAccess(ip, command, status, reason string) {
	f, err := os.OpenFile("../logs/access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("🚨 ログの刻印に失敗: %v", err)
		return
	}
	defer f.Close()

	logEntry := fmt.Sprintf("%s | IP: %s | CMD: %s | STATUS: %s | REASON: %s\n",
		time.Now().Format("2006-01-02 15:04:05"), ip, command, status, reason)
	f.WriteString(logEntry)
}

func main() {
	fmt.Println("---------------------------")
	fmt.Println("Windows Script Host")
	fmt.Println("---------------------------")
	fmt.Println("🌐 Go Gateway (w/ Nim Immune & Logging): 起動完了。")
	fmt.Println("---------------------------")

	// 玄関口のハンドラー設定（Nim免疫＋Haskell判定＋証跡刻印＋WSリレー）
	http.HandleFunc("/ws", handleSecureBridge)

	log.Println("🚀 Go Gateway: 3000番で検閲および検証開始...【ゆうざーの請求趣旨の申し立て受付受理が完了された瞬間です】")
	if err := http.ListenAndServe(":3000", nil); err != nil {
		log.Fatal("🚨 ゲートウェイ起動失敗:", err)
	}
}

// 🛡️ 執行ブリッジ：検閲・判定・記録・中継・報復の全権を担う
func handleSecureBridge(w http.ResponseWriter, r *http.Request) {
	ip := r.RemoteAddr
	currentTime := time.Now().Format("15:04:05.000")
	payload := r.URL.RawQuery

	fmt.Println("---------------------------")
	fmt.Println("Windows Script Host")
	fmt.Println("---------------------------")
	fmt.Printf("🛡️ 玄関: 接続検知 [%s]\n", ip)

	// --- 🛡️ 1. Nim 免疫システムによる直接検閲 (CGO呼び出し) ---
	cPayload := C.CString(payload)
	defer C.free(unsafe.Pointer(cPayload))
	isSafe := C.check_packet_immunity(cPayload)

	if !isSafe {
		fmt.Printf("🚨 [Immune System] 物理的拒絶: %s からの不純パケットを検知。\n", ip)
		
		karmaRegistry.Lock()
		karmaRegistry.counts[ip]++ // 免疫を汚した罪として業を加算
		karmaRegistry.Unlock()

		recordAccess(ip, "RAW_QUERY", "REJECTED", "IMMUNE_SYSTEM_DETECTION")
		http.Error(w, "Forbidden by Immune System", http.StatusNotAcceptable)
		return
	}

	// --- ⚖️ 2. Haskell 裁判所へ判定を仰ぐ ---
	karmaRegistry.RLock()
	currentKarma := karmaRegistry.counts[ip]
	karmaRegistry.RUnlock()

	// 業（カルマ）を含めて判定を依頼
	token, status := askHaskell(ip, currentKarma+1)

	// 🔥 【報復執行】3回目のアタックを確認した場合
	if status == "ULTIMATE_REVENGE" {
		log.Printf("🔥 【執行戦艦】ターゲット %s の3回目アタックを確認。最大限の倍返し、神速執行！", ip)
		recordAccess(ip, "INIT_SECURE_LIVE", "ULTIMATE_REVENGE", "KARMA_SINGULARITY")
		executeKarmaSingularity(w, r)
		return
	}

	// 🚫 【棄却】トークンが発行されなかった場合（1-2回目などの不正）
	if token == "" {
		karmaRegistry.Lock()
		karmaRegistry.counts[ip]++
		karmaRegistry.Unlock()

		log.Printf("⚖️ 主文：本件請求控訴棄却する。 現在状況【ERROR_UNAUTHORIZED】")
		log.Printf("🚨 警告：不審なアタック検知（%d回目）。3回目で『山びこ山』が発動します。", karmaRegistry.counts[ip])
		log.Println("🚨 速やかに原因を解消して出直してきてください。さもなくば執行取り消し無効とします。")
		
		recordAccess(ip, "INIT_SECURE_LIVE", "REJECTED", "POLICY_VIOLATION")
		http.Error(w, "Access Denied", http.StatusForbidden)
		return
	}

	// ✅ 【正常執行】正当なユーザーと認定
	log.Println("⚖️ 判決：正当なユーザーと認定。神速執行を開始します。")
	log.Println("📢 準備はよろしいですね？いまから判決の請求どおりに請求趣旨GIMINIさん執行をユーザーに届けるため、会場からGEMINIさんのいるところまで正規の手順どおり強行突破で突入して神速に執行満了させるのが私の役目です。よろしいでしょうか？")
	log.Println("📢 では正規の強硬するために部屋の鍵解錠を開始します。【当裁判所】policy-server判決趣旨に従って正規に強制開錠開けます。よろしいそれではお願いします。")
	log.Printf("⏱️ 執行開始時刻【%s】に基づき、本事件の強制執行を開始いたします。", currentTime)

	recordAccess(ip, "INIT_SECURE_LIVE", "VALID", "NONE")

	// WebSocketへアップグレード
	client, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("🚨 アップグレード失敗:", err)
		return
	}
	defer client.Close()

	// Rustバックエンド（金庫）へ接続
	h := http.Header{}
	h.Add("X-Haskell-Token", token)
	backend, _, err := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)
	if err != nil {
		log.Println("🚨 金庫（Rust）への接続失敗。執行を中断します。")
		return
	}
	defer backend.Close()

	log.Println("🔓 【よし、アンロック完了：開きました。本事件に対してユーザーの請求通りGEMINIさんへの会話を届けること許可します】")

	// 神速の双方向コピー
	done := make(chan struct{})
	go func() { copyWS(client, backend); done <- struct{}{} }()
	go func() { copyWS(backend, client); done <- struct{}{} }()
	<-done

	log.Printf("✅ 本日付けの本事案の執行終了時刻【%s】に基づき、本執行を終了いたします。おつかれさまでした。", time.Now().Format("15:04:05.000"))
}

// ⚖️ 審判所（Haskell）への判定依頼
func askHaskell(ip string, karma int) (string, string) {
	b, _ := json.Marshal(VerdictRequest{
		UserID: ip,
		Cmd:    "INIT_SECURE_LIVE",
		Karma:  karma,
	})

	resp, err := http.Post("http://policy-server:8000/check", "application/json", bytes.NewBuffer(b))
	if err != nil {
		return "", "SERVICE_DOWN"
	}
	defer resp.Body.Close()

	var res map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", "DECODE_ERROR"
	}

	return res["token"], res["status"]
}

// 💥 最大限の倍返し（特異点）の物理執行
func executeKarmaSingularity(w http.ResponseWriter, r *http.Request) {
	h := http.Header{}
	h.Add("X-Haskell-Token", "ULTIMATE-ECHO-KARMA")
	
	client, err := upgrader.Upgrade(w, r, nil)
	if err != nil { return }
	defer client.Close()

	backend, _, err := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)
	if err != nil { return }
	defer backend.Close()

	done := make(chan struct{})
	go func() { copyWS(client, backend); done <- struct{}{} }()
	go func() { copyWS(backend, client); done <- struct{}{} }()
	<-done
}

// 🔄 神速のリレー
func copyWS(dst, src *websocket.Conn) {
	for {
		mt, msg, err := src.ReadMessage()
		if err != nil { return }
		
		// 🚨 巨大パケット（1MB超）の検知・拒絶ロジックをリレー中にも適用
		if len(msg) > 1000000 {
			fmt.Println("🚨 警告: 巨大パケットを検知。通信を遮断。")
			return
		}

		if err := dst.WriteMessage(mt, msg); err != nil { return }
	}
}



// package main

// /*
// #cgo LDFLAGS: -L. -limmune -Wl,-rpath,.
// #include <stdbool.h>
// bool check_packet_immunity(char* data);
// */
// import "C"

// import (
// 	"bytes"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"sync"
// 	"time"
// 	"unsafe"

// 	"github.com/gorilla/websocket"
// )

// // WebSocketアップグレーダーの設定
// var upgrader = websocket.Upgrader{
// 	CheckOrigin: func(r *http.Request) bool { return true },
// }

// // ⚖️ 因果応報の記録簿（IPごとの累積アタック回数）
// var karmaRegistry = struct {
// 	sync.RWMutex
// 	counts map[string]int
// }{counts: make(map[string]int)}

// // Haskell 裁判所への請求構造
// type VerdictRequest struct {
// 	UserID string `json:"userId"`
// 	Cmd    string `json:"cmd"`
// 	Karma  int    `json:"karma"`
// 	Token  string `json:"token,omitempty"`
// }

// func main() {
// 	fmt.Println("---------------------------")
// 	fmt.Println("Windows Script Host")
// 	fmt.Println("---------------------------")
// 	fmt.Println("🌐 Go Gateway (w/ Nim Immune): 起動完了。")
// 	fmt.Println("---------------------------")

// 	// 玄関口のハンドラー設定（Nim免疫＋Haskell判定＋WSリレー）
// 	http.HandleFunc("/ws", handleSecureBridge)

// 	log.Println("🚀 Go Gateway: 3000番で検閲および検証開始...【ゆうざーの請求趣旨の申し立て受付受理が完了された瞬間です】")
// 	if err := http.ListenAndServe(":3000", nil); err != nil {
// 		log.Fatal("🚨 ゲートウェイ起動失敗:", err)
// 	}
// }

// // 🛡️ 執行ブリッジ：検閲・判定・中継・報復の全権を担う
// func handleSecureBridge(w http.ResponseWriter, r *http.Request) {
// 	ip := r.RemoteAddr
// 	currentTime := time.Now().Format("15:04:05.000")
// 	payload := r.URL.RawQuery

// 	// --- 🛡️ 1. Nim 免疫システムによる直接検閲 (CGO呼び出し) ---
// 	cPayload := C.CString(payload)
// 	defer C.free(unsafe.Pointer(cPayload))
// 	isSafe := C.check_packet_immunity(cPayload)

// 	if !isSafe {
// 		fmt.Printf("🚨 [Immune System] 物理的拒絶: %s からの不純パケットを検知。\n", ip)
		
// 		karmaRegistry.Lock()
// 		karmaRegistry.counts[ip]++ // 免疫を汚した罪として業を加算
// 		karmaRegistry.Unlock()

// 		http.Error(w, "Forbidden by Immune System", http.StatusNotAcceptable)
// 		return
// 	}

// 	// --- ⚖️ 2. Haskell 裁判所へ判定を仰ぐ ---
// 	karmaRegistry.RLock()
// 	currentKarma := karmaRegistry.counts[ip]
// 	karmaRegistry.RUnlock()

// 	// 業（カルマ）を含めて判定を依頼
// 	token, status := askHaskell(ip, currentKarma + 1)

// 	// 🔥 【報復執行】3回目のアタックを確認した場合
// 	if status == "ULTIMATE_REVENGE" {
// 		log.Printf("🔥 【執行戦艦】ターゲット %s の3回目アタックを確認。最大限の倍返し、神速執行！", ip)
// 		executeKarmaSingularity(w, r)
// 		return
// 	}

// 	// 🚫 【棄却】トークンが発行されなかった場合（1-2回目などの不正）
// 	if token == "" {
// 		karmaRegistry.Lock()
// 		karmaRegistry.counts[ip]++
// 		karmaRegistry.Unlock()

// 		log.Printf("⚖️ 主文：本件請求控訴棄却する。 現在状況【ERROR_UNAUTHORIZED】")
// 		log.Printf("🚨 警告：不審なアタック検知（%d回目）。3回目で『山びこ山』が発動します。", karmaRegistry.counts[ip])
// 		log.Println("🚨 速やかに原因を解消して出直してきてください。さもなくば執行取り消し無効とします。")
// 		http.Error(w, "Access Denied", http.StatusForbidden)
// 		return
// 	}

// 	// ✅ 【正常執行】正当なユーザーと認定
// 	log.Println("⚖️ 判決：正当なユーザーと認定。神速執行を開始します。")
// 	log.Println("📢 準備はよろしいですね？いまから判決の請求どおりに請求趣旨GIMINIさん執行をユーザーに届けるため、会場からGEMINIさんのいるところまで正規の手順どおり強行突破で突入して神速に執行満了させるのが私の役目です。よろしいでしょうか？")
// 	log.Println("📢 では正規の強硬するために部屋の鍵解錠を開始します。【当裁判所】policy-server判決趣旨に従って正規に強制開錠開けます。よろしいそれではお願いします。")
// 	log.Printf("⏱️ 執行開始時刻【%s】に基づき、本事件の強制執行を開始いたします。", currentTime)

// 	// WebSocketへアップグレード
// 	client, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Println("🚨 アップグレード失敗:", err)
// 		return
// 	}
// 	defer client.Close()

// 	// Rustバックエンド（金庫）へ接続
// 	h := http.Header{}
// 	h.Add("X-Haskell-Token", token)
// 	backend, _, err := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)
// 	if err != nil {
// 		log.Println("🚨 金庫（Rust）への接続失敗。執行を中断します。")
// 		return
// 	}
// 	defer backend.Close()

// 	log.Println("🔓 【よし、アンロック完了：開きました。本事件に対してユーザーの請求通りGEMINIさんへの会話を届けること許可します】")

// 	// 神速の双方向コピー
// 	done := make(chan struct{})
// 	go func() { copyWS(client, backend); done <- struct{}{} }()
// 	go func() { copyWS(backend, client); done <- struct{}{} }()
// 	<-done

// 	log.Printf("✅ 本日付けの本事案の執行終了時刻【%s】に基づき、本執行を終了いたします。おつかれさまでした。", time.Now().Format("15:04:05.000"))
// }

// // ⚖️ 審判所（Haskell）への判定依頼
// func askHaskell(ip string, karma int) (string, string) {
// 	b, _ := json.Marshal(VerdictRequest{
// 		UserID: ip,
// 		Cmd:    "INIT_SECURE_LIVE",
// 		Karma:  karma,
// 	})

// 	resp, err := http.Post("http://policy-server:8000/check", "application/json", bytes.NewBuffer(b))
// 	if err != nil {
// 		return "", "SERVICE_DOWN"
// 	}
// 	defer resp.Body.Close()

// 	var res map[string]string
// 	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
// 		return "", "DECODE_ERROR"
// 	}

// 	return res["token"], res["status"]
// }

// // 💥 最大限の倍返し（特異点）の物理執行
// func executeKarmaSingularity(w http.ResponseWriter, r *http.Request) {
// 	h := http.Header{}
// 	h.Add("X-Haskell-Token", "ULTIMATE-ECHO-KARMA")
	
// 	client, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil { return }
// 	defer client.Close()

// 	backend, _, err := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)
// 	if err != nil { return }
// 	defer backend.Close()

// 	done := make(chan struct{})
// 	go func() { copyWS(client, backend); done <- struct{}{} }()
// 	go func() { copyWS(backend, client); done <- struct{}{} }()
// 	<-done
// }

// // 🔄 神速のリレー
// func copyWS(dst, src *websocket.Conn) {
// 	for {
// 		mt, msg, err := src.ReadMessage()
// 		if err != nil { return }
// 		if err := dst.WriteMessage(mt, msg); err != nil { return }
// 	}
// }





// package main

// import (
// 	"bytes"
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"sync"
// 	"time"

// 	"github.com/gorilla/websocket"
// )

// // WebSocketアップグレーダーの設定
// var upgrader = websocket.Upgrader{
// 	CheckOrigin: func(r *http.Request) bool { return true },
// }

// // ⚖️ 因果応報の記録簿（IPごとの累積アタック回数）
// var karmaRegistry = struct {
// 	sync.RWMutex
// 	counts map[string]int
// }{counts: make(map[string]int)}

// func main() {
// 	// 玄関口のハンドラー設定
// 	http.HandleFunc("/ws", handleSecureBridge)

// 	log.Println("🚀 Go Gateway: 3000番で検閲および検証開始...【ゆうざーの請求趣旨の申し立て受付受理が完了された瞬間です】")
// 	if err := http.ListenAndServe(":3000", nil); err != nil {
// 		log.Fatal("🚨 ゲートウェイ起動失敗:", err)
// 	}
// }

// // 🛡️ 執行ブリッジ：検閲・判定・中継・報復の全権を担う
// func handleSecureBridge(w http.ResponseWriter, r *http.Request) {
// 	ip := r.RemoteAddr
// 	currentTime := time.Now().Format("15:04:05.000")

// 	// 1. 現在の業（カルマ）を確認
// 	karmaRegistry.RLock()
// 	currentKarma := karmaRegistry.counts[ip]
// 	karmaRegistry.RUnlock()

// 	// 2. Haskell審判所へ判定を仰ぐ（次の回数での判定を依頼）
// 	token, status := askHaskell(currentKarma + 1)

// 	// 🔥 【報復執行】3回目のアタックを確認した場合
// 	if status == "ULTIMATE_REVENGE" {
// 		log.Printf("🔥 【執行戦艦】ターゲット %s の3回目アタックを確認。最大限の倍返し、神速執行！", ip)
// 		executeKarmaSingularity(w, r) // 報復専用の特殊処理へ
// 		return
// 	}

// 	// 🚫 【棄却】トークンが発行されなかった場合（1-2回目などの不正）
// 	if token == "" {
// 		karmaRegistry.Lock()
// 		karmaRegistry.counts[ip]++
// 		karmaRegistry.Unlock()

// 		log.Printf("⚖️ 主文：本件請求控訴棄却する。 現在状況【ERROR_UNAUTHORIZED】")
// 		log.Printf("🚨 警告：不審なアタック検知（%d回目）。3回目で『山びこ山』が発動します。", karmaRegistry.counts[ip])
// 		log.Println("🚨 速やかに原因を解消して出直してきてください。さもなくば執行取り消し無効とします。")
// 		http.Error(w, "Access Denied", http.StatusForbidden)
// 		return
// 	}

// 	// ✅ 【正常執行】正当なユーザーと認定
// 	log.Println("⚖️ 判決：正当なユーザーと認定。神速執行を開始します。")
// 	log.Println("📢 準備はよろしいですね？いまから判決の請求どおりに請求趣旨GIMINIさん執行をユーザーに届けるため、会場からGEMINIさんのいるところまで正規の手順どおり強行突破で突入して神速に執行満了させるのが私の役目です。よろしいでしょうか？")
// 	log.Println("📢 では正規の強硬するために部屋の鍵解錠を開始します。【当裁判所】policy-server判決趣旨に従って正規に強制開錠開けます。よろしいそれではお願いします。")
// 	log.Printf("⏱️ 執行開始時刻【%s】に基づき、本事件の強制執行を開始いたします。", currentTime)

// 	// WebSocketへアップグレード
// 	client, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Println("🚨 アップグレード失敗:", err)
// 		return
// 	}
// 	defer client.Close()

// 	// Rustバックエンド（金庫）へ接続
// 	h := http.Header{}
// 	h.Add("X-Haskell-Token", token)
// 	backend, _, err := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)
// 	if err != nil {
// 		log.Println("🚨 金庫（Rust）への接続失敗。執行を中断します。")
// 		return
// 	}
// 	defer backend.Close()

// 	log.Println("🔓 【よし、アンロック完了：開きました。本事件に対してユーザーの請求通りGEMINIさんへの会話を届けること許可します】")

// 	// 神速の双方向コピー
// 	done := make(chan struct{})
// 	go func() { copyWS(client, backend); done <- struct{}{} }()
// 	go func() { copyWS(backend, client); done <- struct{}{} }()
// 	<-done

// 	log.Printf("✅ 本日付けの本事案の執行終了時刻【%s】に基づき、本執行を終了いたします。おつかれさまでした。", time.Now().Format("15:04:05.000"))
// }

// // ⚖️ 審判所（Haskell）への判定依頼
// func askHaskell(karma int) (string, string) {
// 	// 判決要求データ作成
// 	b, _ := json.Marshal(map[string]interface{}{
// 		"userId": "system-warship",
// 		"cmd":    "INIT_SECURE_LIVE",
// 		"karma":  karma,
// 	})

// 	resp, err := http.Post("http://policy-engine:8000/check", "application/json", bytes.NewBuffer(b))
// 	if err != nil {
// 		return "", "SERVICE_DOWN"
// 	}
// 	defer resp.Body.Close()

// 	var res map[string]string
// 	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
// 		return "", "DECODE_ERROR"
// 	}

// 	return res["token"], res["status"]
// }

// // 💥 最大限の倍返し（特異点）の物理執行
// func executeKarmaSingularity(w http.ResponseWriter, r *http.Request) {
// 	// 報復用トークンを乗せてRustへパス
// 	h := http.Header{}
// 	h.Add("X-Haskell-Token", "ULTIMATE-ECHO-KARMA")
	
// 	client, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil { return }
// 	defer client.Close()

// 	backend, _, err := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)
// 	if err != nil { return }
// 	defer backend.Close()

// 	// 報復の連鎖を開始（Rust側で「山びこ山・終焉」が発動する）
// 	done := make(chan struct{})
// 	go func() { copyWS(client, backend); done <- struct{}{} }()
// 	go func() { copyWS(backend, client); done <- struct{}{} }()
// 	<-done
// }

// // 🔄 神速のリレー（コピー）
// func copyWS(dst, src *websocket.Conn) {
// 	for {
// 		mt, msg, err := src.ReadMessage()
// 		if err != nil {
// 			return
// 		}
// 		if err := dst.WriteMessage(mt, msg); err != nil {
// 			return
// 		}
// 	}
// }



// package main

// import (
// 	"bytes"
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"time"
// 	"github.com/gorilla/websocket"
// )

// var upgrader = websocket.Upgrader{ CheckOrigin: func(r *http.Request) bool { return true } }



// // 因果応報の記録簿（IPごとの累積アタック回数）
// var karmaRegistry = struct {
//     sync.RWMutex
//     counts map[string]int
// }{counts: make(map[string]int)}
// func main() {
// 	http.HandleFunc("/ws", handleSecureBridge)
// 	log.Println("🚀 Go Gateway: 3000番で検閲および検証開始...【ゆうざーの請求趣旨の申し立て受付受理が完了された瞬間です】")
// 	http.ListenAndServe(":3000", nil)
// }

// func handleSecureBridge(w http.ResponseWriter, r *http.Request) {
// 	token := askHaskell()
// 	currentTime := time.Now().Format("15:04:05.000") // ミリ秒まで記録

// 	if token == "" {
// 		log.Printf("⚖️ 主文：本件請求控訴棄却する。 現在状況【ERROR_UNAUTHORIZED】")
// 		log.Println("🚨 速やかに原因を解消して出直してきてください。さもなくば執行取り消し無効とします。")
// 		return
// 	}

// 	log.Println("📢 準備はよろしいですね？いまから判決の請求どおりに請求趣旨GIMINIさん執行をユーザーに届けるため、会場からGEMINIさんのいるところまで正規の手順どおり強行突破で突入して神速に執行満了させるのが私の役目です。よろしいでしょうか？")
// 	log.Println("📢 では正規の強硬するために部屋の鍵解錠を開始します。【当裁判所】policy-server判決趣旨に従って正規に強制開錠開けます。よろしいそれではお願いします。")
// 	log.Printf("⏱️ 執行開始時刻【%s】に基づき、本事件の強制執行を開始いたします。", currentTime)

// 	client, _ := upgrader.Upgrade(w, r, nil)
// 	h := http.Header{}; h.Add("X-Haskell-Token", token)
// 	backend, _, _ := websocket.DefaultDialer.Dial("ws://rust-backend:5000/ws", h)

// 	log.Println("🔓 【アンロック完了：開きました。本事件に対してユーザーの請求通りGEMINIさんへの会話を届けること許可します】")

// 	done := make(chan struct{})
// 	go func() { copyWS(client, backend); done <- struct{}{} }()
// 	go func() { copyWS(backend, client); done <- struct{}{} }()
// 	<-done

// 	log.Printf("✅ 本日付けの本事案の執行終了時刻【%s】に基づき、本執行を終了いたします。おつかれさまでした。", time.Now().Format("15:04:05.000"))
// }

// func handleSecureBridge(w http.ResponseWriter, r *http.Request) {
//     ip := r.RemoteAddr
    
//     karmaRegistry.RLock()
//     currentKarma := karmaRegistry.counts[ip]
//     karmaRegistry.RUnlock()

//     // ⚖️ 運命の分岐点：3回目のアタックか？
//     token, status := askHaskell(currentKarma + 1)

//     if status == "ULTIMATE_REVENGE" {
//         log.Printf("🔥 【執行戦艦】ターゲット %s の3回目アタックを確認。最大限の倍返し、神速執行！", ip)
//         executeKarmaSingularity(w, r) // Rustへ報復命令を伝達
//         return
//     }

//     if token == "" {
//         karmaRegistry.Lock()
//         karmaRegistry.counts[ip]++
//         karmaRegistry.Unlock()
//         log.Printf("🚨 警告：アタック検知（%d回目）。3回目で『山びこ山』が発動します。", karmaRegistry.counts[ip])
//         http.Error(w, "Access Denied", http.StatusForbidden)
//         return
//     }

//     // 正常な執行（Gemini Live接続）
//     log.Println("⚖️ 判決：正当なユーザーと認定。神速執行を開始します。")
// }

// func copyWS(dst, src *websocket.Conn) {
// 	for {
// 		mt, msg, err := src.ReadMessage()
// 		if err != nil { return }
// 		dst.WriteMessage(mt, msg)
// 	}
// }

// func askHaskell() string {
// 	b, _ := json.Marshal(map[string]string{"userId": "system", "cmd": "INIT_SECURE_LIVE"})
// 	resp, err := http.Post("http://policy-engine:8000/check", "application/json", bytes.NewBuffer(b))
// 	if err != nil { return "" }
// 	var res map[string]string
// 	json.NewDecoder(resp.Body).Decode(&res)
// 	return res["token"]
// }

// // package main

// // import (
// //     "log"
// //     "net/http"
// //     "net/http/httputil"
// //     "net/url"
// // )

// // func main() {
// //     // Rustサーバーの住所
// //     target, _ := url.Parse("http://backend:8080")
// //     proxy := httputil.NewSingleHostReverseProxy(target)

// //     http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
// //         log.Println("🛡️ Go Gateway: 通信を検閲中...")
// //         // ここで認証やアクセス制限を行う（Goの得意分野！）
// //         proxy.ServeHTTP(w, r)
// //     })

// //     log.Println("🚀 Go Gateway: 3000番ポートで検問開始...")
// //     log.Fatal(http.ListenAndServe(":3000", nil))
// // }
// // package main

// // import (
// // 	"bytes"
// // 	"encoding/json"
// // 	"log"
// // 	"net/http"
// // 	"net/http/httputil"
// // 	"net/url"
// // )

// // // Haskell（審判）への判定依頼
// // // Haskellに送るリクエストの構造
// // type PolicyCheckRequest struct {
// // 	UserID  string `json:"userId"`
// // 	Command string `json:"cmd"`
// // }

// // // Haskell（審判）からの回答
// // // Haskellから返ってくるレスポンスの構造
// // type PolicyResponse struct {
// // 	Status string `json:"status"`
// // 	Token  string `json:"token"`
// // }

// // func main() {
// // 	// 🏠 送り先（Rust）と ⚖️ 審判（Haskell）の住所を設定 // 🛡️ 送り先（Rust金庫）の住所
// // 	// 🏠 送り先（Rust backend）と ⚖️ 審判所（Haskell policy-engine）の住所
// // 	// Docker Composeのサービス名に合わせて修正
// // 	rustURL, _ := url.Parse("http://rust-backend:5000")
// // 	haskellURL := "http://policy-engine:8000/check"
// //     // 🔄 プロキシ（右から左へ受け流す）の設定
// // 	proxy := httputil.NewSingleHostReverseProxy(rustURL)

// // 	// すべてのアクセスをここで受け止める
// // 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// // 		log.Printf("📥 検問所(Go)通過中: %s %s", r.Method, r.URL.Path)
// // 		log.Printf("📥 検問所通過: %s %s", r.Method, r.URL.Path)
// //         log.Println("⚖️ Go Gateway: Haskell審判所にアクセス許可を確認中...")
// // 		// 🛡️ ステップ1: Haskell審判所に許可を求める
// // 		checkReq := PolicyCheckRequest{
// // 			UserID:  "user-123",
// // 			Command: "INIT_SECURE_LIVE", 
// // 		}
// // 		jsonData, _ := json.Marshal(checkReq)
// //         // 2. Haskell (Policy Engine) に判定を仰ぐ
// // 		resp, err := http.Post(haskellURL, "application/json", bytes.NewBuffer(jsonData))
		
// // 		// HaskellがNOと言った、あるいはHaskellが落ちている場合は即座に遮断
// // 		if err != nil || resp.StatusCode != http.StatusOK {
// // 			log.Printf("🚫 拒否: Haskell審判所が許可しませんでした")
// // 			log.Printf("🚫 拒否: HaskellがNOと言っています (Status: %v)", resp.StatusCode)
// // 			http.Error(w, "Policy Violation: Access Denied by Haskell", http.StatusForbidden)
// // 			http.Error(w, "Access Denied by Haskell", http.StatusForbidden)
// // 			return
// // 		}

// // 		// 🛡️ ステップ2: 許可証（Token）を読み取る
// // 		// 3. Haskellからの許可証（トークン）を読み取る
// // 		var pResp PolicyResponse
// // 		json.NewDecoder(resp.Body).Decode(&pResp)
// // 		log.Printf("✅ 許可されました。Token: %s", pResp.Token)

// // 		// 🛡️ ステップ3: 許可されたので、Rustへデータを渡す準備をして実行！
// // 		r.Header.Set("X-Haskell-Token", pResp.Token)

// //         // 4. 許可されたので、Rustバックエンドへ中継
// // 		// ここでヘッダーを検証したり、ログを取ったりできる（セキュリティ層）
// // 		r.Host = rustURL.Host
// // 		log.Printf("✅ 許可: Rustへリレーします (Token: %s)", pResp.Token)
// // 		proxy.ServeHTTP(w, r)
// // 	})
    
// // 	log.Println("🚀 5段階要塞・第2層(Go Gateway): 3000番ポートで検問中...")
// // 	log.Println("🚀 Go Gateway: 3000番ポートで検問中（Rustへ転送します）...")
// // 	log.Println("🚀 5段階要塞・玄関口(Go): 3000番ポートで監視中...")
// // 	log.Println("🚀 5段階要塞・玄関(Go): 3000番ポートで検問中...")
// // 	log.Fatal(http.ListenAndServe(":3000", nil))
// // }

// // package main

// // import (
// // 	"bytes"
// // 	"encoding/json"
// // 	"io"
// // 	"log"
// // 	"net/http"
// // 	"net/url"
// // )

// // // Haskellへの判定依頼
// // type PolicyCheckRequest struct {
// // 	UserID  string `json:"userId"`
// // 	Command string `json:"cmd"`
// // }

// // type PolicyResponse struct {
// // 	Status string `json:"status"`
// // 	Token  string `json:"token"`
// // }

// // // グローバルにClientを持つことで、接続を使い回し爆速にする
// // var httpClient = &http.Client{}

// // func main() {
// // 	haskellURL := "http://policy-engine:8000/check"
// // 	rustURL, _ := url.Parse("http://rust-backend:5000")

// // 	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
// // 		// 1. Haskell審判所に超特急で問い合わせ
// // 		checkReq := PolicyCheckRequest{
// // 			UserID:  "user-123",
// // 			Command: "INIT_SECURE_LIVE",
// // 		}
// // 		body, _ := json.Marshal(checkReq)

// // 		resp, err := httpClient.Post(haskellURL, "application/json", bytes.NewBuffer(body))
// // 		if err != nil || resp.StatusCode != http.StatusOK {
// // 			log.Println("🚫 検問拒否: 不正なアクセスを検知しました")
// // 			http.Error(w, "Forbidden", http.StatusForbidden)
// // 			return
// // 		}

// // 		// 2. 許可証（トークン）を読み取る
// // 		var policyResp PolicyResponse
// // 		json.NewDecoder(resp.Body).Decode(&policyResp)
// // 		resp.Body.Close()

// // 		// 3. 許可されたリクエストに「特製ヘッダー」を付けてRustへ転送
// // 		log.Printf("✅ 許可証発行: %s -> Rustへ転送します", policyResp.Token)
		
// // 		r.Header.Set("X-Haskell-Token", policyResp.Token)
		
// // 		// ここでWebSocketプロキシを実行（以降はGoが中継役に徹する）
// // 		serveReverseProxy(rustURL, w, r)
// // 	})

// // 	log.Println("🚀 爆速検問所 (Go Gateway) 3000番で待機中...")
// // 	log.Fatal(http.ListenAndServe(":3000", nil))
// // }

// // // 実際のリレー部分（簡易版）
// // func serveReverseProxy(target *url.Parse, w http.ResponseWriter, r *http.Request) {
// //     // ここで実際にRustへデータを流す（httputil.NewSingleHostReverseProxyなど）
// // }

// // // package main

// // // import (
// // // 	"log"
// // // 	"net/http"
// // // 	"net/http/httputil"
// // // 	"net/url"
// // // )

// // // func main() {
// // // 	// 🛡️ 送り先（Rust金庫）の住所
// // // 	remote, err := url.Parse("http://127.0.0.1:5000")
// // // 	if err != nil {
// // // 		panic(err)
// // // 	}

// // // 	// 🔄 プロキシ（右から左へ受け流す）の設定
// // // 	proxy := httputil.NewSingleHostReverseProxy(remote)

// // // 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// // // 		log.Printf("📥 検問所通過: %s %s", r.Method, r.URL.Path)
		
// // // 		// ここでヘッダーを検証したり、ログを取ったりできる（セキュリティ層）
// // // 		r.Host = remote.Host
// // // 		proxy.ServeHTTP(w, r)
// // // 	})

// // // 	log.Println("🚀 Go Gateway: 3000番ポートで検問中（Rustへ転送します）...")
// // // 	err = http.ListenAndServe(":3000", nil)
// // // 	if err != nil {
// // // 		log.Fatal(err)
// // // 	}
// // // }
// // // package main

// // // import (
// // // 	"bytes"
// // // 	"encoding/json"
// // // 	"fmt"
// // // 	"io"
// // // 	"log"
// // // 	"net/http"
// // // 	"net/http/httputil"
// // // 	"net/url"
// // // )

// // // // Haskellに送るリクエストの構造
// // // type PolicyCheckRequest struct {
// // // 	UserID  string `json:"userId"`
// // // 	Command string `json:"cmd"`
// // // }

// // // // Haskellから返ってくるレスポンスの構造
// // // type PolicyResponse struct {
// // // 	Status string `json:"status"`
// // // 	Token  string `json:"token"`
// // // }

// // // func main() {
// // // 	// 🏠 各コンテナの住所（Docker-composeでのサービス名を使用）
// // // 	rustURL, _ := url.Parse("http://rust-backend:5000")
// // // 	haskellURL := "http://policy-engine:8000/check"

// // // 	proxy := httputil.NewSingleHostReverseProxy(rustURL)

// // // 	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
// // // 		log.Println("⚖️ Go Gateway: Haskell審判所にアクセス許可を確認中...")

// // // 		// 1. Haskellへの問い合わせデータ作成
// // // 		checkReq := PolicyCheckRequest{
// // // 			UserID:  "user-123",        // 本来はCookieやヘッダーから取得
// // // 			Command: "INIT_SECURE_LIVE", 
// // // 		}
// // // 		jsonData, _ := json.Marshal(checkReq)

// // // 		// 2. Haskell (Policy Engine) に判定を仰ぐ
// // // 		resp, err := http.Post(haskellURL, "application/json", bytes.NewBuffer(jsonData))
// // // 		if err != nil || resp.StatusCode != http.StatusOK {
// // // 			log.Printf("🚫 拒否: HaskellがNOと言っています (Status: %v)", resp.StatusCode)
// // // 			http.Error(w, "Policy Violation: Access Denied by Haskell", http.StatusForbidden)
// // // 			return
// // // 		}

// // // 		// 3. Haskellからの許可証（トークン）を読み取る
// // // 		var pResp PolicyResponse
// // // 		json.NewDecoder(resp.Body).Decode(&pResp)
// // // 		log.Printf("✅ 許可されました。Token: %s", pResp.Token)

// // // 		// 4. 許可されたので、Rustバックエンドへ中継
// // // 		r.Header.Set("X-Haskell-Token", pResp.Token) // Rust側に許可証を渡す
// // // 		r.Host = rustURL.Host
// // // 		proxy.ServeHTTP(w, r)
// // // 	})

// // // 	log.Println("🚀 5段階要塞・玄関口(Go): 3000番ポートで監視中...")
// // // 	log.Fatal(http.ListenAndServe(":3000", nil))
// // // }