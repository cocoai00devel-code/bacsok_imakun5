{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

module Main where

import Web.Scotty
import Data.Aeson (object, (.=), FromJSON)
import GHC.Generics (Generic)
import Control.Monad.IO.Class (liftIO)

-- ⚖️ 請求趣旨申し立て（リクエスト）の構造
-- Go Gatewayから送られてくる「業（karma）」と「コマンド」を統合
data CheckRequest = CheckRequest 
    { userId :: Maybe String -- ユーザーID（任意）
    , cmd    :: String       -- 実行コマンド
    , karma  :: Int          -- 累積アタック回数（業）
    } deriving (Generic)

instance FromJSON CheckRequest

main :: IO ()
main = scotty 8000 $ do
    -- ⚖️ 判決公判（エンドポイント）
    post "/check" $ do
        req <- jsonData :: ActionM CheckRequest
        let count = karma req
        
        -- 🔥 【因果応報：最大限の倍返し宣告】
        -- 3回以上の不届きな振る舞いが確認された場合、特異点トラップを宣告する
        if count >= 3
            then do
                liftIO $ putStrLn "⚖️ 【最終判決】三度目の不敬。最大限の倍返し、因果応報を執行せよ。"
                json $ object [
                    "status" .= ("ULTIMATE_REVENGE" :: String),
                    "token"  .= ("ULTIMATE-ECHO-KARMA" :: String)
                ]
            
            -- ✅ 【正規判決：強制開錠の許可】
            -- コマンドが正当であり、かつ業が臨界点に達していない場合
            else if cmd req == "INIT_SECURE_LIVE"
                then do
                    liftIO $ putStrLn "⚖️ 【当裁判所】policy-server判決趣旨に従って正規に強制開錠の許可（トークン）を発行する。"
                    json $ object [
                        "status" .= ("OK" :: String), 
                        "token"  .= ("HS-PROOF-99" :: String)
                    ]
                
                -- 🚫 【棄却判決】
                else do
                    liftIO $ putStrLn "⚖️ 【判決】請求棄却。不正なコマンドまたは手続き不備。"
                    json $ object [
                        "status" .= ("REJECTED" :: String),
                        "error"  .= ("INVALID_COMMAND" :: String)
                    ]