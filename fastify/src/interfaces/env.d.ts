// src/types/env.d.ts
declare namespace NodeJS {
	interface ProcessEnv {
		PORT?: string
		NODE_ENV?: 'development' | 'production' | 'test'
		JWT_SECRET: string
		COOKIE_SECRET: string
		DB_USER: string
		DB_PASSWORD: string
		DB_HOST: string
		DB_PORT?: string
		DB_NAME: string
		DB_SSL?: 'true' | 'false'
		CORS_ORIGINS?: string
		DB_VERBOSE?: 'true' | 'false'
	}
}
