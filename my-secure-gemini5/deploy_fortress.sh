#!/bin/bash

# ==========================================================
# 🛡️ THE ULTIMATE FORTRESS: TOTAL DEPLOYMENT SCRIPT
# ==========================================================

set -e # エラーが発生した時点で停止

echo "---------------------------"
echo "The Ultimate Fortress"
echo "---------------------------"
echo "⚖️  要塞デプロイ・シーケンス（完全統合版）を開始します。"
echo "---------------------------"

# 1. 🧬 DNA (Nix) の確認
if command -v nix > /dev/null; then
    echo "🧬 [Nix Check] 環境を確認。純粋なビルド空間から全言語を召喚します。"
else
    echo "⚠️ [Warning] Nix が見つかりません。標準環境でのビルドを試みます。"
fi

# 2. 🧪 免疫層 (Nim) の抽出
echo "🧪 [Immune Build] Nim 免疫システムを共有ライブラリとして抽出中..."
if [ -d "gateway/immune" ]; then
    cd gateway/immune
    nim c --app:lib --out:../libimmune.so immune.nim
    cd ../..
else
    echo "⏭️  Nim ソースが見つからないためスキップします。"
fi

# 3. 🌐 玄関 (Go) の構築
echo "🌐 [Gateway Build] Go 玄関のビルドを開始..."
if [ -d "gateway" ]; then
    cd gateway
    go mod tidy || true
    go build -o gateway_service main.go
    cd ..
fi

# 3.5 🎨 管制塔 (React/TS) の同期 【重要】
echo "🎨 [Frontend Prep] 管制塔（React/TypeScript）の依存関係を同期中..."
if [ -d "frontend" ]; then
    cd frontend
    # Nix (flake.nix) で提供された nodejs_20 / npm を使用
    npm install 
    cd ..
else
    echo "⚠️ frontend ディレクトリが不在です。フロントエンドをスキップします。"
fi

# 4. 🏗️ 全レイヤー (Haskell/Rust/Zig/Elixir) のコンテナビルド
echo "🏗️  [Container Build] 全レイヤー（Haskell, Rust, Zig, Elixir）を構築します。"
docker-compose build --no-cache

# 5. 🏛️ 要塞の起動（執行）
echo "🏛️  [Activation] 全システム、チェック。執行を開始します。"
docker-compose up -d

echo "---------------------------"
echo "OK"
echo "---------------------------"
echo "✅ 要塞は正常に起動し、全ての魔導書（言語）が同期されました。"
echo "---------------------------"
echo "🎨 管制 (React/TS): http://localhost:5173"
echo "🌐 玄関 (Go/Nim):    http://localhost:3000"
echo "⚖️  裁判 (Haskell/F*): Port 8000"
echo "🛡️  執行 (Rust/Zig):   Port 5000"
echo "👁️  監視 (Elixir):     Supervisor Active"
echo "---------------------------"



# #!/bin/bash

# # ==========================================================
# # 🛡️ THE ULTIMATE FORTRESS: DEPLOYMENT SCRIPT
# # ==========================================================

# set -e # エラーが発生した時点で停止

# echo "---------------------------"
# echo "Windows Script Host"
# echo "---------------------------"
# echo "⚖️  要塞デプロイ・シーケンスを開始します。"
# echo "---------------------------"

# # 1. DNA (Nix) の確認
# if command -v nix > /dev/null; then
#     echo "🧬 [DNA Check] Nix 環境を確認。純粋なビルド空間を確保します。"
# else
#     echo "⚠️ [DNA Warning] Nix が見つかりません。通常の環境でビルドを試みます。"
# fi

# # 2. 免疫層 (Nim) のコンパイル
# echo "🧪 [Immune Build] Nim 免疫システムを共有ライブラリとして抽出中..."
# cd gateway/immune
# # サブフォルダ構成に合わせて共有ライブラリを生成
# nim c --app:lib --out:../libimmune.so immune.nim
# cd ../..

# # 3. 玄関 (Go) のビルド準備
# echo "🌐 [Gateway Build] Go 玄関のビルドを開始..."
# cd gateway
# go mod tidy || true
# go build -o gateway_service main.go
# cd ..

# # 4. 判定官 (Haskell) & 執行官 (Rust) のコンテナビルド
# echo "🏗️  [Container Build] 全レイヤーの Docker イメージを構築します。"
# docker-compose build --no-cache

# # 5. 要塞の起動
# echo "🏛️  [Activation] 全システム、チェック。執行を開始します。"
# docker-compose up -d

# echo "---------------------------"
# echo "OK"
# echo "---------------------------"
# echo "✅ 要塞は正常に起動しました。"
# echo "🌐 Gateway: Port 3000"
# echo "🏛️  Policy: Port 8000"
# echo "🛡️  Backend: Port 5000"
# echo "---------------------------"