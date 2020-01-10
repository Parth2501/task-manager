const express=require('express')
const User=require('../model/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendFarewellEmail}=require('../emails/account')

const router=new express.Router;
const upload=multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/))
            return callback(new Error('File format not supported'))
        callback(undefined,true)
    }
})

router.post('/user', async (req,res)=>{
    try
    {
        const user=new User(req.body);
        const token = await user.generateToken(); 
        await user.save();
        sendWelcomeEmail(user.email,user.name)
        res.send({user,token});
    }
    catch(e)
    {
        res.status(400).send(e);
    }
})

router.post('/user/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        // console.log('debug')
        const token = await user.generateToken();  
        // console.log('debug2') 
        res.send({user,token});
    }catch(e){
        res.status(400).send('wrong email or password')
    }
    // User.findByCredentials(req.body.email,req.body.password).then((user)=>{
    //     res.send('Login succesful');
    // }).catch((e)=>{
    //         res.status(400).send('wrong email or password')
    //     })
})

router.post('/user/me/avtar',auth,upload.single('upload'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height: 250,width: 250}).png().toBuffer()
    req.user.avtar = buffer

    await req.user.save()

    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.post('/user/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!=req.token
        })
        // console.log(1);
        await req.user.save()
        res.send();

    }catch(e){
        res.status(500).send();
    }
})

router.post('/user/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[];
        // console.log(1);
        await req.user.save()
        res.send();

    }catch(e){
        res.status(500).send();
    }
})

router.get('/user/:id/avtar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avtar)
            throw new Error('Unable to process')

        res.set('content-type','images/png')
        res.send(user.avtar)

    }catch(e){
        res.status(400).send(e);
    }
})

router.get('/user',async (req,res)=>{
    try{
        const users = await User.find({});
        res.send(users);
    }catch(e){
        res.status(500).send();
    }
})

router.get('/user/me',auth,async (req,res)=>{
    try{
        // const users = await User.find({});
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
})

router.get('/user/:id',async (req,res)=>{
    const _id=req.params.id;

    try{
        const user = await User.findById(_id);
        if(user){
            return res.send(user);
        }
        return res.status(400).send('No user match');
    }catch(e){
        res.status(500).send(e);
    }
})

router.patch('/user/me',auth,async (req,res)=>{
    const validUpdates = ['name','age','email','password'];
    const updateRequests = Object.keys(req.body)
    const validRequest = updateRequests.every((update)=>{
        return validUpdates.includes(update)
    })

    if(!validRequest)
        return res.status(400).send('Invalid Update')
    
    try{
        const user = req.user
        updateRequests.forEach((property) => {
            user[property] = req.body[property];
        });
        await user.save();
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true,runValidators: true})
        res.send(user);
        
    }catch(e){
        res.status(400).send('Update validation failed')
    }
})

router.delete('/user/me',auth,async (req,res)=>{
    try{
        // const user=await User.findByIdAndDelete(req.params.id);
        await req.user.remove();
        sendFarewellEmail(req.user.email,req.user.name)
        res.send(req.user);
    }catch(e){
        res.status(400).send("No user match");
    }
})

router.delete('/user/me/avtar',auth,async (req,res)=>{
    try{
        // const user=await User.findByIdAndDelete(req.params.id);
        req.user.avtar = undefined
        await req.user.save();
        res.send();
        
    }catch(e){
        res.status(400).send("No user match");
    }
})

module.exports = router;