const jwt = require('jsonwebtoken')
const User = require('../model/user')

const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        // console.log('1');
        // console.log(decoded.id)
        const user = await User.findOne({_id: decoded.id,'tokens.token': token})
        
        // console.log(user);
        if(!user)
            throw new Error()
        // console.log(3)
        req.user = user
        // console.log(req.user)
        req.token = token

        next()
    }catch(e){
        res.status(400).send('Authorization Failed!')
    }
}

module.exports = auth;