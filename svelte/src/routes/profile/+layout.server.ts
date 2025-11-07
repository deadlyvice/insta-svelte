// /profile/+layout.server.ts

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async (req) => {
	// TODO MAKE PROTECT LAYOUT
	const token = req.cookies.get('token', {})
	console.log({ token }) // undefined
	// return {
	// 	// posts: await db.getPostSummaries(),
	// }
}
