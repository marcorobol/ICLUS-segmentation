const app = require('./app/app.js');
require('dotenv').config();



const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});



process.on('SIGINT', () => {
    console.log('SIGINT signal received.');
    process.exit(0);
});