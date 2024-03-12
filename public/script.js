if (document.cookie.indexOf("authCookie=") === -1) {
  window.location.replace("/");
}
const token = document.cookie.substring(document.cookie.indexOf("authCookie=") + "authCookie=".length, document.cookie.indexOf("authCookie=") + "authCookie=".length + 32 * 2)
console.log(token);
if (!token) {
  window.location.replace("/");
}

const user1 = document.getElementById("user1");
const user2 = document.getElementById("user2");
const user3 = document.getElementById("user3");
const user4 = document.getElementById("user4");
const user5 = document.getElementById("user5");

const users = [user1, user2, user3, user4, user5];

const socket = new WebSocket("ws://localhost:3000");

// Connection opened
socket.addEventListener("open", (event) => {
  socket.send(JSON.stringify({ id: token, roomId: window.location.search.substring(4) }));
});

// Listen for messages
socket.addEventListener("message", (event) => {
  if (event.data === "no_user") {
    window.location.replace("/")
  }
  if (event.data === "no_room") {
    window.location.replace("/lobby.html")
  }
  // what to expect from server
  /* will include only those with are changed
  {
    userId:string
    message: string,
  }
  */
  console.log("Message from server ", typeof(event.data)," - ", event.data);
  const data = JSON.parse(event.data);
  users.forEach((user, i) => {
    if (data.col !== i) {
      user.
    }
  })
  data.col
});

socket.addEventListener("updateMsg", (event) => {
  console.log("updateMsg : ",event.data)
  users[event.data.userCol].innerText = event.data.message
})  

userTextField = document.getElementById("userTextField");
userTextField.addEventListener("input", onTextChange)
let isRecentlySent = false
let stale = false
let msg = ""
setInterval(() => {
  if (stale) {
    socket.send(JSON.stringify({
      token,
      roomId: window.location.search.substring(4),
      message: msg
    }));
    stale = false
  }
}, 1000);
function onTextChange(e) {
  msg = e.target.value
  if (isRecentlySent) {
    stale = true
    return
  }
  stale = false
  isRecentlySent = true
  setTimeout(() => {
    isRecentlySent = false
  }, 1000)
  socket.send(JSON.stringify({
    token,
    roomId: window.location.search.substring(4),
    message: msg
  }));
}
