const express = require('express');
const app = express();



app.use(express.json());

app.use('/', require('./routes'));

const port = process.env.PORT || 4000;

app.listen(port, function () {
    console.info(`Server Started on port ${port}`);
});

