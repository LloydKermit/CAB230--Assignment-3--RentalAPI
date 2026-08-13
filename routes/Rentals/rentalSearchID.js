import express from 'express';
const router = express.Router();

router.get(`/rentals/:id`, async (req, res) => {

    // Get queries if included
    const queryCheck = Object.keys(req.query);

    if (queryCheck.length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${queryCheck.join(", ")}. Query parameters are not permitted.`
        });
    };

    // Get id
    const id = req.params.id;

    const query = req.db.from("data");
    const ratingsQuery = req.db.from("ratings");

    try {
        // Get all results
        const data = await query
            .leftJoin("ratings", "data.id", "ratings.propertyId")
            .where("data.id", id)
            .groupBy("data.id")
            .select("data.*",
                req.db.raw("AVG(ratings.rating) as averageRating"),
                req.db.raw("COUNT(ratings.rating) as numRatings"))
            .first();

        if (!data) {
            return res.status(404).json({
                error: true,
                message: "No rental exists with this ID."
            });
        }

        // Second Query for all Reviews
        const reviews = await ratingsQuery
            .leftJoin("users", "ratings.userId", "users.id")
            .where("propertyId", id)
            .select("ratings.rating",
                "ratings.comment",
                "ratings.dateTime",
                "users.email"
            );


        // Take out ID
        const { id: rentalID, ...rentalData } = data;

        res.json({
            ...rentalData,

            // Return as Integer
            latitude: Number(rentalData.latitude),
            longitude: Number(rentalData.longitude),
            averageRating: rentalData.averageRating != null ? Number(rentalData.averageRating) : null,
            numRatings: Number(rentalData.numRatings),

            // Rating as Integer
            // Get User Email
            // If Comment is present, return it
            reviews: reviews.map(rating => ({
                rating: Number(rating.rating),
                user: rating.email,
                ...(rating.comment !== null && { comment: rating.comment }),
                dateTime: rating.dateTime
            }))
        });
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