const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv")
dotenv.config()

// Configuring cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET
})

module.exports = cloudinary