import { Client } from 'pg'
import { AppError } from '../../plugins/errors'
import { sqlReadPosts } from '../select'

export class PostRepository {
	constructor(private db: Client) {}

	async getPostsIdsByUserId(userId: number) {
		const query = 'SELECT p.id, p.author_id from posts p where p.author_id = $1'
		return (await this.db.query<Pick<IPost, 'id' | 'author_id'>>(query, [userId])).rows
	}

	async readById(postId: number, withUserId?: number) {
		const withUserIdQuery = `(select reaction from reactions r where r.user_id = $2 and r.post_id = $1  ),`
		const query = `
		select ${withUserId ? withUserIdQuery : ''}
		p.*, u.nickname, u.img_url
		from posts p
		join users u ON u.id = p.author_id
		where p.id = $1
		`
		const params = !withUserId ? [postId] : [postId, withUserId]
		const posts = await this.db.query<IPost>(query, params)
		return posts.rows
	}

	async readByAuthorNickname(nickname: string, withUserId?: number) {
		const sql = sqlReadPosts({ viewerId: withUserId, nickname })
		const posts = await this.db.query<IPost>(sql.query, sql.props)
		return posts.rows
	}

	async readAll(withUserId?: number) {
		const { props, query } = sqlReadPosts({ viewerId: withUserId })
		const posts = await this.db.query<IPost>(query, props)
		return posts.rows
	}

	async create(post: Pick<IPost, 'title' | 'content' | 'img_urls' | 'author_id'>) {
		const { title, content, img_urls, author_id } = post
		const result = await this.db.query<IPost>(
			'INSERT INTO posts(title,content,author_id,img_urls) values ($1,$2,$3,$4) RETURNING *;',
			[title, content, author_id, JSON.stringify(img_urls)]
		)

		if (result.rowCount) return result.rows[0]
		throw new AppError(400, 'error: failed to create post')
	}

	async update(id: number, post: Partial<IPost>) {
		post.img_urls = JSON.stringify(post.img_urls) as any
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

	async delete(id: number, author: number) {
		const result = await this.db.query<IPost>(
			`DELETE FROM posts where id = $1 AND author_id = $2
             RETURNING *;
            `,
			[id, author]
		)
		if (result.rowCount) return result.rows[0]
		throw new AppError(404, 'ERROR: post not found')
	}
}
