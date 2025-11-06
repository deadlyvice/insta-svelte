import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from '../routes/auth/login/$types'

function decodeJWT(token: string | undefined): any | null {
	if (!token) return null
	try {
		const parts = token.split('.')
		if (parts.length !== 3) return null
		const payload = JSON.parse(atob(parts[1]))
		if (payload.exp < Date.now() / 1000) return null
		return payload
	} catch {
		return null
	}
}

export const load: PageServerLoad = ({ cookies }) => {
	const token = cookies.get('token')
	const user = decodeJWT(token)
	if (user) {
		throw redirect(307, '/profile')
	}
}
