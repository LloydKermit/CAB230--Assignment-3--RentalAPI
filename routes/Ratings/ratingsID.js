import express from 'express';
import authorisation from '../../middleware/authorisation.js';
const router = express.Router();

router.get("/ratings/rentals/:id", authorisation, async (req, res) => {

    // Get parameters
    const queryCheck = Object.keys(req.query);

    // Check if parameters exist
    if (queryCheck.length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${queryCheck.join(", ")}. Query parameters are not permitted.`
        });
    };

    // Get id
    const id = req.params.id;

    // Shorcut database access
    const query = req.db.from("ratings");

    try {

        // Get all results
        const data = await query
            .where("ratings.propertyId", id)
            .where("userId", req.user.userId)
            .select("ratings.rating",
                "ratings.comment",
                "ratings.dateTime")
            .first();

        if (!data) {
            return res.status(404).json({
                error: true,
                message: "No rating exists with this rental ID."
            });
        }

        // If no comment, remove from object
        const cleanedData = data.map(rating => {
            if (rating.comment === null) {
                delete rating.comment;
            }

            return rating;
        });

        res.json(cleanedData);
    }
    catch (err) {
        console.log(err)

        res.status(500).json({
            error: true,
            message: "SQL error"
        });
    }
});

export default router;