"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require(".");
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
      // define association here
    }
    static associate(models) {
      Session.belongsTo(models.Player, {
        foreignKey: "userId",
      });
    }
    static createSession({
      time,
      venue,
      participants,
      playersNeeded,
      sportId,
      userId,
    }) {
      return this.create({
        time,
        venue,
        participants,
        playersNeeded,
        sportId,
        userId,
      });
    }

    static removePlayer(participants, id) {
      return this.update(
        {
          participants,
        },
        {
          where: {
            id,
          },
        }
      );
    }

    static deleteSession(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static joinSession(participants, id) {
      return this.update(
        {
          participants,
        },
        {
          where: {
            id,
          },
        }
      );
    }

    static leaveSession(participants, id) {
      return this.update(
        {
          participants,
        },
        {
          where: {
            id,
          },
        }
      );
    }

    static getParticipant(userName) {
      const playerName = Session.participants.find(
        (player) => player.name === userName
      );
      return playerName ? null : userName;
    }

    static mySessions(userId){
      return this.findAll({
        where:{
          userId
        }
      })
    }

    static getAllSessions() {
      return this.findAll();
    }

    static getSessions(sportId) {
      return this.findAll({
        where: {
          sportId,
        },
      });
    }

    static runningSessions() {
      return this.findAll({
        where: {
          status: "running",
        },
      });
    }

    static cancelledSessions() {
      return this.findAll({
        where: {
          status: "cancelled",
        },
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
      status: DataTypes.STRING,
      reason: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Session",
    }
  );
  return Session;
};
