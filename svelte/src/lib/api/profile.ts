// src/lib/api/auth.ts
import { json } from '@sveltejs/kit'
import { client } from './client'

function login(data: ILoginPayload): ApiResponse<IUser> {
	return client
		.post('auth/login', { json: data })
		.json<IUser>()
		.catch((err) => err)
}

function register(data: IRegisterPayload): ApiResponse<IUser> {
	return client
		.post('auth/register', { json: data })
		.json<IUser>()
		.catch((err) => err)
}

function getProfile(): ApiResponse<IUser> {
	return client
		.get('profile')
		.json<IUser>()
		.catch((err) => err)
}

function logOut() {
	return client.post('auth/logout', { json: null }).catch((err) => err)
}

export const api = {
	login,
	register,
	getProfile,
	logOut,
}
