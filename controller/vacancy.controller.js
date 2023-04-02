

const conn = require("../connection")
//Add loker
const AddVacancy = (req,res) => {
    const {idcompany} = req.user
    let sql = "INSERT INTO job_list (fk_company,title,requirements,description,posted,salary,job_function,graduates,majors,experiences) VALUES(?,?,?,?,?,?,?,?,?,?)"
    let date = new Date()
    let month = parseInt(date.getMonth())+1
    let curDate = date.getFullYear()+"-"+month+"-"+date.getDate()
    const {title,requirements,description,salary,jobFunction,graduates,majors,experiences} = req.body
    console.log(req.body)
    let requirementsConcate = ""
    for (let i = 0; i < requirements.length; i++){
        requirementsConcate += requirements[i]
        if(i != requirements.length-1) {
          requirementsConcate += ","  
        } 
    }
    conn.query(sql,[idcompany,title,requirementsConcate,description,curDate,salary,jobFunction,graduates,experiences,majors],(err,data) => {
        if(err) return err
        if(data.affectedRows === 0) return res.status(500).json({massage : "Something wrong, please try again",status : 500})
        res.status(200).json({massage : "Lowongan kerja berhasil ditambahkan",status:200})
    })

    


}

//End of add loker

//Get all data loker 
const GetVacancyLimited = (req,res) => {
    let sql = "SELECT company.idcompany, company.company_name,company.email,company.provinsi,company.address,company.phone ,company.photo_path, job_list.idjob_list,job_list.title,job_list.requirements,job_list.description,job_list.posted,job_list.salary,job_list.job_function,job_list.majors,job_list.graduates,job_list.experiences FROM job_list INNER JOIN company ON company.idcompany = job_list.fk_company ORDER BY job_list.posted DESC LIMIT 6"
    conn.query(sql,(err,data) => {
        if(err) throw err
        if(data.length > 0 ) return res.status(200).json({massage : "Get Updated vacancy succesfully",status : 200,data})
        res.status(200).json({massage : "There are no job vacany",data : []})
    })

}
//end of data loker

//Get specify vacancy
const GetSpecifyVacancy = (req,res) => {

    let sql = "SELECT company.idcompany,company.company_name,company.email,company.provinsi,company.address,company.phone,company.photo_path,job_list.title,job_list.description,job_list.requirements,job_list.posted,job_list.salary,job_list.job_function,job_list.majors,job_list.graduates,job_list.experiences,job_list.idjob_list FROM job_list INNER JOIN company ON company.idcompany = job_list.fk_company WHERE idjob_list = ?"
    let query = "SELECT job_list.idjob_list,job_list.title FROM job_list WHERE job_list.idjob_list NOT IN (?) AND job_list.fk_company = ? "
    conn.query(sql,[req.params.id] ,(err,data) => {
        if (err) throw err
        if(data.length === 0) return res.status(404).json({massage : "No vacancy here ",status: 404})
        let payload = {
            company : {
                idCompany : data[0].idcompany,
                companyName:data[0].company_name,
                email : data[0].email,
                provinsi: data[0].provinsi,
                address: data[0].address,
                phone : data[0].phone,
                photoUrl :data[0].photo_path
            },
            detailVacancy : {
                idVacancy : data[0].idjob_list,
                title :  data[0].title,
                description :  data[0].description,
                requirements : data[0].requirements,
                posted : data[0].posted,
                salary : data[0].salary,
                job_function :data[0].job_function,
                majors : data[0].majors,
                graduates : data[0].graduates,
                experiences : data[0].experiences
            },
            otherVacancy : []
        }
        conn.query(query,[req.params.id,data[0].idcompany],(err,data) => {
            if(err) throw err
            if(data.length > 0){
                for (let i of data){
                    payload.otherVacancy.push({idVacancy : i.idjob_list,title : i.title})
                }
            }
            res.status(200).json({massage : "Get vacancy succes",data : payload})
        })
       
    })
}


const GetAllVacancy = (req,res) => {
    let sql = "SELECT company.idcompany,company.photo_path, company.company_name,company.email,company.provinsi,company.address,company.phone, job_list.idjob_list,job_list.title,job_list.requirements,job_list.description,job_list.posted,job_list.salary,job_list.job_function,job_list.majors,job_list.graduates,job_list.experiences FROM job_list INNER JOIN company ON company.idcompany = job_list.fk_company LIMIT 1000"
    conn.query(sql,(err,data) => {
        if(err) throw err
        if(data.length > 0 ) return res.status(200).json({massage : "Get all job vacancy succefully",status : 200,data})
        res.status(200).json({massage : "There are no job vacancy",status : 200,data : []})
    })
}

