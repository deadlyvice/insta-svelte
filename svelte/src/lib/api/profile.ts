// src/lib/api/auth.ts
import { client } from './client'

function login(data: ILoginPayload): Promise<IUser> {
	return client.post('auth/login', { json: data }).json<IUser>()
}

function register(data: IRegisterPayload): Promise<IUser> {
	return client.post('auth/register', { json: data }).json<IUser>()
}

function getProfile(): Promise<IUser> {
	return client.get('profile').json<IUser>()
}

export const api = {
	login,
	register,
	getProfile,
}
