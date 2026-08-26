/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_DEMO_LOGIN?: string;
  readonly VITE_ENABLE_MOCK_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
