require("../.env").config()
const cloudinary = require('cloudinary').v2

const cloud = cloudinary.config({
    cloud_name : process.env.cloud_name,
    api_key : process.env.cloud_key,
    api_secret : process.env.cloud_secret

})

module.exports = cloudinary