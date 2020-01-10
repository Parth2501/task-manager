const express=require('express')
// const User=require('./model/user')
// const Task=require('./model/task')
const TaskRouter=require('./router/taskRouter')
const userRouter=require('./router/userRouter')

require('./db/mongoose')

const app=express()
const port=process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(TaskRouter)


app.listen(port,()=>{
    console.log("server started on "+port)
})