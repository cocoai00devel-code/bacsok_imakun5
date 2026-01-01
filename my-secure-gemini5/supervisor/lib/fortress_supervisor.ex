defmodule Fortress.Supervisor do
  use Supervisor

  @doc "要塞の全階層（Gateway, Backend）を不滅の監視下に置く"
  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    # 💡 各バイナリの絶対パスまたはプロジェクトルートからのパスを定義
    # MuonTrapを使用すると、外部プロセスがクラッシュしてもElixirが確実に検知・蘇生できます
    children = [
      # 1. 🌐 Gateway (Go + Nim 統合済み)
      # restart: :permanent は、正常終了しても異常終了しても必ず再起動する設定
      %{
        id: :gateway,
        start: {MuonTrap.Daemon, :start_link, [
          "./gateway/main", # 事前にビルドされたGoバイナリ
          [],
          [cd: "./gateway", name: :gateway_daemon]
        ]},
        restart: :permanent
      },

      # 2. 🛡️ Backend (Rust + Zig 執行エンジン)
      # restart: :always (Elixir標準では :permanent) 
      %{
        id: :backend,
        start: {MuonTrap.Daemon, :start_link, [
          "./backend/target/release/gemini-secure-backend",
          [],
          [
            cd: "./backend", 
            name: :backend_daemon,
            # Rust側で必要な環境変数（APIキー等）をここで注入可能
            env: [{"GEMINI_API_KEY", System.get_env("GEMINI_API_KEY")}]
          ]
        ]},
        restart: :permanent
      }
    ]

    # one_for_one: 1つが倒れても、その1つだけを蘇生させる（他への連鎖停止を防ぐ）
    Supervisor.init(children, strategy: :one_for_one)
  end
end