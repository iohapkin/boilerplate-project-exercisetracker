const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, {useNewUrlParser:true, useUnifiedTopology:true})

const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true},
  description: { type: String, required: true},
  duration: { type: Number, required: true},
  date: { type: String, required: true}  
},{versionKey: false}
)

const userSchema = new mongoose.Schema({
  username: {type: String, required: true}
},{versionKey: false})

const logSchema = new mongoose.Schema({
   description: String,
   duration: Number,
   date: String
},{versionKey: false})

const User =       mongoose.model('user', userSchema)
const Execrcise =  mongoose.model('exercise', exerciseSchema)
const Log =        mongoose.model('log', logSchema)



app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {

  User.find()
  .then( response => {
      res.send(response)
  })

})

app.post('/api/users', (req, res) => {

  let userParam = req.body.username
  let newUser = new User({
    username: userParam
  })
 
  newUser.save()
  .then( response => {
    res.send(response)  
  })

})


app.post('/api/users/:id/exercises', async (req, res) => {
  const id = req.params.id
  let { description, duration, date } = req.body

  date = (date) ? new Date(date).toDateString() : new Date().toDateString()

  let user = await User.findById(id).exec()

  let newExercise = new Execrcise({
    username: user.username,
    date: date,
    duration: Number(duration),
    description: description
  })
 
  let response = await newExercise.save()
  res.json({
    "_id":user._id,
    "username": response.username,
    "date": response.date,
    "duration": response.duration,
    "description": response.description
  })

})

app.get('/api/users/:id/logs', async (req, res) => {
  
  const id = req.params.id
  const {from, to, limit } = req.query
  const option = limit ? { limit: limit} : {}
  let user = await User.findById(id).exec()
  
  let logs =   (user) ? await Execrcise.find({ username: user.username }, { _id: 0, username: 0 }, option ).exec() : []

  let totalLogs = logs.length  
  let response = {
    _id: user.id,
    username: user.username,
    count: totalLogs,
    log: [...logs]
  }

  res.json(response)
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
