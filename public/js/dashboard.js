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
    document.getElementById('msg').innerHTML="you are a Primium user";
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
        console.log("tessst",reords)
        reords.forEach(rec=>{
            const row=Object.values(rec);
            const values=row.slice(0,4)
            showData(values)
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
    const  category=document.getElementById('category').value
    const data={amount:amount,description:description,category:category};
    const token=localStorage.getItem('token');
    console.log("this is toke n which i got ",token,"data=",data)
    axios.post('http://localhost:3000/addExpense',data,{headers: {"Authentication": token }}).then(result=>{
    console.log("leaders is ",result.data.expense)   
    const { id,amount, description, category } = result.data.expense;
        const dataValues={ id, amount, description, category };
        const values=Object.values(dataValues);
        console.log("received data after added",values)
        showData(values); 
    }).catch(err=>{
        console.log(err)
    })  
})
function showData(values)
{
    const id=values.shift()
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
    await axios.post('http://localhost:3000/deleteExpense').then(response=>{
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
