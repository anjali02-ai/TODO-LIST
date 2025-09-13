import express from 'express'
import path from 'path'
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const dbName = 'node-js'
const collectionName = 'todo'
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url)
const publicPath = path.resolve('public')
app.set("view engine",'ejs')
app.use(express.static(publicPath))

app.use(express.urlencoded({extended:true}))
app.use(express.json())
const connection = async()=>{
    const connect = await client.connect();
    return await connect.db(dbName)
}

app.get("/",async(req,resp)=>{
    const db = await connection()
    const collection = db.collection(collectionName)
    const result =await collection.find().toArray()
    console.log(result)
    resp.render("list",{result:result})
})
app.get("/add",(req,resp)=>{
    resp.render("add")
})
app.get("/update",(req,resp)=>{
    resp.render("update")
})
app.post("/update",(req,resp)=>{
    resp.redirect("/")
})
app.post("/add",async(req,resp)=>{
    const db = await connection()
    const collection  = db.collection(collectionName)
    const result = collection.insertOne(req.body)
    if(result){
 resp.redirect("/")
    }
    else{
        resp.redirect("/add")
    }
})
app.get("/delete/:id",async(req,resp)=>{
    const db = await connection()
    const collection  = db.collection(collectionName)
    const result = collection.deleteOne({_id:new ObjectId(req.params.id)})
    if(result){
 resp.redirect("/")
    }
    else{
        resp.send("some error")
    }
})
app.get("/update/:id",async(req,resp)=>{
    const db = await connection()
    const collection  = db.collection(collectionName)
    const result = await collection.findOne({_id:new ObjectId(req.params.id)})
    if(result){
 resp.render("update",{result:result})
    }
    else{
        resp.send("/some error")
    }
})
app.post("/update/:id",async(req,resp)=>{
    const db = await connection()
    const collection  = db.collection(collectionName)
    const filter =  {_id:new ObjectId(req.params.id)}
    const updatedData = {$set:{title:req.body.title,description:req.body.description}}
    const result = await collection.updateOne(filter,updatedData)
    console.log(req.params.id)
    if(result){
 resp.redirect("/")
    }
    else{
        resp.send("some error")
    }
})
app.post("/multi-delete",async(req,resp)=>{
    const db = await connection()
    const collection  = db.collection(collectionName)
    let selectedTask = undefined
    if(Array.isArray(req.body.selectedTask)){
     selectedTask = req.body.selectedTask.map((id)=> new ObjectId(id))
    }
    else{
selectedTask =[ new ObjectId(req.body.selectedTask)]
    }
    console.log(selectedTask)
    const result = await collection.deleteMany({_id:{$in:selectedTask}})
    if(result){
        resp.redirect("/")
    }
    else{
        resp.send("some error")
    }
})

app.listen(3000)