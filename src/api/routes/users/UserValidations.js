

class UserValidation {
    async validateLocationData(req, res, next) {
        const { name, lat, lon } = req.body;
        if (!name || !lat || !lon) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        next();
    }
    async validateLocationId(req, res, next) {
        const locationId = req.params.location_id;
        if (!locationId) {
            return res.status(400).json({ error: 'Location ID is missing' });
        }
        next();
    }

}

module.exports = new UserValidation();
