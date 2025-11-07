import { FastifyReply, FastifyRequest } from 'fastify'

export async function responseNormalizerPlugin(
	req: FastifyRequest,
	res: FastifyReply,
	payload: unknown
): Promise<unknown> {
	// Successful-ish responses
	if (res.statusCode >= 200 && res.statusCode < 500) {
		const isAlreadyFormatted =
			payload && typeof payload === 'object' && 'ok' in (payload as Record<string, unknown>)
		if (isAlreadyFormatted) return payload
		return { ok: true, data: payload }
	}

	return payload
}