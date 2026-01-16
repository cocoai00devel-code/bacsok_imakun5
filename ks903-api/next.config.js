/** @type {import('next').NextConfig} */
const nextConfig = {
  // 外部からのAPI呼び出しを許可するCORS設定
  async headers() {
    return [
      {
        // 全てのAPIルートに対して設定を適用
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // 本番では特定のドメイン（https://...）に絞るのが安全
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

export default nextConfig;