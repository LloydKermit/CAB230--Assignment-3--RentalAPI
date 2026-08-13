import express from 'express';
import authorisation from '../../middleware/authorisation.js';

const router = express.Router();

router.put("/user/:email/profile", authorisation, async (req, res) => {

    // Get Profile Email from link
    const requestedEmail = req.params.email;

    // Get User Email from link
    const userEmail = req.user.email;

    // Get Name, DoB and Address from Request Body
    const { firstName, lastName, dob, address } = req.body ?? {};

    // If any field is not found, return error 400
    if (!firstName || !lastName || !dob || !address) {
        return res.status(400).json({
            error: true,
            message: "Request body incomplete: firstName, lastName, dob and address are required."
        });
    }

    // If any field except DoB is not string, return error 400
    if (typeof firstName !== "string" || typeof lastName !== "string" || typeof address !== "string") {
        return res.status(400).json({
            error: true,
            message: "Request body invalid: firstName, lastName and address must be strings only."
        });
    }

    // Check DoB is a valid date
    // Create new date
    const dobDate = new Date(dob);

    // Get date for Today
    const today = new Date();

    // Get Valid Format for Date
    const validFormat = /^\d{4}-\d{2}-\d{2}$/;

    // 
    const [year, month, day] = dob.split("-").map(Number);

    // Check if JS has changed the date - Invalid Date Given
    if (
        dobDate.getFullYear() !== year ||
        dobDate.getMonth() + 1 !== month ||
        dobDate.getDate() !== day
    ) {
        return res.status(400).json({
            error: true,
            message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
        }); 
    }

    // Is DoB given in the correct format
    if (!validFormat.test(dob)) {
        return res.status(400).json({
            error: true,
            message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
        });
    }

    // Is DoB a valid Number
    if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
            error: true,
            message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
        });
    }

    // Is DoB in the future
    if (dobDate >= today) {
        return res.status(400).json({
            error: true,
            message: "Invalid input: dob must be a date in the past."
        });
    }

    // Is the user the same as the profile owner
    if (requestedEmail !== userEmail) {
        return res.status(403).json({
            error: true,
            message: "Forbidden"
        });
    }

    try {

        //  Update User Profile
        await req.db("users")
            .where("email", userEmail)
            .update({
                firstName: firstName,
                lastName: lastName,
                dob: dob,
                address: address
            });

        // Return User Profile
        return res.json({
            email: userEmail,
            firstName: firstName,
            lastName: lastName,
            dob: dob,
            address: address
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