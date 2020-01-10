const express=require('express')
const Task=require('../model/task')
const auth=require('../middleware/auth')

const router=new express.Router;

router.post('/task',auth,async (req,res)=>{
    const task=new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
})

// task?completed=true
// task?limit=m?skip=n
// task?sortBy=field&order=asc
router.get('/task',auth,async (req,res)=>{
    try{
        // const tasks = await Task.find({owner: req.user._id});
        // console.log(tasks);
        var match = {}
        var sortBy = 'createdAt';
        var order = 'asc';

        if(req.query.sortBy)
            sortBy = req.query.sortBy

        if(req.query.order)
            order = req.query.order

        var sortObject = {}
        sortObject[sortBy]=order;

        if(req.query.completed)
            match.completed = req.query.completed == 'true'

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sortObject
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send();
    }
})

router.get('/task/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOne({_id: req.params.id,owner: req.user._id});
        if(task){
            res.send(task);
        }
        res.status(400).send('No task match');
    }catch(e){
        res.status(500).send();
    }
})

router.patch('/task/:id',auth,async (req,res)=>{
    const validUpdates = ['description','completed'];
    const updateRequests = Object.keys(req.body)
    const validRequest = updateRequests.every((update)=>{
        return validUpdates.includes(update)
    })

    if(!validRequest)
        return res.status(400).send('Invalid Update')
    
    try{
        const user = await Task.findOneAndUpdate({_id: req.params.id,owner: req.user._id},req.body,{new: true,runValidators: true})
        if(user)
            res.send(user);
        res.status(400).send('No task match')
    }catch(e){
        res.status(400).send('Update validation failed')
    }
})

router.delete('/task/:id',auth,async (req,res)=>{
    try{
        const user=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if(!user)
            throw new Error()
        res.send(user);
    }catch(e){
        res.status(400).send("No task match");
    }
})

// const router=new express.Router;

module.exports = router;