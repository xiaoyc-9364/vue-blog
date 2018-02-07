const mongoose = require('mongoose')
// const init = require('./init.json')
const Schema = mongoose.Schema

const Blog = new Schema({
    title: String,
    intro: String,
    content: String,
    author: String,
    date: { 
        type: String, 
        default: new Date().toLocaleString() 
    },
    headIcon: String,
    like: {
        type: Number,
        default: 0
    },
    readNum: {
        type: Number,
        default: 0
    },
    appraises: {
        type: Array,
        default: []
    }

});

mongoose.connect('mongodb://127.0.0.1:27022/blogs')

const db = mongoose.connection

db.on('error', function () {
  console.log('Database connection error.')
})

db.once('open', function () {
  console.log('The database has connected.')
})

module.exports = mongoose.model('blog', Blog);
