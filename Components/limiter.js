import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	limit: 200, // Limit by 200
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
    message: "Too many requests, please try again later."
})

export default limiter;