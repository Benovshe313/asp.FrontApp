const url="https://localhost:7149/";
var currentRoom = "";
var currentUser = "";
var room = document.querySelector("#room");
var rooms = document.querySelector("#rooms");
var element = document.querySelector("#offerValue");
var button = document.querySelector("#offerBtn");
var exit = document.querySelector("#leaveBtn");

const connection = new signalR.HubConnectionBuilder()
    .withUrl(url+"offers")
    .configureLogging(signalR.LogLevel.Information)
    .build();

async function start(){
    try {
        await connection.start();
        $.get(url + "api/Offer/Room?room="+currentRoom,function(data,status){
            element.innerHTML = "Begin price : " + data + "$";
        })

        console.log("SignalR Started");
    } catch (err) {
        console.log(err);
        setTimeout(() => {
            start();
        }, 5000);
    }
}

async function JoinRoom(roomName){
    currentRoom = roomName;
    room.style.display = "block";
    await start();
    currentUser = document.querySelector("#user").value;
      
    await connection.invoke("JoinRoom",currentRoom,currentUser);

    rooms.style.display = "none";
    exit.style.display = "block";
}

async function LeaveRoom(){
    if(currentRoom){
        await connection.invoke("LeaveRoom",currentRoom,currentUser);
    }
    
    room.style.display = "none"; 
    rooms.style.display = "block";

    exit.style.display = "none";
    currentRoom = "";
}

connection.on("ReceiveJoinInfo",(message)=>{
    let infoUser = document.querySelector("#info");
    infoUser.innerHTML = message + " connected to room";
})
connection.on("ReceiveLeaveInfo",(message)=>{
    let infoUser = document.querySelector("#info");
    infoUser.innerHTML = message + " left room";
})

connection.on("ReceiveFullRoomInfo",(message)=>{
    let infoUser = document.querySelector("#info");
    infoUser.innerHTML = "Room is full";
    button.style.display = "none";
})

async function IncreaseOffer(){
    const user = document.querySelector("#user");

    $.get(url + `api/Offer/IncreaseRoom?room=${currentRoom}&data=1000`,
        function(data,status){
            $.get(url+"api/Offer/Room?room="+currentRoom,
                async function(data,status){
                    var element2 = document.querySelector("#offerValue2");
                    element2.innerHTML = data;

                    await connection.invoke("SendMessageRoom",currentRoom,user.value);
                }
            )
        })
}

connection.on("ReceiveInfoRoom",(user,data)=>{
    var element2 = document.querySelector("#offerValue2");
    element2.innerHTML = user + ` offer this price ${data}$`;
});