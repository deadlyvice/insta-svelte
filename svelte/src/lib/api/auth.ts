// src/lib/api/auth.ts
import { api } from './client'

export async function login(data: LoginPayload): Promise<User> {
	console.log({ data })

	return api.post('auth/login', { json: data }).json<User>()
}

export async function register(data: RegisterPayload): Promise<User> {
	return api.post('auth/register', { json: data }).json<User>()
}

export async function getProfile(): Promise<User> {
	return api.get('profile').json<User>()
}
