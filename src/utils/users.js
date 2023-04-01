const users = [];
let userDB = {};
//Add User
userDB.addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //Validation
  if (!username || !room) {
    return {
      error: "Username and room is required!",
    };
  }
  //check for user name
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  //validation for username

  if (existingUser) {
    return {
      error: "Username in use!!",
    };
  }
  //store username
  const user = { id, username, room };
  //   console.log(user);
  users.push(user);
  return { user };
};
//Remove User
userDB.removeUser = (id) => {
  // console.log(users);
  const index = users.findIndex((user) => user.id === id);
  // console.log(index);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
//Get User
userDB.getUser = (id) => {
  return users.find((user) => user.id === id);
};
//Get users in a room
userDB.getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = userDB;
