interface IRawReadPostsSelect {
	viewerId?: number // jwt subject

	userId?: number
	nickname?: string
}

export function sqlReadPosts({ userId, viewerId, nickname }: IRawReadPostsSelect) {
	console.log({ userId, viewerId, nickname })
	const props: any[] = []

	if (nickname) props[0] = `%${nickname}%`
	else if (userId) props[0] = userId
	if (viewerId) props.push(viewerId)

	const query: string = `
            SELECT p.*, 
            
            ${viewerId ? `COALESCE(r.reaction, NULL) AS reaction,` : ``} 
            
            u.nickname, u.email, u.name, u.img_url
            FROM posts p
            JOIN users u ON u.id = p.author_id
            ${
				viewerId
					? `LEFT JOIN reactions r ON r.post_id = p.id AND r.user_id = $${props.length}`
					: ``
			}

            ${userId ? `WHERE p.author_id = $1` : ``}
            ${nickname ? `WHERE u.nickname ilike $1` : ``}
            ORDER BY p.created_at DESC --p.like_count DESC
            LIMIT 100
            ;
    `

	console.log(query, props)
	return { query, props }
}

// select (select reaction from reactions r where r.user_id = 49 and r.post_id = p.id  ),
// p.*, u.nickname, u.img_url
// from posts p
// join users u ON u.id = p.author_id
// where u.nickname ilike '%49%'
