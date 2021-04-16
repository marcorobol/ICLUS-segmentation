const app = require('./app/app.js');
require('dotenv').config();


/**
 * https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment#4-listen-on-the-correct-port
 */
const port = process.env.PORT || 8080;


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
    