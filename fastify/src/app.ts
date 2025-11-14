import 'dotenv/config'
import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'

import { responseNormalizerPlugin } from './plugins/response-normalizer'
import { errorNormalizer } from './plugins/error-normalizer'
// import { connectDB } from './config/db'

import { privateUsers, publicUsers } from './modules/users/user.routes'
import { privatePosts, publicPosts } from './modules/posts/post.routes'
import { authRouters } from './modules/auth/auth.route'
import { privateComments, publicComments } from './modules/posts/comments.routes'
import { privateProfile } from './modules/userProfile/profile.routes'
import { db } from './config/db'
import { ensureUploadDir } from './utils'
import { privateFiles } from './modules/files/files.route'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
const options: AppOptions = {
	logger: process.env.NODE_ENV !== 'production' ? true : false,
	bodyLimit: 10485760, //10mb
}



const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
	// plugins & routes autoload
	void fastify.register(AutoLoad, { dir: join(__dirname, 'plugins'), options: opts })
	void fastify.register(AutoLoad, { dir: join(__dirname, 'routes'), options: opts })

	//import multipart
	await fastify.register(import('@fastify/multipart'), { attachFieldsToBody: false })
	await ensureUploadDir()

	// COOKIE SECRET
	const cookieSecret = process.env.COOKIE_SECRET || 'fallback-cookie-secret'
	await fastify.register(fastifyCookie, { secret: cookieSecret })

	// JWT
	const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret'
	await fastify.register(jwt, { secret: jwtSecret })

	// CORS
	const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)

	await fastify.register(cors, {
		origin: corsOrigins,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})

	fastify.addHook('preSerialization', responseNormalizerPlugin)
	fastify.setErrorHandler(errorNormalizer)

	// routes
	await fastify.register(authRouters, { prefix: '/auth' })
	await fastify.register(publicUsers, { prefix: '/users' })
	await fastify.register(privateUsers, { prefix: '/users' })
	await fastify.register(publicPosts, { prefix: '/posts' })
	await fastify.register(privatePosts, { prefix: '/posts' })
	await fastify.register(publicComments, { prefix: '/comments' })
	await fastify.register(privateComments, { prefix: '/comments' })
	await fastify.register(privateProfile, { prefix: '/profile' })

	await fastify.register(privateFiles, { prefix: '/files' })

	// connect DB (await for reliable startup)
	// await connectDB()
	await db.connect()
}

export default app
export { app, options }
