const uuid = require("uuid");
const { userJoin, getCurrentUser } = require("../utils/users");

const groomingMode = {
  0: [
    {
      id: 1,
      name: "storyPoint",
      points: ["1", "2", "3", "5", "8", "13", "21", "?"],
    },
  ],
  1: [
    {
      id: 1,
      name: "developmentEase",
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 2,
      name: "customerEffect",
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 3,
      name: "performance",
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 4,
      name: "security",
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 5,
      name: "maintanance",
      points: ["1", "2", "3", "4", "5", "?"],
    },
    {
      id: 6,
      name: "storyPoint",
      points: ["1", "2", "3", "5", "8", "13", "21", "?"],
    },
  ],
};

const rooms = [];
const groomings = {};

const generateNewRoom = (nickName, groomingType) => {
  const currentTime = new Date().getTime();
  const expireTime = currentTime + 3 * 60 * 60 * 1000;
  const roomID = uuid.v4();

  const user = userJoin(nickName, roomID);

  const newRoom = {
    roomID,
    createdAt: currentTime,
    expiredAt: expireTime,
  };

  user.isAdmin = true;

  groomings[roomID] = {
    totalParticipants: 1,
    mode: groomingType,
    participants: { [user.userID]: user },
    metrics: groomingMode[groomingType],
    score: 0,
    status: "ongoing",
    isResultShown: false,
  };

  rooms.push(newRoom);

  return {
    ...newRoom,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
};

const handleJoinRoom = (nickName, roomID) => {
  const user = userJoin(nickName, roomID);

  user.isAdmin = false;

  groomings[roomID] = {
    ...groomings[roomID],
    totalParticipants: user.userID + 1,
  };

  groomings[roomID].participants[user.userID] = user;

  const room = rooms.find((room) => room.roomID === roomID);

  return {
    ...room,
    userID: user.userID,
    credentials: user.credentials,
    isAdmin: user.isAdmin,
  };
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

const updateParticipantsVote = (socketID, data) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }
  const userLobbyData = groomings[user.roomID].participants[user.userID];

  groomings[user.roomID].participants[user.userID] = {
    ...userLobbyData,
    votes: data,
  };

  groomings[user.roomID].score = calculateScore(
    groomings[user.roomID].mode,
    groomings[user.roomID].participants
  );

  return groomings[user.roomID];
};

const getGrooming = (roomID) => {
  return groomings[roomID];
};

const calculateScore = (mode, participants) => {
  if (mode === "0") {
    let totalVoter = 0;
    let totalStoryPoint = 0;
    Object.keys(participants).forEach((participantKey) => {
      if (participants[participantKey].votes) {
        const storyPoint = Number(
          participants[participantKey].votes.storyPoint
        );
        if (storyPoint) {
          totalVoter++;
          totalStoryPoint += storyPoint;
        }
      }
    });

    return findClosestFibonacci(totalStoryPoint / totalVoter);
  }

  if (mode === "1") {
  }
};

const getResults = (socketID) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }

  groomings[user.roomID].isResultShown = true;

  return groomings[user.roomID];
};

const resetVotes = (socketID) => {
  const user = getCurrentUser(socketID);
  if (!user) {
    return;
  }

  groomings[user.roomID].isResultShown = false;
  groomings[user.roomID].score = 0;

  Object.keys(groomings[user.roomID].participants).forEach((participantKey) => {
    if (groomings[user.roomID].participants[participantKey].votes) {
      groomings[user.roomID].participants[participantKey].votes = {};
    }
  });

  return groomings[user.roomID];
};

const getRooms = () => {
  return rooms;
};

const checkRoomExistance = (roomId) => {
  return rooms.some((room) => room.roomID === roomId);
};

function findClosestFibonacci(number) {
  if (number <= 0) {
    return 0;
  }

  let prevFibonacci = 0;
  let currentFibonacci = 1;

  while (currentFibonacci <= number) {
    const nextFibonacci = prevFibonacci + currentFibonacci;
    prevFibonacci = currentFibonacci;
    currentFibonacci = nextFibonacci;
  }

  if (Math.abs(number - prevFibonacci) <= Math.abs(number - currentFibonacci)) {
    return prevFibonacci;
  } else {
    return currentFibonacci;
  }
}

module.exports = {
  checkRoomExistance,
  generateNewRoom,
  getRooms,
  handleJoinRoom,
  getGrooming,
  leaveUserFromGrooming,
  updateParticipantsVote,
  getResults,
  resetVotes,
};
