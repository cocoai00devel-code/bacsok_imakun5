{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

module Main where

import Web.Scotty
import Data.Aeson (object, (.=), FromJSON, ToJSON)
import GHC.Generics (Generic)
import Control.Monad.IO.Class (liftIO)
import Network.HTTP.Types (status403)
import qualified Data.Text as T
import qualified Data.Text.Lazy as TL

-- 🛡️ [核: F*証明ロジックの継承] 
-- SecurityPolicy.fst で証明された「真理」をここに定義
isFStarValid :: T.Text -> Bool
isFStarValid t = t == "HS-PROOF-99"

-- 🛡️ F* (SecurityPolicy.fst) の真理に基づく定数
validToken :: String
validToken = "HS-PROOF-99"
-- ⚖️ 請求趣旨申し立て（リクエスト）の構造
-- Go Gatewayから送られてくる「業（karma）」と「コマンド」を統合
data CheckRequest = CheckRequest 
    { userId :: Maybe String -- ユーザーID（任意）　-- ユーザーID
    , cmd    :: String       -- 実行コマンド　　　-- 実行コマンド
    , karma  :: Int          -- 累積アタック回数（業）　-- 累積アタック回数（業）
    , token  :: Maybe String -- 検証用トークン（任意）　-- 検証用トークン
    } deriving (Generic)　　　

instance FromJSON CheckRequest

-- ⚖️ 裁判所からの判決構造（レスポンス）
data VerdictResponse = VerdictResponse
    { status :: String
    , token_out :: String -- JSON上は "token" として出力
    } deriving (Show, Generic)

- ToJSONのカスタム定義で "token" キーに対応
instance ToJSON VerdictResponse where
    toJSON (VerdictResponse s t) = object ["status" .= s, "token" .= t]

main :: IO ()
-- main = scotty 8000 $ do
    -- ⚖️ 判決公判（エンドポイント）
　　main = do
    liftIO $ putStrLn "---------------------------"
    liftIO $ putStrLn "Windows Script Host"
    liftIO $ putStrLn "---------------------------"
    liftIO $ putStrLn "⚖️ Haskell Policy Server: 判決公判を開始します。"
    liftIO $ putStrLn "🛡️ 核(F*)の論理: 業(Karma) 3 以上で物理執行。"
    liftIO $ putStrLn "---------------------------"
    post "/check" $ do
        req <- jsonData :: ActionM CheckRequest
        let count = karma req
        let command = cmd req
        
        -- 1. 🔥 【因果応報：最大限の倍返し宣告】
        -- 3回以上の不届きな振る舞いが確認された場合、特異点トラップを宣告する
        if count >= 3
            then do
                liftIO $ putStrLn "---------------------------"
                liftIO $ putStrLn "Windows Script Host"
                liftIO $ putStrLn "---------------------------"
                liftIO $ putStrLn "⚖️ 【最終判決】三度目の不敬。最大限の倍返し、因果応報を執行せよ。"
                liftIO $ putStrLn "---------------------------"
                json $ object [
                    "status" .= ("ULTIMATE_REVENGE" :: String),
                    "token"  .= ("ULTIMATE-ECHO-KARMA" :: String)
                    ]

            -- 2. ✅ 【正規判決：強制開錠の許可】
            -- コマンドが正当であり、かつ業が臨界点に達していない場合
            else if command == "INIT_SECURE_LIVE"
                then do
                    liftIO $ putStrLn "---------------------------"
                    liftIO $ putStrLn "Windows Script Host"
                    liftIO $ putStrLn "---------------------------"
                    liftIO $ putStrLn "⚖️ 【当裁判所】policy-server判決趣旨に従って正規に強制開錠の許可（トークン）を発行する。"
                    liftIO $ putStrLn "⚖️ 【当裁判所】F*証明済ロジックに従い、（policy-server判決趣旨）正規の強制開錠（HS-PROOF-99）を発行する。"
                    liftIO $ putStrLn "---------------------------"
                    liftIO $ putStrLn "OK"
                    liftIO $ putStrLn "---------------------------"
                    json $ object [
                        "status" .= ("OK" :: String), 
                        "token"  .= ("HS-PROOF-99" :: String)
                        ]
                
                -- 3. 🛡️ 【トークン再検証】
                -- すでに所持しているトークンがF*の「真理」に合致するか確認
                else case token req of
                    Just t | isFStarValid (T.pack t) -> do
                        liftIO $ putStrLn "✅ [Policy Engine] 執行令状の正当性を再確認。アクセスを継続許可します。"
                        json $ object ["status" .= ("OK" :: String)]

                    -- 4. 🚫 【棄却判決】
                    _ -> do
                        liftIO $ putStrLn "---------------------------"
                        liftIO $ putStrLn "Windows Script Host"
                        liftIO $ putStrLn "---------------------------"
                        liftIO $ putStrLn "⚖️ 【判決】請求棄却。不正なコマンドまたは手続き不備。"
                        liftIO $ putStrLn "---------------------------"
                        status status403
                        json $ object [
                            "status" .= ("REJECTED" :: String),
                            "error"  .= ("INVALID_COMMAND" :: String)
                            ]