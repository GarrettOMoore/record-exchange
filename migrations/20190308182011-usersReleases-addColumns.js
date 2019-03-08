'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('usersReleases', 'isTradeable', Sequelize.BOOLEAN)
    .then(function(){
      queryInterface.addColumn('usersReleases', 'comment', Sequelize.TEXT)
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('usersReleases', 'isTradeable')
      .then(function() {
        queryInterface.removeColumn('usersReleases', 'comment')
    })
  }
};
