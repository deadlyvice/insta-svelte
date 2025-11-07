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
}

type ApiResponse<T> =
	| Promise<{ error: string; ok: false }>
	| Promise<{ data: T; ok: true }>
