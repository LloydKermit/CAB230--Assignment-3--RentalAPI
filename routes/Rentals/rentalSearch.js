import express from 'express';
const router = express.Router();

router.get("/rentals/search", async (req, res) => {

    // Begin query
    const query = req.db.from("data");

    const {
        suburb,
        state,
        postcode,
        minimumRent,
        maximumRent,
        minimumBathrooms,
        maximumBathrooms,
        minimumBedrooms,
        maximumBedrooms,
        minimumParking,
        maximumParking,
        propertyTypes,
        minimumRating,
        maximumRating,
        sortBy,
        sortOrder,
        page
    } = req.query;

    const validSortParams = [
        "id",
        "title",
        "rent",
        "propertyType",
        "latitude",
        "longitude",
        "postcode",
        "state",
        "suburb",
        "bathrooms",
        "bedrooms",
        "parkingSpaces",
        "averageRating",
        "numRatings"
    ];

    try {

        // Suburb Queries
        if (suburb) query.where("suburb", suburb);

        // State Queries
        if (state) query.where("state", state);

        // Postcode Queries
        if (postcode) {

            const postcodeNum = Number(postcode);

            if (postcodeNum < 0 || postcodeNum > 9999 || !Number.isInteger(postcodeNum)) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid postcode parameter. Must be an integer in the range of 0000-9999."
                })
            }
            query.where("postcode", postcode);
        }

        // Property Type Queries
        if (propertyTypes) query.whereIn("propertyType", Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes]);

        // Rent Queries
        if (minimumRent) {

            const minRentNum = Number(minimumRent);

            if (!Number.isInteger(minRentNum) || minRentNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid minimumRent parameter. Must be a non-negative integer."
                })
            }

            query.where("rent", ">=", minimumRent);
        }

        if (maximumRent) {

            const maxRentNum = Number(maximumRent);

            if (!Number.isInteger(maxRentNum) || maxRentNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid maximumRent parameter. Must be a non-negative integer."
                })
            }

            query.where("rent", "<=", maximumRent);
        }

        // Bathroom Queries
        if (minimumBathrooms) {

            const minBathNum = Number(minimumBathrooms);

            if (!Number.isInteger(minBathNum) || minBathNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid minimumBathrooms parameter. Must be a non-negative integer."
                })
            }

            query.where("bathrooms", ">=", minimumBathrooms);
        }

        if (maximumBathrooms) {

            const maxBathNum = Number(maximumBathrooms);

            if (!Number.isInteger(maxBathNum) || maxBathNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid maximumBathrooms parameter. Must be a non-negative integer."
                })
            }

            query.where("bathrooms", "<=", maximumBathrooms);
        }

        // Bedroom Queries 
        if (minimumBedrooms) {

            const minBedNum = Number(minimumBedrooms);

            if (!Number.isInteger(minBedNum) || minBedNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid minimumBedrooms parameter. Must be a non-negative integer."
                })
            }

            query.where("bedrooms", ">=", minimumBedrooms);
        }

        if (maximumBedrooms) {

            const maxBedNum = Number(maximumBedrooms);

            if (!Number.isInteger(maxBedNum) || maxBedNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid maximumBedrooms parameter. Must be a non-negative integer."
                })
            }

            query.where("bedrooms", "<=", maximumBedrooms);
        }

        // Parking Queries
        if (minimumParking) {

            const minParkingNum = Number(minimumParking);

            if (!Number.isInteger(minParkingNum) || minParkingNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid minimumParking parameter. Must be a non-negative integer."
                })
            }

            query.where("parkingSpaces", ">=", minimumParking);
        }
        if (maximumParking) {

            const maxParkingNum = Number(maximumParking);

            if (!Number.isInteger(maxParkingNum) || maxParkingNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid maximumParking parameter. Must be a non-negative integer."
                })
            }

            query.where("parkingSpaces", "<=", maximumParking);
        }

        // Rating Queries
        let minRatingNum;
        let maxRatingNum;

        if (minimumRating) {

            const minRatingNum = Number(minimumRating);

            if (!Number.isInteger(minRatingNum) || minRatingNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid minimumRating parameter. Must be a non-negative integer."
                })
            }
        }
        if (maximumRating) {

            const maxRatingNum = Number(maximumRating);

            if (!Number.isInteger(maxRatingNum) || maxRatingNum < 0) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid maximumRating parameter. Must be a non-negative integer."
                })
            }
        }

        if (sortBy) {
            if (!validSortParams.includes(sortBy)) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid sortBy parameter. Must refer to a valid sortable property."
                })
            }

            if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
                return res.status(400).json({
                    error: true,
                    message: "Invalid sortOrder parameter. Must be 'asc' or 'desc'."
                })
            }
            query.orderBy(sortBy, sortOrder === "desc" ? "desc" : "asc");
        }

        if (sortOrder) {
            if (!sortBy) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid sortOrder parameter. sortBy must be specified."
                })
            }
        }

        // Limit results to 10 per page
        const limit = 10
        const currentPage = page ? Number(page) : 1;

        if (page) {

            if (!Number.isInteger(currentPage) || currentPage < 1) {
                return res.status(400).json({
                    error: true,
                    message: "Invalid page parameter. Must be an integer greater than or equal to 1."
                });
            }
        }

        // Get offset after verifying currentPage
        const offset = (currentPage - 1) * limit;

        // Get all results
        // Apply Limit and Offset to get Pages
        const data = await query
            .clone()
            .leftJoin("ratings", "data.id", "ratings.propertyId")
            .groupBy("data.id")

            // Get Average Ratings
            .having(function () {
                if (minimumRating !== undefined) {
                    this.whereRaw("AVG(ratings.rating) >= ?", [minimumRating]);
                }
                if (maximumRating !== undefined) {
                    this.whereRaw("AVG(ratings.rating) <= ?", [maximumRating]);
                }
            })

            .select("data.*",
                req.db.raw("AVG(ratings.rating) as averageRating"),
                req.db.raw("COUNT(ratings.rating) as numRatings"))
            .limit(limit)
            .offset(offset);

        // Get Total Results
        const totalRes = await query
            .clone()
            .count("* as count");

        const total = totalRes[0].count;

        const lastPage = Math.ceil(total / limit);

        res.json({
            data: data.map(item => {
                const { description, locality, streetAddress, agencyName, amenities, ...rest } = item;

                return {
                    ...rest,

                    // Return as Integer
                    latitude: Number(item.latitude),
                    longitude: Number(item.longitude),
                    averageRating: item.averageRating != null ? Number(item.averageRating) : null,
                    numRatings: Number(item.numRatings)

                };
            }),

            pagination: {
                perPage: limit,
                currentPage,
                from: offset,
                to: Math.min(currentPage * limit, total),
                total,
                lastPage,
                prevPage: currentPage > 1 ? currentPage - 1 : null,
                nextPage: currentPage < lastPage ? currentPage + 1 : null
            }
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