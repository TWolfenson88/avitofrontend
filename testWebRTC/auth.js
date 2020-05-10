var logIn = async function () {
	var username=$('#LoginUsername').val();
	var password = $('#LoginPassword').val();
	console.log(username, password)
    return await fetch(
      `${HTTP_URL}/users/login`,
      {
        method: 'post',
        body: JSON.stringify({ name: username, password: password })
      }
    ).then(res=> res.json()).then((data) => {
      console.log('data', data);
      window.localStorage.setItem('name', username);
      $(location).attr('href', './index.html')
    }).catch(err => {
      console.log(err)
    })
};
var register = function(){
	alert('register')
}

var showRegister = function() {
	$('#LoginForm').hide();
	$('#RegisterForm').show();
}

var showLogin = function() {
	$('#RegisterForm').hide();
	$('#LoginForm').show();
}

$(document).ready(function(){
	$('#loginButton').click(logIn);
    $('#register').click(showRegister);
    $('#login').click(showLogin);
    $('#RegisterForm').hide();
})