const express = require('express');
const router = express.Router();
const UserController = require('./UserController');
const UserValidation = require('./UserValidations')

router.get('/locations', UserController.getAllLocations)

router.post('/locations', UserValidation.validateLocationData, UserController.addNewLocation)

router.get('/locations/:location_id', UserValidation.validateLocationId, UserController.getLocationByID)

router.put('/locations/:location_id', UserValidation.validateLocationId, UserValidation.validateLocationData, UserController.updateLocationByID)

router.delete('/locations/:location_id', UserValidation.validateLocationId, UserController.deleteLocationByID)

router.get('/weather/:location_id', UserValidation.validateLocationId, UserController.weatherForecastByID)

router.get('/history', UserController.weatherHistory)






module.exports = router;
