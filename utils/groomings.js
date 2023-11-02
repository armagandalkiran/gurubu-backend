const uuid = require("uuid");
const { userJoin, getCurrentUser } = require("../utils/users");

const rooms = [];
const groomings = {};

const generateNewRoom = (nickName) => {
  const currentTime = new Date().getTime();
  const expireTime = currentTime + 3 * 60 * 60 * 1000;
  const roomID = uuid.v4();

  const user = userJoin(nickName, roomID);

  const newRoom = {
    roomID,
    createdAt: currentTime,
    expiredAt: expireTime,
  };

  groomings[roomID] = {
    totalParticipants: 1,
    mode: "0",
    participants: { [user.userID]: user },
    metrics: [
      {
        id: 1,
        name: "storyPoint",
        points: ["1", "2", "3", "5", "8", "13", "21", "?"],
      },
      {
        id: 2,
        name: "test",
        points: ["1", "2", "3", "5", "8", "13", "21", "?"],
      },
      {
        id: 3,
        name: "test2",
        points: ["1", "2", "3", "5", "8", "13", "21", "?"],
      },
      {
        id: 4,
        name: "test3",
        points: ["1", "2", "3", "5", "8", "13", "21", "?"],
      },
      {
        id: 5,
        name: "test4",
        points: ["1", "2", "3", "5", "8", "13", "21", "?"],
      },
      {
        id: 6,
        name: "test5",
        points: ["1", "2", "3", "5", "8", "13", "21", "?"],
      },
    ],
    score: 0,
    status: "ongoing",
  };

  rooms.push(newRoom);

  return { ...newRoom, userID: user.userID, credentials: user.credentials };
};

const handleJoinRoom = (nickName, roomID) => {
  const user = userJoin(nickName, roomID);

  groomings[roomID] = {
    ...groomings[roomID],
    totalParticipants: user.userID + 1,
  };

  groomings[roomID].participants[user.userID] = user;

  const room = rooms.find((room) => room.roomID === roomID);

  return { ...room, userID: user.userID, credentials: user.credentials };
};

const leaveUserFromGrooming = (socketID) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }
  const userLobbyData = groomings[user.roomID].participants[user.userID];

  if (!user.sockets.length) {
    groomings[user.roomID].participants[user.userID] = {
      ...userLobbyData,
      connected: false,
    };
  }
  return user.roomID;
};

const getGrooming = (roomID) => {
  return groomings[roomID];
};

const getRooms = () => {
  return rooms;
};

const checkRoomExistance = (roomId) => {
  return rooms.some((room) => room.roomID === roomId);
};

module.exports = {
  checkRoomExistance,
  generateNewRoom,
  getRooms,
  handleJoinRoom,
  getGrooming,
  leaveUserFromGrooming,
};
