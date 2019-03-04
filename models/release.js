'use strict';
module.exports = (sequelize, DataTypes) => {
  const release = sequelize.define('release', {
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    year: DataTypes.INTEGER,
    label: DataTypes.STRING,
    genre: DataTypes.STRING,
    imgUrl: DataTypes.STRING,
    format: DataTypes.STRING
  }, {});
  release.associate = function(models) {
    models.release.belongsToMany(models.user, {through: "usersReleases"});
  };
  return release;
};