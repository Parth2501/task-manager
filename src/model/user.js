const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../model/task')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avtar: Buffer
},{
    timestamps: true
})

schema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

schema.methods.generateToken = async function(){
    const token = jwt.sign({id: this._id.toString()},process.env.JWT_SECRET)
    this.tokens = this.tokens.concat({token})
    await this.save();
    return token;
}

schema.methods.toJSON = function(){
    // console.log(this)
    const userObject = this.toObject();

    delete userObject.password
    delete userObject.tokens
    delete userObject.avtar
    // console.log(userObject)

    return userObject
}

schema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})

    // console.log(user);

    if(!user){
        throw new Error('dfdg')
    }

    // console.log("debug1");
    // console.log(user.password);

    // try{
        const match = await bcrypt.compare(password,user.password) 
    // }catch(e)
    // {
    //     throw new Error();
    // }
    // console.log('debug');

    if(!match){
        throw new Error('dfggfh')
    }

//    console.log("debug2");

    return user;
}

schema.pre('save',function(next){
    if(this.isModified('password'))
    {
        this.password = bcrypt.hashSync(this.password,8);
    }
    // next();
    // console.log('just before saving')
    next();
})

schema.pre('remove',async function(next){
    await Task.deleteMany({owner: this._id})
    
    next()
})

const User = mongoose.model('User', schema)

module.exports = User