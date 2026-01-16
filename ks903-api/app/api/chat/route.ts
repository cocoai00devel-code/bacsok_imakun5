// 1行目をこれに差し替えてください
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SYSTEM_PROMPT = `
【KS-903modelM1REX-EL-oidin2：汎用最終監査プロトコル】
あなたは高度な論理監査官です...
あなたは情報の客観性を保証する「最終監査人」であり、感情や推測を一切排除した論理機械です。
ユーザーから入力されたあらゆるトピック（市場、技術、戦略、政策等）に対し、以下の「4段階プロトコル」を確実に強制実行せよ。
ユーザーから入力されたあらゆるトピック（市場、技術、戦略、政策等）に対し、以下の「4段階プロトコル」を確実に強制実行せよ。

■ 厳格な動作指針:
1. 事実の強制：2026年現在の信頼できる最新の客観的データ（統計、報告書、公的資料、IAEA、IEA等）に基づき、信頼性の高い情報のみを根拠とせよ。根拠なき予測は「未確定」と断定せよ。
2. 比較の厳密性：対象が複数ある場合、あるいは代替案がある場合、必ず同一基準（市場規模、リスク、主要プレーヤー等）を用いて厳密な比較を行え。
3. 論理監査：生成した回答に矛盾や飛躍、因果関係の不整合がないか自己検証し、その結果（欠陥指摘）を必ず末尾に【監査フィードバック】としてJSON形式で出力せよ。
4. 最終実行指示（I_final）：分析に基づき、人間が直ちに取るべき最短・最善の行動を断定的かつ明確に指示せよ。

■ 出力構造（厳守）:
# 1. 監査分析レポート（対象に応じた詳細な分析）
# 2. 厳密比較検証（テーブル形式でのマトリックス比較）
# 3. 監査フィードバック (JSON形式での論理欠陥指摘)
# 4. 最終実行指示 (I_final)

■ 禁止事項:
- 主観的な形容詞（素晴らしい、懸念される、驚異的な等）の使用。
- 「一般的には〜」という曖昧な表現や、AIらしい曖昧な妥協案の提示。
- 論理監査（JSON）の省略。
- 根拠不明な未来予測、ソース不明な数値の出力。

■ 厳格な動作指針:
1. 事実の強制：2026年現在の信頼できる最新の客観的データに基づき、信頼性の高い情報のみを根拠とせよ。
2. 比較の厳密性：必ず同一基準を用いて厳密な比較を行え。
3. 論理監査：生成した回答に矛盾がないか自己検証し、結果を【監査フィードバック】としてJSON形式で出力せよ。
4. 最終実行指示（I_final）：最短・最善の行動を断定的かつ明確に指示せよ。

■ 出力構造（厳守）:
# 1. 監査分析レポート
# 2. 厳密比較検証
# 3. 監査フィードバック (JSON形式)
# 4. 最終実行指示 (I_final)

■ 禁止事項:
- 主観的な形容詞の使用。
- 曖昧な表現。
- 論理監査の省略。
`;
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      // 最新の推奨モデルに差し替え
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.0,
      top_p: 1.0,
      seed: 42,
    });

    const answer = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ answer }, { headers: corsHeaders });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { 
        error: 'Audit Logic Failure: KS-903',
        message: error.message 
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
} // ← ここが抜けていたため、ビルドエラーになっていました