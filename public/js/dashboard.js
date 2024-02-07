function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function primiumUser(){
    document.getElementById('rzp-primum').style.visibility="hidden"
    document.getElementById('msg1').innerHTML="you are a Primium user";
    leadersBoard();
}
function leadersBoard(){
    const LeaderBoardDiv=document.getElementById('leadersBoard');
    LeaderBoardDiv.style.display="none"
    const leadersDiv=document.getElementById('leaderBtn')
    const leaders=document.createElement('button');
    leaders.innerHTML="Leaders Board";
    leadersDiv.appendChild(leaders);
    const list=document.getElementById('list');
    
    leaders.addEventListener('click',async()=>{
        LeaderBoardDiv.style.display="block"
        const token=localStorage.getItem('token')
        list.innerHTML='';

        const data=await axios.get('http://localhost:3000/leadersBoard',{headers: {"Authentication": token }});
        data.data.forEach((element)=>{
            console.log("data value before ",element)
            const textNode=document
            const li=document.createElement('li');
            li.innerHTML='Name='+element.name+'  '+'toatal cost='+element.totalExpense;
            list.append(li)

        })
    })
}
const myform=document.getElementById('expenses-form');
window.onload=()=>{
    const token=localStorage.getItem('token');
    const decodedToken=parseJwt(token);
    console.log("decoded token is",decodedToken)
    if(decodedToken.isprimium){
       primiumUser();
    }
    else{

    }
    axios.get('http://localhost:3000/getData',{headers:{"Authentication":token}}).then(result=>{
        const reords=result.data;
       
        reords.forEach(rec=>{
            const { id,createdAt, description, category, income, expense } = rec;
            let formattedCreatedAt;
            if (createdAt instanceof Date) {
                formattedCreatedAt = createdAt.toISOString().slice(0, 10);
            } else {
                formattedCreatedAt = new Date(createdAt).toISOString().slice(0, 10);
            }
            
            const dataValues = {
                id:id,
                createdAt: formattedCreatedAt,
                description,
                category,
                income,
                expense
            };
            
            const values = Object.values(dataValues);
            showData(values);
             

        })
    }).catch(error=>{
        console.log("error in loading the data",error)
    })
}
const expenseTable=document.getElementById('tb')
myform.addEventListener('submit',(e)=>{
    e.preventDefault();
    const amount=document.getElementById('amount').value;
    const description=document.getElementById('description').value
    const  category=document.getElementById('category').value;
    const incomecheckbox=document.getElementById('income');
    const expensecheckbox=document.getElementById('expense');
    const data={
        amount:amount,
        description:description,
        category:category,
        income: incomecheckbox.checked ? amount : null,
        expense:expensecheckbox.checked ?amount : null
    };
    const token=localStorage.getItem('token');
    console.log("data=",data)
    axios.post('http://localhost:3000/addExpense',data,{headers: {"Authentication": token }}).then(result=>{
    console.log("leaders is ",result.data.expense)   
    const { id,createdAt, description, category, income, expense } = result.data.expense;

    let formattedCreatedAt;
    if (createdAt instanceof Date) {
        formattedCreatedAt = createdAt.toISOString().slice(0, 10);
    } else {
        formattedCreatedAt = new Date(createdAt).toISOString().slice(0, 10);
    }
    
    const dataValues = {
        id:id,
        createdAt: formattedCreatedAt,
        description,
        category,
        income,
        expense
    };
    
    const values = Object.values(dataValues);
    console.log("Received data after added", values);
    showData(values);
     
    }).catch(err=>{
        console.log(err)
    })  
})
function showData(values)
{
    const id=values.shift();
    console.log("this is the id",id)
    
    const tr=document.createElement('tr');
    values.forEach(ele=>{
        const th=document.createElement('th');
        th.innerHTML=ele;
        tr.appendChild(th);
        
    })
const th=document.createElement('th');
const deleteBtn=document.createElement('button');
deleteBtn.innerHTML="Delete";
th.appendChild(deleteBtn)
tr.appendChild(th)
expenseTable.appendChild(tr)
deleteBtn.onclick=()=>{
    deleteExpense(id);
    expenseTable.removeChild(tr);
}
}
async function deleteExpense(id){
    console.log("this is the id ",id)
    const token=localStorage.getItem('token');
    await axios.post('http://localhost:3000/deleteExpense',id,{headers: {"Authentication": token }}).then(response=>{
        console.log("response i got",response)
    }).catch(error=>{
        console.log(error)
    })
}
//,{id},{headers: {"Authentication": token }}
const token=localStorage.getItem('token');
const decoded=parseJwt(token);
const email=decoded.email;
const primiumBtn=document.getElementById('rzp-primum');
primiumBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
        const response = await axios.get('http://localhost:3000/goPrimium', { headers: { "Authentication": token } });
        console.log("this is response=", response);
        console.log("payment id", response.data.razorpay_payment_id);

        const options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function (response) {
                try {
                    const res = await axios.post('http://localhost:3000/updateTaransaction', {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                        email: email
                    }, { headers: { "Authentication": token } });

                    console.log("the response after update", res);

                    // Log the token after successful updateTransaction
                    console.log("Token from the response:", res.data.token);
                    alert("you are a primium user");
                    localStorage.setItem('token', res.data.token);
                     primiumUser();
                } catch (error) {
                    console.error("Error in updateTransaction:", error);
                }
            },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault;

        rzp1.on('payment.failed', function (response) {
            alert("something went wrong");
        });
    } catch (error) {
        console.error("Error in goPrimium:", error);
    }
});


function download(){
    
    const token=localStorage.getItem('token');
    console.log("request for download",token);
    axios.get('http://localhost:3000/download', { headers: { "Authentication": token } })
    .then((response) => {
        if(response.status === 200){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileurl;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        console.log(err)
    });
}
