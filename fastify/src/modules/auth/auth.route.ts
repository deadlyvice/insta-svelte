import { FastifyInstance } from 'fastify'
import { db } from '../../config/db'
import { AuthRepository } from './auth.repository'
import { IPostLogin, postLoginSchema, postRegisterSchema } from './auth.schema'
import { cleanCookie, setJWTCookie, signInJWT } from './auth.utils'
// import { extractBody } from '../../utils'
// import { saveFile } from '../files/files.route'
// add login and register route.
// use JWT token. set this token into cookie header.

export async function authRouters(app: FastifyInstance) {
	const auth = new AuthRepository(db)

	app.post<IPostLogin>('/login', postLoginSchema, async (req, res) => {
		const { email, password } = req.body
		const user = await auth.login(email, password)
		const token = signInJWT(app, user)

		setJWTCookie(token, res)
		return user
	})

	app.post('/register', postRegisterSchema, async (req, res) => {
		const newUser = await auth.register(req.body as Omit<IUser, 'id'>)
		const token = signInJWT(app, newUser)
		setJWTCookie(token, res)
		return newUser
	})

	app.post<IPostLogin>('/logout', { schema: { body: null } }, async (req, res) => {
		cleanCookie(res)
	})
}
