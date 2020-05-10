
var getUserList = async function(){
	return await fetch(
      `${HTTP_URL}/users/all`,
      {
        method: 'get'
      }
    ).then(res=> res.json()).then((data) => {
      console.log('data', data.data);
      return data.data
    }).catch(err => {
      console.log(err)
    })
}

var chooseReceiver = function(event, receiverName, receiverID){
	console.log($('.companionWindow'))
	$('.companionName').text(receiverName);
	$('.companionWindow').show()
	$('.emptyCompanionWindow').hide()
	window.localStorage.setItem('receiverName', receiverName);
	window.localStorage.setItem('rid', receiverID);
}

var startCall = function(){
	$('.userBox').hide()
	$('.camerabox').show()
}

var renderUserList = async function(){
	var curUser = window.localStorage.getItem('name');
	$('.userList').empty();
	await getUserList().then((userList) => {
	    userList.forEach( user => {
	    	if (user.name === curUser){
	    		window.localStorage.setItem('cid', user.uid);
	    		return
	    	}
	    	var userItem = document.createElement("div");
	    	userItem.classList.add("cardWrapper");
	    	userItem.innerHTML = user.name;
	    	var userStatus = document.createElement("div");
	    	if (user.online) {
	    		userStatus.classList.add("online");
	    	} else {
	    		userStatus.classList.add("offline");
	    	}
	    	userItem.appendChild(userStatus);
	    	userItem.addEventListener("click", (e) => {chooseReceiver(e, user.name, user.uid)})
	    	$('.userList').append(userItem);
	    	
	    })
	})
}

var getHistory = async function(){
	return await fetch(
      `${HTTP_URL}/calls/history`,
      {
        method: 'get',
        body: JSON.stringify({ uid: window.localStorage.getItem('cid') })
      }
    ).then(res=> res.json()).then((data) => {
      console.log('data', data);
      data.data.forEach(item => {
      	return item.start_time
      })
    }).catch(err => {
      console.log(err)
    })
}

var renderhistory = async function(){
	pass
}


$(document).ready(function(){
	var curUser = window.localStorage.getItem('name');
	if (!curUser) {
		$(location).attr('href', './auth.html')
		return
	}
	renderUserList();
	$('.companionWindow').hide();
	$('.camerabox').hide();
	let timerId = setInterval(renderUserList, 10000);
	$('.UserName').text(curUser)
})