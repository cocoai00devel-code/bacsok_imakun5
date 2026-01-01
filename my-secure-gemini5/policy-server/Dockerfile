# ==========================================
# ステージ1: 依存関係のキャッシュ（ここが爆速の肝）
# ==========================================
FROM haskell:9.6 AS ingredient
WORKDIR /opt/policy-server

# 先に .cabal ファイルだけをコピー
COPY *.cabal ./

# 依存関係のみをビルド（ソースコードがない状態でライブラリだけ固める）
# これにより、Main.hs を書き換えてもこのステップはスキップされる
RUN cabal update && cabal build --only-dependencies -j

# ==========================================
# ステージ2: アプリのビルド
# ==========================================
FROM ingredient AS builder
COPY . .
# 既に依存関係はビルド済みなので、自分のコードのコンパイル（数秒）だけで終わる
RUN cabal build -j

# ==========================================
# ステージ3: 本番用（最小・最強の要塞）
# ==========================================
# 実行には重い Haskell 環境は不要。最小限の OS (Ubuntu) を使用
FROM ubuntu:22.04 AS runner
WORKDIR /opt/app

# セキュリティ対策：実行に必要な最小限のライブラリのみインストール
RUN apt-get update && apt-get install -y libgmp10 libffi8 ca-certificates && rm -rf /var/lib/apt/lists/*

# ビルドステージから実行バイナリだけを「摘み取る」
COPY --from=builder /opt/policy-server/dist-newstyle/build/*/ghc-*/policy-server-*/x/policy-server/build/policy-server/policy-server .

# セキュリティ対策：rootユーザーではなく一般ユーザーで実行（推奨）
RUN useradd -m haskelluser
USER haskelluser

EXPOSE 8000
CMD ["./policy-server"]


# --- ビルド用ステージ ---
# FROM haskell:9.6 AS builder
# WORKDIR /opt/policy-server
# COPY . .
# RUN cabal update && cabal build

# # --- 実行用ステージ（軽量化） ---
# FROM ubuntu:22.04
# WORKDIR /opt/app
# # ビルドしたバイナリだけを持ってくる
# COPY --from=builder /opt/policy-server/dist-newstyle/build/*/ghc-*/policy-server-*/x/policy-server/build/policy-server/policy-server .
# EXPOSE 8000
# CMD ["./policy-server"]