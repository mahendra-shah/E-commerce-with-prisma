const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const PORT = 5000
require("dotenv").config()

app.use(express.json())

const templatePath = path.join(__dirname,'./templates/views')
const cPath = path.join(__dirname,'./templates/css')
app.use(express.static(cPath))
app.set('view engine', 'ejs')
app.set('views', templatePath)
app.use(express.urlencoded({extended:true}))
app.use('/', require('./router/routes'))

// listening to
app.listen(PORT, () => console.log('connected to', PORT))
