const conn = require("../connection")

const GetSpecifyCompany = (req,res) => {
    const id = req.params.id
    let sql = "SELECT job_list.idjob_list,job_list.title FROM job_list WHERE job_list.fk_company = ?"
    const queryCompany  = 'SELECT idcompany, company_name,email,provinsi,address,phone,description,photo_path FROM company WHERE idcompany = ?'
    conn.query(queryCompany,id,(err,data) => {
        if(err) throw err
        if(data.affectedRows == 0) return res.status(500).json({massage : "Something wrong.Please try again",status : 500})
        conn.query(sql,id,(err,result) => {
            if(err) throw err
            if(result.affectedRows == 0) return res.status(500).json({massage : "Something wrong.Please try again",status : 500})

            let payload = {
                company : data[0].company_name,
                email : data[0].email,
                provinsi : data[0].provinsi,
                address : data[0].address,
                phone : data[0].phone,
                description : data[0].description,
                vacancy : []
            }

            if(result.length > 0) {
                for(let i = 0;i < result.length; i++) {
                    payload.vacancy.push({id : result[i].idjob_list,title : result[i].title})
                }
               
            }
            res.status(200).json({massage :"Get specify company succesfully",status : 200,data : payload})  
        })
    })
   
}

module.exports = {GetSpecifyCompany}