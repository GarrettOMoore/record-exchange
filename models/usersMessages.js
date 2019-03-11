'use strict';
module.exports = (sequelize, DataTypes) => {
  const usersMessages = sequelize.define('usersMessages', {
    sendUserId: DataTypes.INTEGER,
    recievedUserId: DataTypes.INTEGER
  }, {});
  usersMessages.associate = function(models) {
    // associations can be defined here
  };
  return usersMessages;
};