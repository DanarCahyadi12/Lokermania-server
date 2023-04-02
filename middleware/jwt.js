const jwt = require("jsonwebtoken")
const jwtDecoder = require("jwt-decode")
const conn = require("../connection")
const GenerateAccesToken = (data) => {
    return jwt.sign(data,process.env.ACCESS_TOKEN_SECRET,{expiresIn : '20s'})
}
const GenerateRefreshToken = (data) => {
    return jwt.sign(data,process.env.REFRESH_TOKEN_SECRET)
}

const RefreshToken = (req,res) => {
    const token = req.cookies.refreshToken
    if(!token) return res.status(401).json({massage : "UNAUTH"})
    const sql = 'SELECT idcompany,company_name,email,provinsi,address,phone,description,photo_path FROM company WHERE token = ?'
    conn.query(sql,token,(err,data) => {
        if(err) throw err
        if(data.length === 0 ) return res.status(400).json({massage : "INVALID TOKEN"})
        jwt.verify(token,process.env.REFRESH_TOKEN_SECRET,(err) =>{
            if(err) return res.status(400).json({massage : "INVALID TOKEN"})
            const accesToken = GenerateAccesToken(data[0])
            return res.status(200).json({accesToken})
        } )
    })
}


const VerifyToken = (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token) return res.status(401).json({massage : "UN AUTH"})
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,data) =>{
        if(err) return res.status(400).json({massage : "INVALID TOKEN"})
        req.user = data
        next()
    } )

}



module.exports = {GenerateAccesToken,GenerateRefreshToken,RefreshToken,VerifyToken}