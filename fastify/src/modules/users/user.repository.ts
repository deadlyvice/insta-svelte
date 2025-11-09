import { Client } from 'pg'
import { AppError } from '../../plugins/errors'

export class UserRepository {
	constructor(private db: Client) {}

	async readById(id: number) {
		const query = 'SELECT id, name, nickname, email, img_url FROM users WHERE users.id = $1'
		const users = await this.db.query<IUser>(query, [id])
		return users.rows
	}

	async readAll() {
		const users = await this.db.query<IUser>(
			'SELECT id, name, nickname, img_url email FROM users'
		)
		return users.rows
	}
	async readUserPostsById(userId: number, withSubId?: number) {
		const query = `
				select (select reaction from reactions r where r.user_id = $2 and r.post_id = p.id ),
				p.id, p.content, p.like_count , p.dislike_count, p.title, p.img_urls, p.created_at, p.updated_at, p.author_id, u.nickname
				from posts p
				join users u ON u.id = p.author_id
				where u.id = $1
		`
		const result = await this.db.query<IPost>(query, [userId, withSubId])

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
