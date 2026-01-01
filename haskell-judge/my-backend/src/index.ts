export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "POST") {
      try {
        const data: any = await request.json();
        let result = "分析中...";

        // 指の形で判定するロジック
        if (data.thumb_up === true) {
          result = "「良い」「わかった」という意味の手話ですね！";
        } else if (data.index_finger === true) {
          result = "「数字の1」または「これ」を指しています。";
        } else {
          result = "別の手話を分析しています...";
        }

        return new Response(JSON.stringify({ translation: result }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
      } catch (err) {
        return new Response("エラー: 正しいデータを送ってください", { status: 400 });
      }
    }
    return new Response("手話翻訳APIサーバー稼働中。データを送信してください。");
  }
};