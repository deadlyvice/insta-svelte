// src/stores/auth.ts
import { goto } from '$app/navigation'
import { api } from '$lib/api/profile'
import { writable } from 'svelte/store'

function createAuth() {
	const { subscribe, set, update } = writable<IUser | undefined>()

	return {
		subscribe,
		async login(login: ILoginPayload) {
			const user = await api.login(login)

			if (!user.ok) {
				set(undefined)
				return user
			}

			set(user.data)
			await goto('/profile')

			return user
		},

		async logout() {
			set(undefined)
			// api.logout()
		},

		async updateUser(user: Partial<IUser>) {},

		async getProfile() {
			const profile = await api.getProfile()
			if (profile.ok) {
				set(profile.data)
				return profile
			}
			set(undefined)
			await goto('/auth/login')
		},
	}
}

export const profile = createAuth()
