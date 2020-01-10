const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})



// const me = new User({name: 'Parth',age: 19,password: '123password456'})

// me.save().then(()=>{
//     console.log(me);
// }).catch((error)=>{
//     console.log(error)
// })