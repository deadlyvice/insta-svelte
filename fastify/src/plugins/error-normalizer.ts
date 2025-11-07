import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { DatabaseError } from 'pg'
import { AppError } from './errors' // adjust to your actual path

export async function errorNormalizer(
	error: FastifyError | Error,
	req: FastifyRequest,
	reply: FastifyReply
) {
	// Log full error info (safe to remove in production)
	req.log.error(
		{
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: (error as any).code,
		},
		'Error occurred'
	)

	// --- 1. handle "AppError" ---
	if (error instanceof AppError) {
		return reply.status(error.status).send({
			ok: false,
			error: error.message,
		})
	}

	// --- 2. PostgreSQL (pg) Database Errors ---
	if (error instanceof DatabaseError) {
		const pgError = error as DatabaseError

		req.log.warn({ code: pgError.code, detail: pgError.detail }, 'PostgreSQL error handled')

		switch (pgError.code) {
			case '23505': // unique_violation
				return reply.status(409).send({
					ok: false,
					error: `A record with this value already exists. (${pgError.detail})`,
				})

			case '23503': // foreign_key_violation
				return reply.status(409).send({
					ok: false,
					error: `Operation failed due to a related record. (${pgError.detail})`,
				})

			case '23502': // not_null_violation
				return reply.status(400).send({
					ok: false,
					error: `A required field is missing. (${pgError.detail})`,
				})

			case '22P02': // invalid_text_representation
				return reply.status(400).send({
					ok: false,
					error: 'Invalid format for a parameter.',
				})

			case '22001': // invalid_text_representation
				return reply.status(400).send({
					ok: false,
					error: 'Invalid value: too mach symbols',
				})
		}
	}

	// --- 3. Fastify validation errors (built-in) ---
	if ((error as FastifyError).validation) {
		return reply.status(400).send({
			ok: false,
			error: (error as FastifyError).message,
		})
	}

	// --- 4. Default fallback ---
	return reply.status(500).send({
		ok: false,
		error: 'Internal Server Error',
	})
}
