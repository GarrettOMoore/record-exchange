'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    sendUserId: DataTypes.INTEGER,
    recievedUserId: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {});
  message.associate = function(models) {
    // associations can be defined here
    models.message.belongsToMany(models.user, {through: "usersMessages"});
  };
  return message;
};