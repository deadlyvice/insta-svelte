// src/stores/auth.ts
import { goto } from '$app/navigation'
import { page } from '$app/state'
import { api } from '$lib/api/profile'
import { writable } from 'svelte/store'

function profileState() {
	const { subscribe, set, update } = writable<IUser | undefined>()

	return {
		subscribe,
		async register(data: IRegisterPayload) {
			const user = await api.register(data)
			if (!user.ok) return user
			set(user.data)
			await goto('/profile')
		},
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
			await api.logOut()
			goto('/auth/login')
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

export const profile = profileState()
