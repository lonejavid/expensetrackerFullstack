const express = require('express');
const helmet = require('helmet');
const fs=require('fs')
const compression = require('compression');
const app = express();
const crypto = require('crypto');
const nonce = crypto.randomBytes(16).toString('base64');
const morgan=require('morgan');
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');


const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),{flag:'a'})
//app.use(compression());
//app.use(helmet());
//app.use(morgan('combined',{stream:accessLogStream}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));






// app.use((req, res, next) => {
//     res.setHeader('Content-Security-Policy', `script-src 'self' https://cdn.jsdelivr.net 'nonce-${nonce}'`);
//     next();
// });

// app.use((req, res, next) => {
//     res.setHeader('Content-Security-Policy', `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://checkout.razorpay.com 'nonce-${nonce}'`);
//     next();
// });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'images')));

const sequelize = require('./util/database');

const expenses = require('./routes/routes');
const resetPasswordRoutes = require('./routes/resetRoutes');
const { User, Expenses, Order } = require('./models/model');
const ForgotPassword = require('./models/forgotpasswordDB');
const downloadedFiles = require('./models/downloadedFiles');

User.hasMany(Expenses);
Expenses.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);
User.hasMany(downloadedFiles);
downloadedFiles.belongsTo(User);

app.use(expenses);
app.use(resetPasswordRoutes);

sequelize.sync().then(() => {
    console.log('Tables created successfully');
    app.listen(3000, () => {
        console.log('Server started on port ');
    });
});
