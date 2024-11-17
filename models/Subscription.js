const mongoose = require('mongoose')

const subSchema = new mongoose.Schema({
    id:String,
    email:String
})
  
module.exports=mongoose.model('Subscription',subSchema)