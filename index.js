
const url = "https://localhost:7055/";
const connection = new signalR.HubConnectionBuilder()
.withUrl(url + "offers")
.configureLogging(signalR.LogLevel.Information)
.build();

let countdownTimeout;
let firstUser = null;  
let noNewBidTimeout = null;      

async function start() {
    try {
        await connection.start();
        $.get(url + "api/Offer", function (data, status) {
            const element = document.querySelector("#offerValue");
            element.innerHTML = "Begin price : " + data + "$ ";
        });
        console.log("SignalR started");
    } catch (err) {
        console.log(err);
        setTimeout(() => {
            start();
        }, 5000);
    }
}
start();

connection.on("ReceiveMessage", (message, data) => {
    let element = document.querySelector("#responseOfferValue");
    let bidBtn = document.querySelector("#bidBtn");
    let user = document.querySelector("#user").value;

    element.innerHTML = message + data + "$";

    if (message === user + " 's Offer is ") {
        if (firstUser === null) {
            firstUser = user;  
            countDown(bidBtn, 10);   
        }
    } else {
        bidBtn.disabled = false;
        bidBtn.innerHTML = "Bid";

        if (countdownTimeout) {
            clearTimeout(countdownTimeout);
        }

        if (noNewBidTimeout) {
            clearTimeout(noNewBidTimeout);
            noNewBidTimeout = null;
        }
        firstUser = null;
    }
});

connection.on("ReceiveWinner",(nameOfWinner)=>{
    let winner = document.querySelector("#winner");
    winner.innerHTML = `${nameOfWinner} is win!`;
})

async function IncreaseOffer() {
    let user = document.querySelector("#user");

    $.get(url + "api/Offer/Increase?data=100", function (data, status) {
        $.get(url + "api/Offer", function (data, status) {
            connection.invoke("SendMessage", user.value, data);
        });
    });
}

async function countDown(button, count) {
    if (count === 0) {
        button.disabled = false;
        button.innerHTML = "Bid";
        if (firstUser) {
            connection.invoke("AnnounceWinner",firstUser);
        }
        return;
    }

    button.disabled = true;
    button.innerHTML = `Wait ${count} sec`;

    countdownTimeout = setTimeout(() => {
        countDown(button, count - 1);
    }, 1000);

    if (!noNewBidTimeout) {
        noNewBidTimeout = setTimeout(() => {
            if (firstUser) {
                connection.invoke("AnnounceWinner",firstUser);
            }
        }, 10000); 
    }
}
