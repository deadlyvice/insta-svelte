import ky from 'ky'

export const client = ky.create({
	prefixUrl: 'http://127.0.0.1:3000',
	credentials: 'include', // for cookies if using sessions/JWT in cookies
	throwHttpErrors: false,
	headers: {
		'Content-Type': 'application/json',
	},
})

client.extend({
	hooks: {
		beforeRequest: [
			async (request) => {
				console.log(request.url, await request.json())
			},
		],

		afterResponse: [
			async (res) => {
				console.log('----------------------------------')

				console.log({ res })

				// const { response } = error
				// if (response) {
				// const body = await response.json()
				// error.name = 'GitHubError'
				// error.message = `${body.message} (${response.status})`
				// }

				// return res
			},
		],
	},
})
