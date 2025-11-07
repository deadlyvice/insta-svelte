interface ILoginPayload {
	email: string
	password: string
}

interface IRegisterPayload {
	name: string
	email: string
	nickname: string
	password: string
}

interface IUser {
	id: number
	name: string
	email: string
	nickname: string
	token?: string | null
	password?: string | null
	img_url?: string | null
}

interface IPost {
	id: number
	title: string
	content: string
	author_id: number
	like_count: number
	dislike_count: number
	img_urls: string[]
}

type ApiResponse<T> =
	| Promise<{ error: string; ok: false }>
	| Promise<{ data: T; ok: true }>
