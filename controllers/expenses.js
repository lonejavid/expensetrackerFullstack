const path = require('path');
const model  = require('../models/model');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const config = require('../config')
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const sequelize = require('../util/database');
const UserServices=require('../services/userservices')
const AWS=require('aws-sdk')
const downloadedFiles=require('../models/downloadedFiles');
const DownloadedFiles = require('../models/downloadedFiles');

exports.expenses = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
};
exports.signup = async (req, res) => {
    try {
        const userInfo = req.body;
        // Use the createUser method in the User model to create a new user
       const result= await model.createUser(userInfo);
        res.send(result);
    } catch (error) {
        console.error("Error in signup:", error.message);
        res.status(500).json({ message: 'User already exists' });
    }
};
function generateAccessToken(email,isprimium){
    return jwt.sign({email,isprimium},'786bismullah745javs234kop0988322bz');
}
exports.login=async(req,res)=>{
    const loginDetails=req.body;
    const email = loginDetails.email;
    const password = loginDetails.password;

    try {
        const user = await  model.User.findByPk(email);
  

        if (user) {
            const hashedPassword = user.dataValues.passwd;
            const emailInput=user.dataValues.email

            // Compare the provided password with the hashed password in the database
             bcrypt.compare(password, hashedPassword,(err,result)=>{
                if(err){
                    throw new Error("something went wrong");
                    
                }
                if(result===true){
                    console.log("check it ",user.dataValues.isprimium)
                    return res.status(200).json({success:true,message:"user loged in successfully",token:generateAccessToken(emailInput,user.dataValues.isprimium)})
                }
            });
        }
    }
     catch (error) {
        console.error("Error during login:", error.message);
        return { status: 500, message: "Internal server error" }; // 500 Internal Server Error
    }
}

exports.deleteExpense=async(req,res)=>{
    var id=Object.keys(req.body);
    var id=id[0];
    console.log("the user id to be deleted",id)
    model.Expenses.destroy({where:{
        id:id,
        UserEmail:req.user.email
    }}).then((rows)=>{
        if(rows==1)
        {
            return res.status(200).json({success:true,message:"successfully deleted"})
        }
            return res.status(400).json({success:false,message:"expense does not belong to this user"})
    }).catch(err=>{
        console.log("error occured while deleting",err)
    })
}
// exports.getData=async(req,res)=>{
  
//    const data= await model.Expenses.findAll({where:{UserEmail:req.user.email}});   
//     res.send(data)
// }
exports.getData = async (req, res) => {
    const page = parseInt(req.query.page) || 1;

    const pageSize = parseInt(req.query.limit) ;

    const offset = (page - 1) * pageSize;

    try {
        const data = await model.Expenses.findAll({
            where: { UserEmail: req.user.email },
            offset,
            limit: pageSize,
        });

        res.send(data);
    } catch (error) {
        console.log("Error fetching data", error);
        res.status(500).send("Internal Server Error");
    }
};




exports.goPrimium = async (req, res) => {
    try {
        console.log("testing the code ")
        // Set Razorpay keys
        const RAZORPAY_KEY_ID = 'rzp_test_GAKPWtu92gPjpM';
        const RAZORPAY_KEY_SECRET = '2A6ZKzJtVwKIkz8XLUhmjxGd';
        // Create a new Razorpay instance
        const rzp = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret:RAZORPAY_KEY_SECRET
        });
        const amount = 25000;
        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                console.error("Razorpay API Error:", err);
                return res.status(500).json({ error: "Error creating Razorpay order" });
            }
            req.user.createOrder({ orderId: order.id, 'status': 'approved' })
                .then(() => {
                    return res.status(200).json({ order, key_id: rzp.key_id });
                })
                .catch(err => {
                    console.error("Error creating user order:", err);
                    return res.status(500).json({ error: "Error creating user order" });
                });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Unexpected error" });
    }
};
exports.updateTaransaction = async (req, res) => {
    try {
        const { payment_id, order_id,email } = req.body;

        const order = await model.Order.findOne({ where: { orderId: order_id } });
        const promise1 = order.update({ paymentId: payment_id, status: "successfull" });
        const promise2 = req.user.update({ isprimium: true });

        Promise.all([promise1, promise2])
            .then(() => {
                return res.status(200).json({ success: true, message: "transaction successfull" ,token:generateAccessToken(email,true)})
            }).catch((error)=>{
                throw new Error(error)
            })

    } catch (error) {
        console.log("error", error);
    }
};
exports.leadersBoard=async(req,res)=>{
    const laderboardOfusers=await model.User.findAll({

        attributes:['name','totalExpense'],
        order: [['totalExpense', 'DESC']],
        
    })
   
    return res.status(200).json(laderboardOfusers);
}
exports.addExpense=async(req,res)=>{

    const data=req.body;
    const email=req.user.email
    data.UserEmail=req.user.email
    // console.log(data)
try{
    const t =await sequelize.transaction();
    await model.Expenses.create(data,{transaction: t}).then(async(expense)=>{
         var alreadySpend= await model.User.findOne({
        where:{email:email},
        attributes:['totalExpense'],
         })
         var newExpenseAmount=Number(expense.amount)+Number(alreadySpend.get('totalExpense'));

         await model.User.update({totalExpense:newExpenseAmount},{
        where:{email:email},
        transaction:t
    }).then(async()=>{
        t.commit();
        return res.status(200).json({expense})
        

    }).catch(async(err)=>{
        t.rollback();
        return res.status(500).json({success:false,error:err})

    })

    }).catch(err=>{
        console.log("expense not added",err)
        
    })

}
catch(error){
    console.log(error)
}

}

exports.download=async(req,res)=>{
    try{
const expenses=await UserServices.getExpenses(req);
const stringifiedExpense=JSON.stringify(expenses);
const userEmail=req.user.email;
const filename=`Expense${userEmail}/${new Date()}.txt`;
const fileurl=await uploadToS3(stringifiedExpense,filename,userEmail);
res.status(200).json({fileurl,success:true});
    }
catch(err){
    console.log(err)
    return res.status(500).json({fileurl:'',success:false,err:err})
}
}


function uploadToS3(data,filename,userEmail){
    let s3bucket=new AWS.S3({
        accessKeyId:process.env.IAM_USER_KEY,
        secretAccessKey:process.env.IAM_USER_SECRET,
    })
        var params={
            Bucket:'expensetracker131',
            Key:filename,
            Body:data,
            ACL:'public-read'
        }
        return new Promise((resolve,reject)=>{
            s3bucket.upload(params,(err,s3response)=>{
                if(err){
                    console.log("eror occured while uploading the data",err)
                    reject(err)
                }
                else{
                    const downloadedInfo={
                        filelocation:s3response.Location,
                        UserEmail:userEmail

                    }
                    downloadedFiles.create(downloadedInfo)
                   // console.log("successfully uploaded",s3response.Location);
                    resolve(s3response.Location);
                }
            })
        })    
}


exports.allFiles=async (req,res)=>{
    try{
        const fileLocs=await downloadedFiles.findAll({
            attributes:['filelocation']

        })
        res.status(200).json({fileLocs});

    }
    catch(err){
        console.log("error occured while loading the files from the database")

    }
}