'use strict';
module.exports = (sequelize, DataTypes) => {
  const usersReleases = sequelize.define('usersReleases', {
    userId: DataTypes.INTEGER,
    releaseId: DataTypes.INTEGER,
    isTradeable: DataTypes.BOOLEAN,
    comment: DataTypes.TEXT
  }, {});
  usersReleases.associate = function(models) {
    // associations can be defined here
  };
  return usersReleases;
};