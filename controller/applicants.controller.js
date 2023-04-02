
const conn = require("../connection")
const fs= require('fs')
const fsExtra = require('fs-extra');
//Get list applicants
const GetListApplicants = (req,res) => {
    const {idcompany} = req.user
    let sql  = "SELECT applied_job.id_applied, applicants.idapplicants,applicants.full_name,applicants.cv_name,applicants.email,applicants.address,applicants.phone,applicants.age,applicants.gender,applicants.cv_path ,job_list.title AS position_applied,applied_job.date_applied as date FROM applied_job INNER JOIN applicants ON applicants.idapplicants = applied_job.fk_applicants INNER JOIN job_list ON applied_job.fk_job = job_list.idjob_list WHERE applied_job.fk_company = ? ORDER BY applied_job.date_applied DESC"
    conn.query(sql,idcompany,(err,data) => {
        if(err) throw err
        if(data.length > 0 ) return res.status(200).json({massage : "Get data succesfully",status : 200,data})
        else res.status(200).json({massage : "No applicants here ",status: 200, data : []})
    })
}
const DeleteCV = (id) => {
    let dir = "../client/src/cv"
        if(fs.existsSync(`${dir}/${id}`)){
            fsExtra.emptyDirSync(`${dir}/${id}`);
            fs.rmdir(`${dir}/${id}`,() => {
                console.log("Remove succes")
            })
        }
}
const DeleteApplicants = (req,res) => {
    let sql = 'DELETE FROM applied_job WHERE (fk_applicants = ?)'
    let query = 'DELETE FROM applicants WHERE (idapplicants = ?)'
    const {id} =req.params
    console.log(id  )
    conn.query(sql,id,(err,result) => {
        if(err) throw  err
        if(result.affectedRows == 0) return res.status(500).json({massage : "Something wrong. Please try again",status : 500})
        DeleteCV(id)
        res.status(200).json({massage : "Pelamar berhasil di hapus"})

        
    })
    conn.query(query,id,(err,result) => {
        if(err) throw err
        if(result.affectedRows == 0) return res.status(500).json({massage : "Something wrong. Please try again",status : 500})
        res.status(200)

    })
}


//Apply job
const InsertApplicants = (data,cbApplicants) => {//function for insert data to applicants tabel
    let sqlApplicants = "INSERT INTO applicants (full_name,email,address,phone,age,gender,cv_path) VALUES (?,?,?,?,?,?,?)"
    conn.query(sqlApplicants,[data.fullName,data.email,data.address,data.phone,data.age,data.gender,data.cv_path],(err,result) => {
        if(err) throw err
        cbApplicants(result)
    } )

}

const InsertApplied = (idApplicants,idJob,cb) => { //function for insert data to applied job tabel
    let date = new Date()
    let month = parseInt(date.getMonth())+1
    let curDate = date.getFullYear()+"-"+month+"-"+date.getDate()
    let sql = "INSERT INTO applied_job (fk_applicants,fk_job,fk_company,date_applied) VALUES (?,?,?,?)"
    let query = 'SELECT fk_company FROM job_list WHERE idjob_list = ?'
    conn.query(query,idJob,(err,result) => {
        if(err) throw err
        conn.query(sql,[idApplicants,idJob,result[0].fk_company,curDate],(err,result) => {
            if(err) throw err
            cb(result)
        })
    })
    
}






module.exports = {GetListApplicants,InsertApplicants,InsertApplied,GetListApplicants,DeleteApplicants}