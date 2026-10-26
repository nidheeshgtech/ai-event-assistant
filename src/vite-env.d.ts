/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_ENDPOINT?: string;
  readonly VITE_LEADS_ENDPOINT?: string;
  readonly VITE_ADMIN_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
