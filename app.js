const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.urlencoded({extended:false}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
// Serve static files from the "images" directory
app.use(express.static(path.join(__dirname, 'images')));
// Require your routes
const sequelize = require('./util/database');




const expenses = require('./routes/routes');
const resetPasswordRoutes=require('./routes/resetRoutes')



app.use(expenses);
app.use(resetPasswordRoutes);







const { User, Expenses,Order} = require('./models/model');
const ForgotPassword=require('./models/forgotpasswordDB')

User.hasMany(Expenses);
Expenses.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User)
User.hasMany(ForgotPassword)
ForgotPassword.belongsTo(User);
// //app.use(expenses.json())
sequelize.sync().then(() => {
    console.log('Tables created successfully');
    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
});

