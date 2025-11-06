export async function load({ cookies, parent }) {
	console.log(cookies)
	cookies.set('token', '123', { path: '/' })
	cookies.set('token', '123', { path: '/abc' })
	return {
		value: 11,
	}
}
