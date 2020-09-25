const express = require('express') //  backend route manager/site server
const bodyParser = require('body-parser')
const cors = require('cors') //  some security thing?
const morgan = require('morgan') //  for debugging
const config = require('./src/config/config') // server config properties
// var busboy = require('connect-busboy') // for multipart file handling

const app = express()
app.use(morgan('combined')) // log formatting for debugging site hits
app.use(bodyParser.json())
app.use(cors())
// app.use(busboy())


// import routes.js for URL routing. Passes 'app' object
require('./src/routes')(app)

// Start
app.listen(config.port)
console.log(`Server Started on port ${config.port}`)
