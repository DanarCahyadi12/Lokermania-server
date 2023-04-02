const express = require("express")
const router = express.Router()
const {Login,Register,Logout, GetUser} = require("../controller/user.controller")
const {GetSpecifyCompany} = require("../controller/company.controller")
const {GetListApplicants,DeleteApplicants} = require("../controller/applicants.controller")
const {GetVacancyLimited,GetSpecifyVacancy,AddVacancy,GetAllVacancy,SearchVacancy, GetCompanyVacancy, UpdateVacancy, DeleteVacancy} = require("../controller/vacancy.controller") 
const {ApplyJob} = require("../controller/apply.job.controller")
const {VerifyToken,RefreshToken} = require("../middleware/jwt")
const {UpdateProfile,DeletePhotoProfile} = require("../controller/profile.controller")

//User routes
router.get("/",GetVacancyLimited)
router.get("/search",GetAllVacancy)
router.get("/search/:vacancy/:provinsi",SearchVacancy)
router.get("/company/:id",GetSpecifyCompany)
router.get("/vacancy/:id",GetSpecifyVacancy)
router.post("/vacancy/:id",ApplyJob) 
//end of user routes


//Company routes
router.get("/dashboard",VerifyToken,GetListApplicants)
router.get("/get-user",VerifyToken,GetUser)
router.get("/company-vacancy",VerifyToken,GetCompanyVacancy)
router.get("/applicants",VerifyToken,GetListApplicants)
router.delete("/dashboard/:id",VerifyToken,DeleteApplicants)
router.post("/add-vacancy",VerifyToken,AddVacancy)
router.post("/profile",VerifyToken,UpdateProfile)
router.delete("/profile",VerifyToken,DeletePhotoProfile)
router.post("/login",Login)
router.get("/get-token",RefreshToken)
router.post("/register",Register)
router.get("/logout",VerifyToken,Logout)
router.post("/profile/update-vacancy/:idvacancy",VerifyToken,UpdateVacancy)
router.delete("/profile/delete-vacancy/:idvacancy",VerifyToken,DeleteVacancy)
//End of company routes
module.exports = router

    