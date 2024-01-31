
    
    
    const submitBtn=document.querySelector('.signup-btn');
    const nameInput=document.querySelector('.input-box[type="name"]');
    const emailInput=document.querySelector('.input-box[type="email"]');
    const phoneInput=document.querySelector('.input-box[type="number"]');
    const passwordInput=document.querySelector('.input-box[type="password"]');
    submitBtn.addEventListener('click',(e)=>{
            e.preventDefault();
            const name=nameInput.value;
            console.log("the ame",name)
            const email=emailInput.value;
            const phone=phoneInput.value;
            const passwd=passwordInput.value;
            const userInfo={
                name:name,
                email:email,
                phone:phone,
                passwd:passwd
            }
            console.log("before sending=",userInfo)
            axios.post('http://localhost:3000/signup',userInfo).then(response=>{
                if(response.data.success)
                {
                    window.alert("user added successfully..");
                    window.location.href="login.html"
                }
                else{
                    window.alert("user already exists")
                }
            }).catch(error=>{
                console.log(error)
            })

        })

    








function validateEmail(email)
{
    //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const checker=   /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return checker.test(email);
}