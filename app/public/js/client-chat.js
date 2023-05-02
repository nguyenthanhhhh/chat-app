const userNameChat = "{{name}}";

const renderMessage = (message) => {
  const html = `
        <div class="message-item" id="message-item">
            <div class="message__row1">
              <p class="message__name">${userNameChat}</p>
              <p class="message__date">${message.message.createdAt}</p>
            </div>
            <div class="message__row2">
              <p class="message__content">
                ${message.message.message}
              </p>
            </div>
          </div>
    `;
  return html;
};

const socket = io();
let html = ``;

const token = document.cookie;
const userInfoStr = decodeURIComponent(token.split(";")[1].split("=")[1]);
const userInfo = JSON.parse(userInfoStr.replace("j:", ""));
const { userName, email } = userInfo;

const formMessage = document.getElementById("form-message");

// xử lý query string (thư viện)
const queryString = location.search;
const params = Qs.parse(queryString, {
  ignoreQueryPrefix: true,
});
const name = "{{{name}}}";
const room = "{{room}}";
//Xử lý tin nhắn mặc định
socket.on("default-message", (data) => {
  html += renderMessage(data);
  document.getElementById("message-block").innerHTML = html;
});

//join room
socket.emit("client join room", { name, room });

//xử lý lời chào room
socket.on("welcome to room", (message) => {
  html += renderMessage(message);
  document.getElementById("message-block").innerHTML = html;
});

//hiển thị danh sách người chat:
socket.on("server send user list", (data) => {
  let userListHtml = ``;
  data.forEach((ele) => {
    userListHtml += `<li>${ele.name}</li>`;
  });
  document.getElementById("list-user").innerHTML = userListHtml;
});

//gửi tin nhắn lên server
formMessage.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputMessage = document.getElementById("input-message");

  //kiểm tra trạng thái tin nhắn
  const acknowledgements = () => {
    // console.log("Gửi tin nhắn thành công");s
  };

  //gửi dữ tin nhắn lên server
  const message = inputMessage.value;
  if (message.trim().length !== 0) {
    socket.emit(
      "send-message-to-server",
      { userName, message: inputMessage.value },
      acknowledgements
    );
  }

  inputMessage.value = "";
});

const messages = document.getElementById("messages");

//Xử lý tin nhắn chat
socket.on("server-send-message-to-client", (data) => {
  html += renderMessage(data);
  document.getElementById("message-block").innerHTML = html;
  // const chatItem = document.createElement("li");
  // console.log(data);
  // chatItem.textContent = `${data.name}: ${data.message.message}`;
  // messages.appendChild(chatItem);
  // console.log(data);
});

//Gửi vĩ độ, kink độ lên server
const btnShareLocation = document.getElementById("btn-share-location");
btnShareLocation.addEventListener("click", (e) => {
  if (!navigator.geolocation) return alert("Trình duyệt của bạn không hỗ trợ");
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    const { latitude, longitude } = position.coords;
    console.log(latitude, longitude);
    socket.emit("share-location", { latitude, longitude });
  });
});

//xử lý share location:
socket.on("server-send-location-to-client", (data) => {
  // const chatItem2 = document.createElement("li");
  html += `
        <div class="message-item" id="message-item">
            <div class="message__row1">
              <p class="message__name">${data.name}</p>
              <p class="message__date">${data.message.createdAt}</p>
            </div>
            <div class="message__row2">
              <a href = "${data.message.message}" target = "_blank" class="message__content">
               Vị trí của tôi
              </a>
            </div>
          </div>
    `;

  document.getElementById("message-block").innerHTML = html;

  // const chatItem = document.createElement("li");
  // const chatLink = document.createElement("a");
  // chatLink.href = data.message.message;
  // chatLink.textContent = ` Vị trí của tôi`;
  // chatLink.target = "_blank";
  // chatItem.textContent = `${data.name}: `;

  // chatItem.appendChild(chatLink);
  // // chatItem2.appendChild(chatItem)
  // messages.appendChild(chatItem);
});
