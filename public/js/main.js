let username = localStorage.getItem('usernameChatApp') || '';
if (username.length === 0){
        let userno = parseInt(Math.random() * (99999 - 1000) + 1000);
        username = 'user' + userno;
        localStorage.setItem('usernameChatApp',username);
        document.getElementById('userDisplayName').innerText = username; 
        document.getElementById('displayName').value = username;        
}else{
    document.getElementById('userDisplayName').innerText = username;
    document.getElementById('displayName').value = username;   
}



const private = document.getElementById('private');
const public = document.getElementById('public');
const showInPrivate = document.getElementById('showInPrivate');
const password = document.getElementById('password');

const handleToggle = () => {
    if (private.checked){
        showInPrivate.style.display = 'block';
        password.setAttribute('required','');
        password.setAttribute('name','password');
    }else{
        showInPrivate.style.display = 'none';
        password.removeAttribute('required');
        password.removeAttribute('name');
    }
}

private.onchange = () => {
   handleToggle();
}

public.onchange = () => {
    handleToggle();
 }

const globalrooms = document.getElementsByClassName('globalRoom');

for (let i = 0;i<globalrooms.length;i++){
    globalrooms[i].onclick = (e) => {
        let url = '\chat.html?username=';
        const roomname = e.target.innerText;
        console.log(roomname);
        url += username + '&room=' + roomname;
        window.location.href = url;
    }
}