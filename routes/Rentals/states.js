import express from 'express';
const router = express.Router();

router.get("/rentals/states", (req, res) => {

    // Get queries if included
    const queryCheck = Object.keys(req.query);

    if (queryCheck.length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${queryCheck.join(", ")}. Query parameters are not permitted.`
        });
    };

    res.json([
        "ACT",
        "NSW",
        "NT",
        "Qld",
        "SA",
        "Tas",
        "Vic",
        "WA"
    ]);
});

export default router;