const {InsertApplicants,InsertApplied} = require('../controller/applicants.controller')
const path = require("path")
const fs = require('fs')
let dir = "../client/src/cv"
let conn = require("../connection")
const  ApplyJob = (req,res) => {
    const id = req.params.id
    let cv = req.files.cv //CV uppload
    if(!cv) return res.status(400).json({massage : "Tolong lampirkan CV anda"})
        if(CheckExtension(cv)){
            InsertApplicants(req.body,(result)=>{
                if(result.affectedRows == 0)  return res.status(500).json({massage : "Something wrong please try again"})
                    CreateDir(result.insertId,cv)
                    InsertApplied(result.insertId,id,(result) => {
                        if(!result.affectedRows)  return res.status(500).json({massage : "Something wrong please try again"})
                    })
                })

        }else{
            return res.status(400).json({massage : "Extensi file harus .pdf"})
        }
        return res.status(200).json({massage : "Job succesfully applied"})
   
  

}


const CreateDir = (id,cv) => {
    fs.mkdir(`${dir}/${id}`,{recursive : true},(err) => {
        if(err) throw err
        ApplyCV(id,cv)
    })
}
const ApplyCV = (id,cv) => {
    let sql = "UPDATE applicants SET cv_path = ?,cv_name = ? WHERE idapplicants = ?"
    cv.mv(`${dir}/${id}/${cv.name}`,(err) => {
        if(err) throw err
        conn.query(sql,[`${id}/${cv.name}`,cv.name,id],(err,result) => {
            if(err) throw err
        })
    })
}

const CheckExtension = (cv) => {
    if(path.extname(cv.name).toLowerCase() == ".pdf" ) return true
    return false

}
//End of apply job

module.exports  = {ApplyJob}