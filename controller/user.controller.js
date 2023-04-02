const conn = require("../connection")
const {GenerateAccesToken,GenerateRefreshToken} = require("../middleware/jwt")
const bcrypt = require("bcrypt")
const SR = 10


//Register
let massages = ""
const CheckNameAndEmail = (name,email,cb) => { // function for check an email and username is already exits
    let sql = 'SELECT company_name FROM company WHERE company_name = ? OR email = ?'
    conn.query(sql,[name,email],(err,data) => {
        if(err) throw err
        if(data.length > 0) {
            cb(true,"Nama perusahaan atau email sudah terdaftar")
        }else{
            cb(false)
        }
    })
}
const CheckPassword = (password) => { //function for checking length password
    if (password.length <= 8 ){
        massages = "Panjang password minimal 9 karakter"
        return false
    }
    return true
}
const InsertIntoDatabase = (name,email,password,provinsi,address,phone,description,photo_path,res) => { //function for insert form data into database
    const sql = "INSERT INTO company (company_name,email,password,provinsi,address,phone,description,photo_path) VALUES(?,?,?,?,?,?,?,?)"
    let fixName = name.trim()
    conn.query(sql,[fixName,email,password,provinsi,address,phone,description,photo_path],(err,data) => {
        if(err) throw err
        if(!data.affectedRows) return res.status(500).json({massage : "Something wrong please try again",status : 500})
        res.status(200).json({
            massage : "Register succes",
            status :200,
            data ,
        })

    })
}
const Register = (req,res) => { //main function for register
     let photo_path ="user.png"
    const {name,email,password,verify,provinsi,address,phone,description} = req.body
    if(password !== verify) return res.status(400).json({massage : "Konfirmasi password tidak valid"})
    CheckNameAndEmail(name,email,(exits,massage) => { // Name and email validation
        if(!exits && CheckPassword(password)) {
            bcrypt.genSalt(SR,(err,salt) => { //generate salt for hashing password
                if(err) throw err
                bcrypt.hash(password,salt,(err,hash) => {
                    if(err) throw err
                    InsertIntoDatabase(name,email,hash,provinsi,address,phone,description,photo_path,res)
                   
                })
            })
         
        }else if(exits){ // if name or email already exits
            return res.status(400).json({
                massage :massage,
                status :400

            })
        }else if(!CheckPassword(password)) { // if length password less than 8
            return res.status(400).json({
                massage :massages,
                status :400
            })
        }
    })
}
//End of register 

//Login
const GetDataAndCompare  = (email,password,passwordCompare,res) => {
     //function for get data from database and compare hashed password
    const sql = "SELECT idcompany,company_name,email,password,provinsi,address,phone,description,photo_path  FROM company WHERE email = ?"
    conn.query(sql,[email],(err,data) => {
        if(err) throw err
        if(data.length > 0 ) passwordCompare(password,data[0].password,data[0]) 
        else res.status(400).json({massage : "Email atau password salah",status :400})
    })      

}

const Login = (req,res) => {
    const {email,password} = req.body
        GetDataAndCompare(email,password, function(plainTextPass,hashedPass,data) {
            bcrypt.compare(plainTextPass,hashedPass,(err,result) => {
                if(err) throw err
                if(!result){
                    return res.status(400).json({massage : "Email atau password salah",status :400})
                }else{
                    const accesToken = GenerateAccesToken({
                        id :data.idcompany,
                        companyName :data.company_name,
                        email:data.email,
                        provinsi : data.provinsi,
                        address : data.address,
                        phone:data.phone,
                        description : data.description,
                        photo_path :data.photo_path
                    })
                    const refreshToken = GenerateRefreshToken({
                        id :data.idcompany,
                        companyName :data.company_name,
                        email:data.email,
                        provinsi : data.provinsi,
                        address : data.address,
                        phone:data.phone,
                        description : data.description,
                        photo_path :data.photo_path
                    })
                    res.cookie("refreshToken",refreshToken,{
                        httpOnly: true
                    })
                    UpdateTokenUser(refreshToken,data.idcompany)
                    res.status(200).json({massage : "Login succesfully",accesToken})
              } 
            })
           
        },res)

}
const UpdateTokenUser = (token,id) =>{
    const sql = 'UPDATE company SET token = ? WHERE idcompany = ?'
    conn.query(sql,[token,id],(err,result) => {
        if(err) throw err
        console.log(result)
    } )
}

const GetUser = (req,res) => {
    res.status(200).json({user: req.user})
}

const Logout = (req,res) => {
    const user = req.user
    const sql = "UPDATE company SET token = NULL WHERE idcompany = ?"
    res.clearCookie('refreshToken')
    conn.query(sql,user.idcompany,(err,data) => {
        if(err) throw err
        res.status(200).json({massage : "Logout berhasil",data})
    })

}

module.exports = {Login,Register,Logout,GetUser}