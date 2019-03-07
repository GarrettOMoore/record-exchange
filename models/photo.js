'use strict';
module.exports = (sequelize, DataTypes) => {
  const photo = sequelize.define('photo', {
    link: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  photo.associate = function(models) {
    // associations can be defined here
    models.photo.belongsTo(models.user);
  };
  return photo;
};