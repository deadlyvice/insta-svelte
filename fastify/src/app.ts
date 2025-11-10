import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { privateUsers, publicUsers } from './modules/users/user.routes'
import { connectDB } from './config/db'
// import { responseNormalizerPlugin } from './plugins/response-normalizer'
import { privatePosts, publicPosts } from './modules/posts/post.routes'
import fastifyCookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { authRouters } from './modules/auth/auth.route'
import { privateComments, publicComments } from './modules/posts/comments.routes'
import { privateProfile } from './modules/profile/user.routes'
import cors from '@fastify/cors'
import { responseNormalizerPlugin } from './plugins/response-normalizer'
import { errorNormalizer } from './plugins/error-normalizer'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
	logger: false,
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
	// eslint-disable-next-line no-void
	void fastify.register(AutoLoad, { dir: join(__dirname, 'plugins'), options: opts })

	// eslint-disable-next-line no-void
	void fastify.register(AutoLoad, { dir: join(__dirname, 'routes'), options: opts })

	// Register cookie plugin (MUST come before routes)
	await fastify.register(fastifyCookie, { secret: process.env.COOKIE_SECRET || 'super-secret' })

	// Register JWT plugin
	await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'super-secret-jwt' })

	await fastify.register(cors, {
		origin: ['http://localhost:5173'],
		credentials: true, // allow cookies or Authorization headers
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})

	fastify.addHook('preSerialization', responseNormalizerPlugin)
	fastify.setErrorHandler(errorNormalizer)

	// ------- auth -------------
	await fastify.register(authRouters, { prefix: '/auth' })
	// ------- users -------------
	await fastify.register(publicUsers, { prefix: '/users' })
	await fastify.register(privateUsers, { prefix: '/users' })
	// ------- posts -------------
	await fastify.register(publicPosts, { prefix: '/posts' })
	await fastify.register(privatePosts, { prefix: '/posts' })

	// ------- comments -------------
	await fastify.register(publicComments, { prefix: '/comments' })
	await fastify.register(privateComments, { prefix: '/comments' })
	// ------- profile -------------
	await fastify.register(privateProfile, { prefix: '/profile' })

	// await fastify.register()

	connectDB()
}
export default app
export { app, options }
