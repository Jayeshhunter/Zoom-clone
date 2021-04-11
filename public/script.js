const socket = io("/");

const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",
});
const videoGrid = document.getElementById("video-grid");
const videoPlay = document.getElementById("video-play");
const peers = {};
const form = document.querySelector("form");
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // console.log(stream);
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        console.log("user stream", userVideoStream);
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (message, room, user) => {
      console.log(user);
      videoGrid.innerHTML += `<div id="message">${message}</div><br>`;
      connectToNewUser(user, stream);
    });
  });
myPeer.on("open", (id) => {
  socket.emit("join-room", room_id, id);
});
const scre = document.createElement("video");
function screenSh() {
  startCapture();
}
var displayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: false,
};
async function startCapture() {
  try {
    scre.srcObject = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    scre.addEventListener("loadedmetadata", () => {
      scre.play();
    });

    videoPlay.append(scre);
  } catch (err) {
    console.log("Error: " + err);
  }
}

function stopCapture() {
  console.log("object");
  let enabled = scre.srcObject.getTracks();
  enabled.forEach((track) => track.stop());
  scre.srcObject = null;
  // scre.remove();
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoPlay.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  console.log("user", userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // console.log(form.file.value);
  const message = form.message.value;

  videoGrid.innerHTML += `<div style="color:white;margin-bottom:5px;background-color: rgba(129, 116, 116, 0.87);border-radius:5px;padding:7px;" id="message">${message}</div><br>`;
  socket.emit("message", message);
  form.message.value = "";
});
function scrollDown() {
  window.scrollTo(0, document.body.scrollHeight);
}
function leaveVid() {
  location.assign("/end/" + room_id);
}

socket.on("sending", (msg) => {
  videoGrid.innerHTML += `<div id="message" style="color:white;margin-bottom:5px;background-color: rgb(194, 181, 181);border-radius:5px;padding:7px;">${msg}</div><br>`;
});

socket.on("user-disconnected", (val) => {
  //   console.log(val);
  videoGrid.innerHTML += `<div id="message">${val} disconnected</div><br>`;
  if (peers[val]) peers[val].close();
});
