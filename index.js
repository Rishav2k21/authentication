import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const app=express();
const PORT =3000;
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

mongoose.connect("mongodb://0.0.0.0:27017",{dbName:"auth"}).then(()=>{console.log("connected to mongoose")}).catch((e)=>{
console.log(e);
});

const student=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})


const messege=mongoose.model("auth",student);



app.get("/",async(req,res)=>{
   
    const token=req.cookies.token;
    if(!token){
    res.render("login.ejs");
    }
    else{
       
        const decode=jwt.verify(token,"rishav");
     
        const user=await messege.findById(decode.id);
       
        res.render("logout.ejs",{name:user.name}); 
    }
});



app.post("/login",async(req,res)=>{
    //cookie created
   
 
    const {email,password}=req.body;
    let us=await messege.findOne({email});
    if(!us){
    
      return  res.redirect("/register");
    }
    const match=await bcrypt.compare(password,us.password);
    if(!match){
        return res.render("login.ejs",{messege:"incorrect password"})
    }
   
    const token=jwt.sign({id:us._id},"rishav");
    res.cookie("token",token,{
        httpOnly:true,expires:new Date (Date.now()+60*1000)
    }) 
   
//    if(token){
    //    const decode=jwt.verify(token,"rishav");
    //    req.us=await us.findOne(decode._id);
    //    res.render("logout.ejs",{name:req.us.name});
//    }

   res.redirect("/");
   
});

app.post("/register",async(req,res)=>{

    const {name,email,password}=req.body;
    let user=await messege.findOne({email});
    if(user){
         return res.render("login.ejs")
    }
     const hash=await bcrypt.hash(password,10);
    const mes={name:name,email:email,password:hash};
    messege.create(mes);
    
        res.redirect("/");
})


app.get("/logout",(req,res)=>{
  //  cokkie deleted
    res.cookie("token",null,{
        httpOnly:true,expires:new Date (Date.now())
    });
    res.redirect("/");
})

app.get("/register",(req,res)=>{
    res.render("register.ejs");
})
// app.get("/login",(req,res)=>{
//     res.render("login.ejs")
// })


app.listen(PORT,()=>{
    console.log("server connected");
})

