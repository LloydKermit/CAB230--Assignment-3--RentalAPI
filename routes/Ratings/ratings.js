import express from 'express';
const router = express.Router();

import authorisation from '../../middleware/authorisation.js';

router.get("/ratings", authorisation, async (req, res) => {

    // Shortcut ratings database access
    const query = req.db.from("ratings");

    // Get Page query from link
    const { page } = req.query;

    // Limit of results per page = 20
    const limit = 20;
    const currentPage = page ? Number(page) : 1;

    // If Page parameter exists
    // If given integer below 1, throw error 400
    if (page) {
        if (!Number.isInteger(currentPage) || currentPage < 1) {
            return res.status(400).json({
                error: true,
                message: "Invalid page parameter. Must be an integer greater than or equal to 1."
            });
        }
    }

    const offset = (currentPage - 1) * limit;

    try {
        const data = await query
            .clone()
            .where("userId", req.user.userId)
            .select("ratings.propertyId",
                "ratings.rating",
                "ratings.comment",
                "ratings.dateTime")
            .limit(limit)
            .offset(offset);

        const totalRes = await query
            .clone()
            .where("userId", req.user.userId)
            .count("* as count");

        const total = totalRes[0].count;
        const lastPage = Math.ceil(total / limit);

        // If no comment, remove from object
        const cleanedData = data.map(rating => {
            if (rating.comment === null) {
                delete rating.comment;
            }

            return rating;
        });

        res.json({
            data: cleanedData,
            pagination: {
                total,
                lastPage,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
                nextPage: currentPage < lastPage ? currentPage + 1 : null,
                perPage: limit,
                currentPage,
                from: offset,
                to: Math.min(currentPage * limit, total)

            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: true,
            message: "SQL error"
        });
    }
});

export default router;