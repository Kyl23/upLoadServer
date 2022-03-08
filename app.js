const express = require('express')
const post = require('./Router/post')
const app = express()


app.use('/', post)

app.listen('3000', () => { console.log('success start server') })