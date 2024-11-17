const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    id:String,
    name:String,
    email:String,
    isAdmin:{
        type:Boolean,
        default:false
    },
    password:{
        select:false,
        type:String
    }
})

//encrypt password before save
userSchema.pre('save',async function(next){

    if(!(this.isModified('password'))){
        return next()
    }

    this.password= await bcrypt.hash(this.password,10)

})

//validate the password with passedon userpassword
userSchema.methods.isValidatedPassword = async function(userSendPassword){
    return await bcrypt.compare(userSendPassword,this.password)
}

//create and return jwt_token
userSchema.methods.getJwtToken = function(){
    return jwt.sign(
        {   
            email:this.email,   
            name:this.name,
            id:this.id,
            isAdmin:this.isAdmin
        },
        process.env.JWT_SECRET,
        {expiresIn:'1h'}
    )
}   

module.exports=mongoose.model('User',userSchema)