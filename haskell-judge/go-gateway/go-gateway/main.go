// package main

// import (
// 	"fmt"
// 	"io"
// 	"net/http"
// )

// func main() {
// 	// ユーザーがアクセスしてきた時の処理
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		fmt.Println("Go: ユーザーが来ました。Haskell審判所に問い合わせます...")

// 		// 1. Haskell (Port 8000) に問い合わせ
// 		resp, err := http.Get("http://localhost:8000")
// 		if err != nil {
// 			fmt.Println("Haskellサーバーに接続できません:", err)
// 			http.Error(w, "審判所と連絡が取れません", http.StatusServiceUnavailable)
// 			return
// 		}
// 		defer resp.Body.Close()

// 		// 2. Haskellからの返事（ALLOWED）を読む
// 		body, _ := io.ReadAll(resp.Body)
// 		judge := string(body)

// 		// 3. ユーザーに結果を返す
// 		fmt.Fprintf(w, "Go Gateway: Haskellの判定は [%s] です！", judge)
// 	})

// 	fmt.Println("Go 受付係が Port 8080 で起動しました！")
// 	http.ListenAndServe(":8080", nil)
// }

// ---

// ### Step 2: Go（受付）の改造
// 次に、Goの `main.go` を書き換えます。Go側からHaskellへ「合言葉」を送り届けるようにします。

// ```go
// package main

// import (
// 	"fmt"
// 	"io"
// 	"net/http"
// )

// func main() {
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		// ユーザーがブラウザで入力した「?pass=...」をそのまま取得
// 		pass := r.URL.Query().Get("pass")
// 		fmt.Printf("Go: ユーザーからパスワード [%s] を受け取りました。\n", pass)

// 		// Haskellへ問い合わせ（合言葉を後ろにくっつけて送信）
// 		haskellURL := fmt.Sprintf("http://localhost:8000?pass=%s", pass)
// 		resp, err := http.Get(haskellURL)
		
// 		if err != nil {
// 			http.Error(w, "審判所と通信不能", 503)
// 			return
// 		}
// 		defer resp.Body.Close()

// 		body, _ := io.ReadAll(resp.Body)
// 		judge := string(body)

// 		// 結果によって表示を変える
// 		if judge == "ALLOWED" {
// 			fmt.Fprintf(w, "🎉 【成功】扉が開きました！判定: %s", judge)
// 		} else {
// 			fmt.Fprintf(w, "🚫 【失敗】門前払いされました。判定: %s", judge)
// 		}
// 	})

// 	fmt.Println("Go ゲートウェイ (Port 8080) で受付中...")
// 	http.ListenAndServe(":8080", nil)
// }


// ### Step 2: Go（受付）の改造
// 次に、Goの `main.go` を書き換えます。Go側からHaskellへ「合言葉」を送り届けるようにします。
package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// ユーザーがブラウザで入力した「?pass=...」をそのまま取得
		pass := r.URL.Query().Get("pass")
		fmt.Printf("Go: ユーザーからパスワード [%s] を受け取りました。\n", pass)

		// Haskellへ問い合わせ（合言葉を後ろにくっつけて送信）
		haskellURL := fmt.Sprintf("http://localhost:8000?pass=%s", pass)
		resp, err := http.Get(haskellURL)
		
		if err != nil {
			http.Error(w, "審判所と通信不能", 503)
			return
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		judge := string(body)

		// 結果によって表示を変える
		if judge == "ALLOWED" {
			fmt.Fprintf(w, "🎉 【成功】扉が開きました！判定: %s", judge)
		} else {
			fmt.Fprintf(w, "🚫 【失敗】門前払いされました。判定: %s", judge)
		}
	})

	fmt.Println("Go ゲートウェイ (Port 8080) で受付中...")
	http.ListenAndServe(":8080", nil)
}