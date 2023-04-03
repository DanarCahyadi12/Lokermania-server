const express = require("express")
const router = require("./routes/route")
const { urlencoded } = require("body-parser")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const cors = require("cors")
const app = express()

require("dotenv").config()
const PORT = process.env.PORT || 3000;
app.use(fileUpload({
    createParentPath : true
    
}));
app.use(cors());

app.use(urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.json()) 
app.use("/",router)


app.listen(PORT,()=> {
    console.log("SERVER IS RUNNING ", PORT )
})