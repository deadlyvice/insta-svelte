import { FastifySchema } from 'fastify'

const idParam = {
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'number' },
	},
}

export const getPostByIdSchema: FastifySchema = {
	params: idParam,
}

export const createPostSchema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		// bodyLimit: 52428800, // 50 MB for this specific route

		required: ['title', 'content'],
		properties: {
			title: { type: 'string', minLength: 1 },
			content: { type: 'string', minLength: 1 },
			img_urls: { type: 'array', maxItems: 9, items: { type: 'string' } },
		},
	},
}

export const updatePostSchema: FastifySchema = {
	params: idParam,
	
	body: {
		// bodyLimit: 52428800, // 50 MB for this specific route
		type: 'object',
		minProperties: 1,
		additionalProperties: false,
		properties: {
			title: { type: 'string', minLength: 1 },
			content: { type: 'string', minLength: 1 },
			img_urls: { type: 'array', maxItems: 9, items: { type: 'string' } },
		},
	},
}

export const postReactionSchema: FastifySchema = {
	params: idParam,
	body: {
		type: 'object',
		required: ['reaction'],
		properties: {
			reaction: { type: ['boolean', 'null'] },
		},
	},
}

export const createCommentShema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: ['post_id', 'data'],
		properties: {
			data: { type: 'string', minLength: 1 },
			post_id: { type: 'number' },
		},
	},
}

export const updateCommentShema: FastifySchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: ['data'],
		properties: {
			data: { type: 'string', minLength: 1 },
		},
	},
}

export const getByQueryNickname = {
	querystring: {
		type: 'object',
		additionalProperties: false,
		properties: {
			nickname: { type: 'string' },
		},
	},
	//   required: ['minPrice'] // Example: minPrice is required
}
