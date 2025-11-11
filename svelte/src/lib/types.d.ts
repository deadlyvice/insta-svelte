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
	reaction?: boolean | null
	nickname?: string
	img_url?: string // author url

	// local var
	comments?: IComment[]
}
interface IComment {
	id: number
	data: string
	user_id: number
	post_id: number
	created_at: string | Date //'2025-11-07T15:35:20.661Z'
}

type ApiResponse<T> =
	| Promise<{ error: string; ok: false; status: number }>
	| Promise<{ data: T; ok: true; status: number }>
