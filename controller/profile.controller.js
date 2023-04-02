
const path = require("path")
const fs = require('fs')
const conn = require("../connection")


const UpdateProfile =  (req,res) => {
    const {idcompany} = req.user
    const {company_name,provinsi,address,phone,description,} = req.body
    let sql = "UPDATE company SET company_name = ? ,provinsi = ? ,address = ? ,phone = ?,  description = ? WHERE idcompany = ?"
    if(!company_name) return res.status(400).json({massage : "Company name is required",status : 400})
    if(!address) return res.status(400).json({massage : "Address  is required",status : 400})
    if(!phone) return res.status(400).json({massage : "Phone number is required",status : 400})
    CheckCompanyName(company_name,idcompany,(result) => {
        console.log("RESULT ",result)
        const {status} = result
        const {massage} = result
        if(status !== 200) return res.status(status).json({massage})
        conn.query(sql,[company_name, provinsi, address, phone, description, idcompany],(err, result) => {
            if (err) throw err;
            if (result.affectedRows === 0)return res.status(500).json({ massage: "Something wrong.Please try again", status: 500 });
            const img = req.files?.img;
            if (img) {
                if (checkExtension(img)) UpdatePhoto(img, idcompany);
                else return res.status(400).json({ massage: "Extensi harus .jpg .png .jpeg", status: 400 });
            }
            res.status(200).json({ massage: "Profile berhasil diupdate", status: 200 });
          }
        );

    })
}


const CheckCompanyName= (name,id,cb) => {
    const sql = "SELECT LOWER(company_name) FROM company WHERE company_name = ? AND NOT idcompany = ?"
    conn.query(sql,[name.toLowerCase(),id],(err,result) => {
        if(err) throw err
        if(result.affectedRows === 0 ) return cb({massage : "Something error",status: 500})
        if(result.length > 0 )  return cb({massage :"Nama perusahaan sudah terdaftar.Silahkan gunakan nama yang lain",status: 400,name : true})
        cb({massage : "Success",status : 200,name : false,email: false})
    })
   

   
}

const checkExtension = (img) => {
    let ext = [".png",".jpg",".jpeg"]
    let res = ext.filter((val) => {
        if(path.extname(img.name).toLowerCase() === val) return val
    })
    if(res.length == 0) return false
    return true
}
const UpdatePhoto = (img,id) => {    
    let dir ="../client/src/photo-profile/"
    img.mv(dir+img.name,(err) => {
        if(err) throw err
        fs.rename(dir+img.name,dir+id+".png",(err) => {
            if(err) throw err
            let sql = "UPDATE company set photo_path = ? WHERE idcompany = ?"
            conn.query(sql,[id+".png",id],(err,result) => {
                if(err) throw err
                if(result.affectedRows == 0 ) return 
                console.log("update succes")
            })
        })
    })
}
const DeletePhotoProfile = (req,res) => {
    let dir ="../client/src/photo-profile/"
    const {idcompany} = req.user
    if(fs.existsSync(dir+idcompany+".png")){
        fs.unlink(dir+idcompany+".png",(err)=>{
            if(err) throw err
            let sql = "UPDATE company set photo_path = ? WHERE idcompany = ?"
            conn.query(sql,["user.png",idcompany],(err,result) => {
                if(err) throw err
                if(result.affectedRows == 0 ) return 
                return res.status(200).json({massage : "Foto profile berhasil dihapus",status :200})
            })
        })
    }else{

        return res.status(400).json({massage : "Tidak bisa menghapus foto profile",status : 400})
    } 
}

module.exports ={UpdateProfile,DeletePhotoProfile}