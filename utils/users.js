const uuid = require("uuid");
const { tokenizeNickname } = require("../utils/tokenizeNickname");

const users = [];

// Join user to grooming room
function userJoin(nickname, roomID) {
  const defaultUserID = 0;
  const totalUsersNumber = getRoomUsers(roomID).length;

  const userID = totalUsersNumber > 0 ? totalUsersNumber : defaultUserID;
  const credentials = tokenizeNickname(`${nickname}${uuid.v4()}`);

  const sockets = [];

  const user = {
    userID,
    credentials,
    nickname,
    roomID,
    sockets,
  };

  users.push(user);

  return user;
}

function updateUserSocket(credentials, socketID) {
  let isDuplicate = false;
  const user = users.find((user) => user.credentials === credentials);
  if (!user) {
    return;
  }
  if (user.sockets.length) {
    isDuplicate = true;
  }

  user.connected = true;
  user.sockets.push(socketID);

  return isDuplicate;
}

// Get current user
function getCurrentUser(socketID) {
  return users.find((user) => user.sockets.includes(socketID));
}

// User leaves grooming room
function userLeave(socketID) {
  const user = getCurrentUser(socketID);

  if (!user) {
    return;
  }

  const index = user.sockets.findIndex(
    (userSocketID) => userSocketID === socketID
  );

  if (index !== -1) {
    return user.sockets.splice(index, 1)[0];
  }

  return Boolean(user.sockets.length);
}

// Get room users
function getRoomUsers(roomID) {
  return users.filter((user) => user.roomID === roomID);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  updateUserSocket,
};
