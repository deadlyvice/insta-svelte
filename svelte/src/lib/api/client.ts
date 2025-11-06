import ky from 'ky'

export const api = ky.create({
	prefixUrl: 'http://127.0.0.1:3000',
	credentials: 'include', // for cookies if using sessions/JWT in cookies
	headers: {
		'Content-Type': 'application/json',
	},
})
