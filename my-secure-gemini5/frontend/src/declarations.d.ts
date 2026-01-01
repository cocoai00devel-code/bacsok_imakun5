// 🛡️ react-dom/client の型が見つからない問題を物理的に解決
declare module 'react-dom/client' {
    import { createRoot } from 'react-dom';
    export { createRoot };
}