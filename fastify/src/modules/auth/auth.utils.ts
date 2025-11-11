import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../../plugins/errors'
import { CookieSerializeOptions } from '@fastify/cookie'

export function signInJWT(app: FastifyInstance, user: IUser): string {
	return app.jwt.sign({ ...user }, { expiresIn: '1h' })
}

const secureCookie = {
	httpOnly: true,
	secure: true, //process.env.NODE_ENV === 'production',
	sameSite: 'none',
	path: '/',
	maxAge: 3600,//1h
} satisfies CookieSerializeOptions

export function setJWTCookie(token: string, reply: any) {
	reply.setCookie('token', token, secureCookie)
}

export function cleanCookie(reply: FastifyReply) {
	reply.clearCookie('token', secureCookie)
}

export async function protect(app: FastifyInstance) {
	app.addHook('preHandler', async (req, reply) => {
		console.log('Auth middleware triggered')
		try {
			// Get token from cookie or Authorization header
			const token =
				req.cookies.token ||
				(req.headers.authorization && req.headers.authorization.split(' ')[1])

			if (!token) {
				throw new AppError(401, 'Unauthorized: No token provided')
			}

			// Verify token
			const decoded = app.jwt.verify(token) as IUser

			// Attach user info to request (available in all routes after middleware)
			app.log.info(`--- user: ${decoded.id} ${decoded.name} ${decoded.email} ---`)
			req.user = decoded
		} catch (err) {
			throw new AppError(401, 'Unauthorized: Invalid or expired token')
		}

		return
	})
}

export function getJwtSafe(app: FastifyInstance, req: FastifyRequest) {
	try {
		return app.jwt.verify<IUser>(req.cookies?.token ?? '')
	} catch (error) {}
}
