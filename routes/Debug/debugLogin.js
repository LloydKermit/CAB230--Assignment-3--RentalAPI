import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import express from 'express';
const router = express.Router();    

// Get Secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/user/debugLogin', async (req, res, next) => {

    // Retrieve email and password from req.body
    const { email, password } = req.body ?? {};

    // Verify body
    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: "Request body incomplete, both email and password are required"
        });
    }

    try {

        // Check if user exists
        const user = await req.db("users")
            .where("email", email)
            .first()

        // Return error 401 if user doesn't exist or incorrect information provided
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Incorrect email or password"
            });
        }

        // Check if password matches
        const match = await argon2.verify(user.hash, password)

        // If password does not match return error 401
        if (!match) {
            return res.status(401).json({
                error: true,
                message: "Incorrect email or password"
            })
        }

        // If login successful, provide token
        // Expire token in 24 hours
        const expiresIn = 1;
        const exp = Math.floor(Date.now() / 1000) + expiresIn;
        const token = jwt.sign({ exp, userId: user.id, email: user.email }, process.env.JWT_SECRET);
        
        res.json({
            token,
            tokenType: "Bearer",
            expiresIn
        });
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            error: true,
            message: "SQL error"
        });
    }

});

export default router;