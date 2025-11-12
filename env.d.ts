declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URL: string;
    JWT_SECRET: string;
    PORT?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    DEBUG?: string;
  }
}
