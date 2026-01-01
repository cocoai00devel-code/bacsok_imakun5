export default {
  async fetch(request, env, ctx) {
    return new Response("Cloudflare × Node.js バックグラウンド成功です！");
  },
};