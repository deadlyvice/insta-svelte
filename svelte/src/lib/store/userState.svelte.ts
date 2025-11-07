// src/stores/auth.ts
import { api } from '$lib/api/profile'
import { writable } from 'svelte/store'

function createAuth() {
	const { subscribe, set, update } = writable<IUser | undefined>()

	return {
		subscribe,
		async login(login: ILoginPayload) {
			const user = await api.login(login)
			if (!user.id) {
				console.log('');
				
			}
			set(user)

			return user
		},

		async logout() {
			set(undefined)
			// api.logout()
		},

		async updateUser(user: Partial<IUser>) {},
		// getProfile() {
		// 	return api.getProfile()
		// },
	}
}

export const profile = createAuth()
