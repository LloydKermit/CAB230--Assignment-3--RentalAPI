import express from 'express';
const router = express.Router();

import argon2 from 'argon2';

router.post("/user/register", async (req, res, next) => {

    // Get Email and Password from Request Body
    const { email, password } = req.body ?? {};

    // If Email or Password not provided return error 400
    if (!email || !password) {
        return res.status(400).json({
            "error": true,
            "message": "Request body incomplete, both email and password are required"
        })
    }

    try {

        // Check if User already exists
        const queryUsers = await req.db("users")
            .where("email", email)
            .first();

        // Return error 409 if user exists
        if (queryUsers) {
            return res.status(409).json({
                error: true,
                message: "User already exists"
            })
        }

        // Hash the password
        const hash = await argon2.hash(password);

        // Insert Email and password Hash
        await req.db("users").insert({
            email, hash
        });

        return res.status(201).json({
            message: "User created"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            error: true,
            message: "SQL error"
        });
    }


});

export default router;