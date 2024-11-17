const mongoose = require('mongoose')

const connectWithDb = () => {
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        serverSelectionTimeoutMS: 5000, // Adjust this as needed
    }).then(()=>{
        console.log('DB Connected')
    }).catch((err=>{
        console.log('DB Connection failed')
        console.log(err)
        process.exit(1)
    }))
}

module.exports=connectWithDb