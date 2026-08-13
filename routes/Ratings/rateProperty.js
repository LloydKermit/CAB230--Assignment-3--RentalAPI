import express from 'express';
import authorisation from '../../middleware/authorisation.js';
const router = express.Router();

router.post("/ratings/rentals/:id", authorisation, async (req, res) => {

    // Get Rental ID from link
    const rentalId = req.params.id;

    // Shortcut database access
    const rentalsDB = req.db.from("data");

    // Get Rating and Comment from Request Body
    const { rating, comment } = req.body ?? {};

    // Get Rating as an integer
    const intRating = Number(rating);


    // Check if Rating is an Integer between 1 and 5
    if (!intRating || !Number.isInteger(intRating) || intRating < 1 || intRating > 5) {
        return res.status(400).json({
            "error": true,
            "message": "Invalid rating. Rating must be an integer value between 1 and 5."
        })
    }

    // If there is a commment, Check if it is a string of length 1 to 2000
    if (comment !== undefined && (typeof comment !== "string" || comment.length < 1 || comment.length > 2000)) {
        return res.status(400).json({
            error: true,
            message: "Invalid comment parameter. Comment must be a string 1-2000 characters long."
        });
    }

    try {

        // Get Rental
        const rental = await rentalsDB
            .where("data.id", rentalId)
            .first();

        // If Rental does not exist return error 404
        if (!rental) {
            return res.status(404).json({
                error: true,
                message: "No rental exists with this ID."
            });
        }

        // Check if user has already rated this Rental
        const existingRating = await req.db("ratings")
            .where({
                propertyId: rentalId,
                userId: req.user.userId
            })
            .first();

        // Update Rating if Rating found
        if (existingRating) {
            await req.db("ratings")
                .where({
                    propertyId: rentalId,
                    userId: req.user.userId
                })
                .update({
                    rating: intRating,
                    comment: comment,
                    dateTime: new Date()
                });

        } else {

            // Insert Rating if no Rating found
            await req.db("ratings").insert({
                propertyId: rentalId,
                rating: intRating,
                comment: comment,
                dateTime: new Date(),
                userId: req.user.userId
            });
        }

        // Return Rating
        return res.status(201).json({
            rating: intRating,
            ...(comment !== undefined && { comment }),
            dateTime: new Date()
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