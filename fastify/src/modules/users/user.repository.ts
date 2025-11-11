import { Client } from 'pg'
import { AppError } from '../../plugins/errors'
import { sqlReadPosts } from '../select'

export class UserRepository {
	constructor(private db: Client) {}

	async readById(id: number) {
		const query = 'SELECT id, name, nickname, email, img_url FROM users WHERE users.id = $1'
		const users = await this.db.query<IUser>(query, [id])
		return users.rows
	}

	async readAll() {
		const users = await this.db.query<IUser>(
			'SELECT id, name, nickname, img_url, email FROM users'
		)
		return users.rows
	}
	async readPostsByUserId(userId: number, withSubId?: number) {
		const { props, query } = sqlReadPosts({ userId: userId, viewerId: withSubId })
		const result = await this.db.query<IPost>(query, props)
		return result.rows
	}

	async update(id: number, user: Partial<IPost>) {
		const keys = Object.keys(user)
		const values = Object.values(user)

		if (keys.length === 0) throw new AppError(400, 'No fields to update')

		// parameter placeholders: $2, $3, ...
		const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ')

		const query = `
			UPDATE users SET ${setClause} WHERE id = $1
			RETURNING *;`

		const result = await this.db.query<IPost>(query, [id, ...values])

		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'ERROR: user not found or wrong req body')
	}

	async delete(id: number) {
		const result = await this.db.query<IPost>(
			`DELETE FROM users where id = $1
			 RETURNING *;
			`,
			[id]
		)
		if (result.rowCount) return result.rows
		throw new AppError(404, 'ERROR: user not found')
	}
}
