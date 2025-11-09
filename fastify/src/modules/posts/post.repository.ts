import { Client } from 'pg'
import { AppError } from '../../plugins/errors'

export class PostRepository {
	constructor(private db: Client) {}

	async readById(postId: number, withUserId?: number) {
		const withUserIdQuery = `(select reaction from reactions r where r.user_id = $2 and r.post_id = $1  ),`
		const query = `
		select ${withUserId ? withUserIdQuery : ''}
		p.id, p.content, p.like_count , p.dislike_count, p.title, u.nickname, img_urls
		from posts p
		join users u ON u.id = p.author_id
		where p.id = $1
		`
		const params = !withUserId ? [postId] : [postId, withUserId]
		const posts = await this.db.query<IPost>(query, params)
		return posts.rows
	}

	async readAll(withUserId?: number) {
		let query = 'SELECT * FROM posts'
		const params: any[] = []

		if (withUserId) {
			query = `
				select (select reaction from reactions r where r.user_id = $1 and r.post_id = p.id ),
				p.id, p.content, p.like_count , p.dislike_count, p.title, p.img_urls, p.created_at, p.updated_at, p.author_id, u.nickname
				from posts p
				join users u ON u.id = p.author_id
		`
			params.push(withUserId)
		}

		const posts = await this.db.query<IPost>(query, params)
		return posts.rows
	}

	async create(post: IPost) {
		const { title, content, img_urls, author_id } = post
		const result = await this.db.query<IPost>(
			'INSERT INTO posts(title,content,author_id,img_urls) values ($1,$2,$3,$4) RETURNING *;',
			[title, content, author_id, JSON.stringify(img_urls)]
		)

		if (result.rowCount) return result.rows[0]
		throw new AppError(400, 'error: failed to create post')
	}

	async update(id: number, post: Partial<IPost>) {
		post.img_urls = JSON.stringify(post.img_urls)
		const keys = Object.keys(post)
		const values = Object.values(post)

		if (keys.length === 0) throw new AppError(400, 'No fields to update')

		// parameter placeholders: $2, $3, ...
		const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ')

		const query = `
            UPDATE posts 
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            RETURNING *;`

		const result = await this.db.query<IPost>(query, [id, ...values])

		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'ERROR: post not found or wrong req body')
	}

	async delete(id: number) {
		const result = await this.db.query<IPost>(
			`DELETE FROM posts where id = $1
             RETURNING *;
            `,
			[id]
		)
		if (result.rowCount) return result.rows
		throw new AppError(404, 'ERROR: post not found')
	}
}
