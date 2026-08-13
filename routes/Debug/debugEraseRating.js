import express from 'express';
const router = express.Router();

router.post("/ratings/debugEraseRatings", async (req, res) => {

    try {
        // Delete all Ratings
        await req.db("ratings").del();

        return res.status(200).json({
            message: "All ratings deleted"
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