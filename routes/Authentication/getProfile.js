import express from 'express';

import jwt from 'jsonwebtoken';
const router = express.Router();

router.get("/user/:email/profile", async (req, res) => {

    // Get Email from link
    const requestedEmail = req.params.email;

    let authorisedUser = null;

    // Check for Bearer header
    if ("authorization" in req.headers) {

        // Bearer not found
        if (!req.headers.authorization.match(/^Bearer /)) {
            res.status(401).json({ error: true, message: "Authorization header is malformed" });
            return;
        }

        // Remove Bearer
        const token = req.headers.authorization.replace(/^Bearer /, "");

        try {
            // Decode and Assign token
            authorisedUser = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            if (e.name === "TokenExpiredError") {
                res.status(401).json({ error: true, message: "JWT token has expired" });
            } else {
                res.status(401).json({ error: true, message: "Invalid JWT token" });
            }
            return;
        }

    }

    try {

        // Check for given user via email
        const user = await req.db("users")
            .where("email", requestedEmail)
            .first();

        // If no user found, return error 404
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User not found"
            })
        }

        // Check if user is owner of requested profile
        const isOwner = authorisedUser && authorisedUser.userId === user.id;

        // If owner, provide further information
        if (isOwner) {
            return res.json({
                email: requestedEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                dob: user.dob ? user.dob.toLocaleDateString("en-CA") : null,
                address: user.address
            })
        }

        // Return only Email and Name if not owner
        return res.json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            error: true,
            message: "SQL error"
        });
    }
});

export default router;