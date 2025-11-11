import { writable } from 'svelte/store'

type Toast = {
	id: number
	type: 'success' | 'error' | 'info'
	message: string
	timeout?: number
}

export const toasts = writable<Toast[]>([])

let id = 0

function addToast(type: Toast['type'], message: string, timeout = 5000) {
	const toast: Toast = { id: ++id, type, message, timeout }
	toasts.update((t) => [...t, toast])

	setTimeout(() => {
		toasts.update((t) => t.filter((tt) => tt.id !== toast.id))
	}, timeout)
}

export const toast = {
	success: (msg: string) => addToast('success', msg),
	error: (msg: string) => addToast('error', msg),
	info: (msg: string) => addToast('info', msg)
}
