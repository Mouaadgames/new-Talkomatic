if (document.cookie.indexOf("authCookie=") === -1) {
  window.location.replace("/");
}
const token = document.cookie.substring(document.cookie.indexOf("authCookie=") + "authCookie=".length, document.cookie.indexOf("authCookie=") + "authCookie=".length + 32 * 2)
console.log(token);
if (!token) {
  window.location.replace("/");
}
let username = document.cookie.substring(document.cookie.indexOf("name=") + "name=".length)
if (username.indexOf(";") !== -1) {
  username = username.substring(0, username.indexOf(";"))
}
document.getElementById("name").innerText = username


/* template
    <div class="room">
      <div class="room_header">
        <p>room Title</p>
        <button>enter</button>
      </div>
      <ol>
        <li><span class="c">1</span>user 1</li>
        <li><span class="c">2</span>user 2</li>
        <li><span class="c">3</span>user 3</li>
        <li><span class="c">4</span>user 4</li>
      </ol>
    </div>
*/

const holder = document.querySelector("main")
async function setRoomsToThePage() {
  let rooms = await fetch("/rooms")
  rooms = await rooms.json()
  rooms.forEach(room => {
    const roomDiv = document.createElement("div")
    roomDiv.classList.add("room")
    const room_header = document.createElement("div")
    room_header.classList.add("room_header")
    const title = document.createElement("p")
    title.innerText = room.name
    const enter = document.createElement("button")
    const a = document.createElement("a")
    a.innerText = "enter"
    a.href = "/room.html?id=" + room.id
    enter.append(a)
    room_header.append(title, enter)
    roomDiv.append(room_header)
    const ol = document.createElement("ol")
    room.users.forEach((user, i) => {
      const li = document.createElement("li")
      const span = document.createElement("span")
      span.classList.add("c")
      span.innerText = i + 1
      li.append(span, user.name)
      ol.append(li)
    })
    roomDiv.append(ol)
    holder.append(roomDiv)
  })
}

setRoomsToThePage().then(() => { }).catch((e) => { console.log(e) })
