# Iclus 2021 ULTRa Lab data-set platform

To start locally, simply run `node index.js`, the `dotenv` packege will take care of automatically load environment variables from the `.env`.

Passwords in the `.env` file should not be reveled publicly, therefore the file should not be put in the repository. However, people should be able to easily re-create it starting from the `.env.example` file.


A script is defined in the package.json:
```javascript
scripts: {
    "test": "jest",
    "start": "node index.js",
    "start_local": "node -r dotenv/config server.js"
}
```

It can be run by:
```shell
> npm run start_local
```

Variables are loaded from `.env` file with `dotenv`:
```javascript
require("dotenv").config()
```