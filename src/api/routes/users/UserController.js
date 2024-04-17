const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const axios = require("axios")
require('dotenv').config();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });




class UserController {

    async getAllLocations(req, res, next) {
        const filePath = path.join(__dirname, '..', '..', '..', '..', 'locations.json');

        // Here we can use any database(MongoDB) but as i didn't have any instruction to use so I'm using local json file for the same.

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
    }
    async addNewLocation(req, res, next) {
        const uniqueID = uuidv4();
        const filePath = path.join(__dirname, '..', '..', '..', '..', 'locations.json');
        const { name, lon, lat } = req.body

        // Here we can use any database(MongoDB) but as i didn't have any instruction to use so I'm using local json file for the same.

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            try {
                const locations = JSON.parse(data);
                const newLocation = {
                    id: uniqueID,
                    name: name,
                    lon: lon,
                    lat: lat
                };
                locations.push(newLocation);
                const updatedData = JSON.stringify(locations, null, 2);

                fs.writeFile(filePath, updatedData, 'utf8', (err) => {
                    if (err) {
                        console.error("Error writing file:", err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    console.log("Location data added successfully.");
                    res.json({ message: 'Location data added successfully' });
                });


            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })

    }
    async getLocationByID(req, res, next) {
        const locationId = req.params.location_id;
        const filePath = path.join(__dirname, '..', '..', '..', '..', 'locations.json');
        // Here we can use any database(MongoDB) but as i didn't have any instruction to use so I'm using local json file for the same.

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Parse the JSON data into a JavaScript object
            const locations = JSON.parse(data);

            // Find the location by ID
            const location = locations.find(loc => loc.id === locationId);
            if (!location) {
                return res.status(404).json({ error: 'Location not found' });
            }

            res.json(location);
        });
    }
    async updateLocationByID(req, res, next) {
        const locationId = req.params.location_id;
        const updatedLocation = req.body;
        const filePath = path.join(__dirname, '..', '..', '..', '..', 'locations.json');


        // Read the existing JSON file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Parse the JSON data into a JavaScript object
            let locations = JSON.parse(data);

            // Find the location index by ID
            const locationIndex = locations.findIndex(loc => loc.id === locationId);
            if (locationIndex === -1) {
                return res.status(404).json({ error: 'Location not found' });
            }

            // Update the location
            locations[locationIndex] = { ...locations[locationIndex], ...updatedLocation };

            // Convert the modified JavaScript object back to JSON
            const updatedData = JSON.stringify(locations, null, 2);

            // Write the updated JSON back to the file
            fs.writeFile(filePath, updatedData, 'utf8', (err) => {
                if (err) {
                    console.error("Error writing file:", err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                console.log("Location updated successfully.");
                res.json({ message: 'Location updated successfully' });
            });
        });
    }
    async deleteLocationByID(req, res, next) {
        const filePath = path.join(__dirname, '..', '..', '..', '..', 'locations.json');

        const locationId = req.params.location_id;

        // Read the existing JSON file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Parse the JSON data into a JavaScript object
            let locations = JSON.parse(data);

            // Find the location index by ID
            const locationIndex = locations.findIndex(loc => loc.id === locationId);
            if (locationIndex === -1) {
                return res.status(404).json({ error: 'Location not found' });
            }

            // Remove the location from the array
            locations.splice(locationIndex, 1);

            // Convert the modified JavaScript object back to JSON
            const updatedData = JSON.stringify(locations, null, 2);

            // Write the updated JSON back to the file
            fs.writeFile('locations.json', updatedData, 'utf8', (err) => {
                if (err) {
                    console.error("Error writing file:", err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                console.log("Location deleted successfully.");
                res.json({ message: 'Location deleted successfully' });
            });
        });
    }
    async weatherForecastByID(req, res, next) {
        try {
            const weatherApiKey = process.env.apiKey;
            const locationID = req.params.location_id

            const cachedData = cache.get(locationID);
            if (cachedData) {
                console.log("Weather data found in cache");
                return res.json(cachedData);
            }
            const url = `https://api.openweathermap.org/data/2.5/weather?id=${locationID}&appid=${weatherApiKey}`;
            const response = await axios.get(url)
            const data = response.data
            cache.set(locationID, data);
            res.json(data);
        }
        catch (error) {
            console.error("Error fetching weather data:", error);
            return res.status(500).json({ error: 'Error fetching weather data' });
        }
    }
    async weatherHistory(req, res, next) {
        const weatherApiKey = process.env.apiKey;
        try {
            //as per the assignment I didn't get clearity where i need to pass 7 days(in hours) static or dynamic so I use only url without using days parameter
            const url = `https://history.openweathermap.org/data/2.5/history/city?lat=41.85&lon=-87.65&appid=${weatherApiKey}`;
            const response = await axios.get(url)
            const data = response.data
            res.json(data);
        } catch (error) {
            console.error("Error fetching weather history:", error);
            return res.status(500).json({ error: 'Error fetching weather history' });
        }

    }
}

module.exports = new UserController();
