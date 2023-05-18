"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Session.belongsTo(models.Sport, {
        foreignKey: "sportId",
      });
    }
  }
  Session.init(
    {
      time: DataTypes.DATE,
      venue: DataTypes.STRING,
      participants: DataTypes.ARRAY(DataTypes.STRING),
      playersNeeded: DataTypes.INTEGER,
      sportId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Session",
    }
  );
  return Session;
};
