{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

module Main where

import Web.Scotty
import Data.Aeson (object, (.=), FromJSON)
import GHC.Generics (Generic)
import Control.Monad.IO.Class (liftIO)

data CheckRequest = CheckRequest { userId :: String, cmd :: String } deriving (Generic)
instance FromJSON CheckRequest

main :: IO ()
main = scotty 8000 $ do
    post "/check" $ do
        req <- jsonData :: ActionM CheckRequest
        if cmd req == "INIT_SECURE_LIVE"
            then do
                liftIO $ putStrLn "⚖️ 【当裁判所】policy-server判決趣旨に従って正規に強制開錠の許可（トークン）を発行する。"
                json $ object ["status" .= ("OK" :: String), "token" .= ("HS-PROOF-99" :: String)]
            else do
                json $ object ["error" .= ("REJECTED" :: String)]


-- ... 既存の定義
data CheckRequest = CheckRequest { karmaCount :: Int, cmd :: String } deriving (Generic)

main = scotty 8000 $ do
    post "/check" $ do
        req <- jsonData :: ActionM CheckRequest
        let count = karmaCount req
        
        if count >= 3
            then do
                liftIO $ putStrLn "⚖️ 【最終判決】三度目の不敬。最大限の倍返し、因果応報を執行せよ。"
                json $ object [
                    "status" .= ("ULTIMATE_REVENGE" :: String),
                    "token" .= ("ULTIMATE-ECHO-KARMA" :: String)
                ]
            else if cmd req == "INIT_SECURE_LIVE"
                then json $ object ["status" .= ("OK"), "token" .= ("HS-PROOF-99")]
                else json $ object ["status" .= ("REJECTED")]