const SearchVacancy = (req,res) => {
    const vacancy = req.params.vacancy
    const prov = req.params.provinsi
    const sql = `SELECT company.idcompany, company.company_name,company.photo_path,company.email,company.provinsi,company.address,company.phone, job_list.idjob_list,job_list.title,job_list.requirements,job_list.description,job_list.posted,job_list.salary,job_list.job_function,job_list.majors,job_list.graduates,job_list.experiences FROM job_list INNER JOIN company ON company.idcompany = job_list.fk_company WHERE job_list.title LIKE "%${vacancy}%"`

    const sql2 = `SELECT company.idcompany, company.company_name,company.photo_path,company.email,company.provinsi,company.address,company.phone, job_list.idjob_list,job_list.title,job_list.requirements,job_list.description,job_list.posted,job_list.salary,job_list.job_function,job_list.majors,job_list.graduates,job_list.experiences FROM job_list INNER JOIN company ON company.idcompany = job_list.fk_company WHERE job_list.title LIKE "%${vacancy}%" AND company.provinsi = ? `
    if(prov === "Seluruh provinsi"){
        conn.query(sql,(err,data) => {
            if(err) throw err
            if(data.affectedRows == 0 ) return res.status(500).json({massage : "Something wrong.Please try again",status : 500})
            res.status(200).json({massage : "Get vacancy succesfully",status : 200,data})
        })
    }else{
        conn.query(sql2,prov,(err,data) => {
            if(err) throw err
            if(data.affectedRows == 0 ) return res.status(500).json({massage : "Something wrong.Please try again",status : 500})
            res.status(200).json({massage : "Get vacancy succesfully",status : 200,data})
        })
    } 
}

const GetCompanyVacancy = (req,res) => {
    const {idcompany} = req.user
    const sql = "SELECT job_list.* FROM job_list WHERE fk_company = ?"
    conn.query(sql,idcompany,(err,data) => {
        if(err) throw err
        if(data.affectedRows === 0) return res.status(204).json({massage: 'SOMETHING WRONG'})
        let vacancy = []
        // console.log(data)
        for(let i of data) {
            vacancy.push(
                {
                    idjob_list : i.idjob_list,
                    fk_company : i.fk_company,
                    experiences : i.experiences,
                    description : i.description,
                    job_function : i.job_function,
                    majors : i.majors,
                    requirements : i.requirements.split(","),
                    title : i.title,
                    salary : i.salary,
                    graduates : i.graduates
                }
            )
        }
        console.log(vacancy)
        return res.status(200).json({massage : "SUCCESS",vacancy}) 
    })
}

const UpdateVacancy = (req,res) => {
    const {idcompany} = req.user
    const {idvacancy} = req.params
    const {title,requirements,description,salary,graduates,majors,jobFunction,experiences} = req.body
    const requirementsStr = requirements.join(",")

    const sql = 'UPDATE job_list SET title = ?, requirements = ?, description = ?, salary = ?,job_function = ? ,majors = ?, graduates = ?,experiences = ? WHERE idjob_list = ? AND fk_company =?'
    conn.query(sql,[title,requirementsStr,description,salary,jobFunction,majors,graduates,experiences,idvacancy,idcompany],(err,result) => {
        if(err) throw err
        if(result.affectedRows === 0) return res.status(204).json({massage : "Terjadi kesalahan.Mohon tunggu sebentar"})
        res.status(200).json({massage : "Lowongan kerja berhasil diupdate"})
    })

}

const DeleteVacancy = (req,res) => {
    const {idvacancy} = req.params
    const sql = "DELETE FROM job_list WHERE idjob_list = ?"
    conn.query(sql,idvacancy,(err,result) => {
        if(err) throw err
        if(result.affectedRows === 0 ) return res.status(204).json({massage : "Terjadi kesalahan. Mohon tunggu"})
        res.status(200).json({massage : "Lowongan kerja berhasil dihapus"})
    })
}

module.exports = {AddVacancy,GetVacancyLimited,GetSpecifyVacancy,GetAllVacancy,SearchVacancy,GetCompanyVacancy,UpdateVacancy,DeleteVacancy}
