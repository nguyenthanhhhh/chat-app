let userList = [
  {
    id: "1",
    name: "ADMIN",
    room: "Room 1",
  },
  {
    id: "2",
    name: "ADMIN",
    room: "Room 2",
  },
];

const addUser = (user) => (userList = [...userList, user]);

const removeUser = (userId) => {
  const index = userList.findIndex((item) => item.id === userId);
  console.log(index);
  if (index !== -1) userList.splice(index, 1);
};

const getUserList = (room) => userList.filter((user) => user.room === room);

const findUser = (id) => userList.find((user) => user.id === id);

module.exports = { getUserList, addUser, removeUser, findUser };
