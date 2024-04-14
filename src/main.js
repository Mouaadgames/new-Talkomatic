const socket = io("ws://localhost:3000");

/**
 * connect get first data that already exit 
 * make an event to receive all changes for the broadcast
 * send changes that user make in this from [["<pos>","<action>","<data>"],...]
 */

let usersData = [{
  name: "",
  inputField: "",
  isYou: false
}, {
  name: "",
  inputField: "",
  isYou: false
}, {
  name: "",
  inputField: "",
  isYou: false
}, {
  name: "",
  inputField: "",
  isYou: false
}, {
  name: "",
  inputField: "",
  isYou: false
},]
//is user logged in
if (document.cookie.indexOf("authCookie=") === -1) {
  window.location.replace("/");
}
const token = document.cookie.substring(document.cookie.indexOf("authCookie=") + "authCookie=".length, document.cookie.indexOf("authCookie=") + "authCookie=".length + 32 * 2)

const user1 = document.getElementById("user1");
const user2 = document.getElementById("user2");
const user3 = document.getElementById("user3");
const user4 = document.getElementById("user4");
const user5 = document.getElementById("user5");

const users = [user1, user2, user3, user4, user5];


const userName1 = document.getElementById("userName1");
const userName2 = document.getElementById("userName2");
const userName3 = document.getElementById("userName3");
const userName4 = document.getElementById("userName4");
const userName5 = document.getElementById("userName5");

const userNames = [userName1, userName2, userName3, userName4, userName5];
async function main() {

  // const { isValid } = ((await fetch("/validate")).json())
  // if (!isValid) {
  //   window.location.replace("/");
  // }


  // Connection opened
  // send {token:token,roomId:id} -> 
  socket.on("connect", (event) => {
    socket.emit("init", {
      token: token,
      roomId: window.location.search.substring(4)
    });
  });

  //init req
  /**
   * data:{
   *  roomName:"",
   *  names : [username1,username2,...]
   *  initData: ["<user1>","<user2>","<user3>","<user4>","<user5>"],
   *  currentUserIndex: Number
   * }
   */

  socket.on("init", (event) => {
    console.log("init", event)
    usersData.forEach((user, i) => {
      user.name = event.names[i] || "<empty>"
      user.inputField = event.initData[i] || ""
    })
    users.forEach((user, i) => {
      // set user text in the place and define names
      user.value = event.initData[i] || ""
      console.log(user);
      if (event.currentIndex == i) {
        usersData[i].isYou = true
        user.disabled = false
        user.addEventListener("input", onTextChange)
      }
      userNames[i].innerText = event.names[i] || "<empty>"
    })
    document.getElementById("roomName").innerText = event.roomName
  })

  socket.on("message", (event) => {
    console.log("msg", event);
    if (event === "no_user")
      return window.location.replace("/")
    if (event === "no_room")
      return window.location.replace("/lobby.html")
    if (event === "full_room") {
      return window.location.replace("/lobby.html?a=Full_room")
    }
  })

  socket.on("updateMsgs", (data) => {
    //this is for only one single user 
    // To do[optimization] : make it for all users updates at the same time
    /**
     * data:{
     *  userCol:Number
     *  msg:the user changes that he send [[<pos>,"<action>","<data>"]...]
     * }
     */

    // get rid of edge cases
    console.log("update msg", data);
    if (!data) return

    console.log("Message from server - ", data);

    // To Do : we might consider adding sequence number to the message the check if this is the correct message change that we want to apply some thing like how ping command dose it  
    usersData[data.userCol].inputField = applyInstructionsToTheText(
      data.msg,
      usersData[data.userCol].inputField)

    updateUserField()
  })



  socket.on("newUser", (event) => {
    /**
     * {
     *  index:Number
     *  name:""
     * }
    */
    usersData[event.index].name = event.name
    console.log("newUser : ", event)
    updateUserField()
  });

  socket.on("userLeft", (event) => {
    /**
     * {
     *  index:Number
     * }
    */
    usersData = usersData.filter((_, i) => i !== event.index) // remove the user that left
    usersData.push({ name: "<empty>", inputField: "", isYou: false })
    console.log("usersData : ", usersData);
    updateUserField()
    console.log("userLeft : ", event)
  });
}

function onTextChange(e) {
  const currentText = e.target.value
  // use patience diff to check the difference
  for (let j = 0; j < usersData.length; j++) {
    const user = usersData[j];
    if (user.isYou) {
      user.inputField = currentText
      break
    }
  }
  checkIfSendIsAvailable(currentText)
}
function applyInstructionsToTheText(instruction, originalText) {
  let text = originalText
  let deletedLetters = 0
  instruction.forEach(c => {
    if (c[1] === "a") {
      text = text.slice(0, c[0] - deletedLetters) + c[2] + text.slice(c[0] - deletedLetters)
    }
    if (c[1] === "d") {

      text = text.slice(0, c[0] - deletedLetters) + text.slice(c[0] + c[2] - deletedLetters)
      deletedLetters += c[2]
    }
  })
  return text
}

function transformToInstructions(pevText, newText) {
  const diff = patienceDiff(pevText, newText).lines.map((c, i) => ({ i, ...c }))
  let inst = []
  let instructionStackLength = 0 // for the lack of a better name
  for (let i = 0; i < diff.length; i++) {
    const charLine = diff[i];
    // check if the last inst hav an indx one less and the same instruction as the if statment
    if (charLine.aIndex === -1) {
      if (inst.length &&
        inst[inst.length - 1][1] === "a" &&
        inst[inst.length - 1][0] === charLine.i - 1 - instructionStackLength
      ) {
        instructionStackLength++
        inst[inst.length - 1][2] += charLine.line
        continue
      }
      instructionStackLength = 0
      inst.push([charLine.i, "a", charLine.line])
      continue
    }
    if (charLine.bIndex === -1) {
      if (inst.length &&
        inst[inst.length - 1][1] === "d" &&
        inst[inst.length - 1][0] === charLine.i - 1 - instructionStackLength
      ) {
        instructionStackLength++
        inst[inst.length - 1][2]++
        continue
      }
      instructionStackLength = 0
      inst.push([charLine.i, "d", 1])
    }
  }
  // instruction [[<pos>,"<action>","<data>"],[3,"a","v"],[4,"d",3]...]
  return inst
}

function updateUserField() {
  usersData.forEach((u, i) => {
    users[i].value = u.inputField
    userNames[i].innerText = u.name
    users[i].disabled = !u.isYou
    users[i].removeEventListener("input", onTextChange)
    if (u.isYou) {
      users[i].addEventListener("input", onTextChange)
    }
  })
}

let lastSendText = ''

const keyStrokeLimit = 10
let keyStrokes = 0

const sendThroughRate = 2000 // 2s
let lastTimeSend = Date.now()

let timeoutRef = null
function checkIfSendIsAvailable(currentText) {
  keyStrokes++
  if (Date.now() - lastTimeSend < sendThroughRate && keyStrokes < keyStrokeLimit) {
    timeoutRef && clearTimeout(timeoutRef)
    timeoutRef = setTimeout(() => {
      checkIfSendIsAvailable(currentText)
    }, sendThroughRate - (Date.now() - lastTimeSend))
    return
  }

  lastTimeSend = Date.now()
  keyStrokes = 0
  if (currentText === lastSendText) {
    return
  }

  socket.emit("updateMsg",
    transformToInstructions(lastSendText, currentText)
  )
  lastSendText = currentText
}


main()