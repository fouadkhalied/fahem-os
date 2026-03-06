import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    response.status(200).json({
        body: 'Hello from Vercel Serverless Function!',
        query: request.query,
        cookies: request.cookies,
    });
}
