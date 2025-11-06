// src/stores/auth.ts
import { api } from '$lib/api/profile'
import { writable } from 'svelte/store'

function createAuth() {
	const { subscribe, set, update } = writable<IUser | undefined>()

	return {
		subscribe,
		login(user: IUser, token?: string) {
			// api.login(user)
			set(user)
		},
		logout() {
			set(undefined)
		},
		updateUser(user: Partial<IUser>) {},
		// getProfile() {
		// 	return api.getProfile()
		// },
	}
}

export const profile = createAuth()
