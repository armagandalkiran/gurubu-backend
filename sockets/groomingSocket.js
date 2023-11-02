const { updateUserSocket, userLeave } = require("../utils/users");
const { getGrooming, leaveUserFromGrooming } = require("../utils/groomings");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("joinRoom", ({ nickname, roomID, lobby }) => {
      socket.join(roomID);

      const isDuplicate = updateUserSocket(lobby.credentials, socket.id);

      socket.emit("welcomeMessage", `${nickname} welcome to the Gurubu!`);
      io.emit("initialize", getGrooming(roomID));
      if (!isDuplicate) {
        socket.broadcast
          .to(roomID)
          .emit("welcomeMessage", `${nickname} joined BOOM !`);
      }
    });

    socket.on("userVote", (data) => {});

    socket.on("disconnect", () => {
      const roomID = leaveUserFromGrooming(socket.id);
      const isUserPermanentlyLeave = userLeave(socket.id);

      if (isUserPermanentlyLeave) {
        socket.broadcast
          .to(roomID)
          .emit("userDisconnected", getGrooming(roomID));
      }
      console.log("A user disconnected");
    });
  });
};
