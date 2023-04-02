socket = io();

document.getElementById("form-join-room").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const room = document.getElementById("room").value;
  console.log(name, value);
});
