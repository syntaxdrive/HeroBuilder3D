/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_BACKEND_API_URL: string;
  readonly VITE_STRIPE_PAYMENT_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
