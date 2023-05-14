"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sport.belongsTo(models.Player, {
        foreignKey: "userId",
      });
      // define association here
    }

    static getSports() {
      return this.findAll();
    }

    static createSport({ name, userId }) {
      return this.create({
        name,
        userId,
      });
    }
  }
  Sport.init(
    {
      name: DataTypes.STRING,
      userId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Sport",
    }
  );
  return Sport;
};
