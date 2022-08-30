const { Sequelize, Model, DataTypes } = require("sequelize");

// variable sequelize con la inicializacion de las credenciales de la bd de heroku
const sequelize = new Sequelize({
    database: "d45uis4euhf5ut",
    username: "yrneaunylhohcp",
    password: "7d8c51321d2d9845683b53f6e96483e075333c2e3e49e5ce3b3993e1c91ef8c2",
    host: "ec2-54-208-104-27.compute-1.amazonaws.com",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true, // This will help you. But you will see nwe error
            rejectUnauthorized: false, // This line will fix new error
        },
    },
});

/**
 * Modelo tabla users_serial
 */
const User = sequelize.define(
    "users_serial", {
        name: DataTypes.STRING,
        lastname: DataTypes.STRING,
        id_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    }, { tableName: "users_serial", schema: "public", timestamps: false }
);

/**
 * Modelo tabla bots
 */
const Bots = sequelize.define(
    "bots", {
        token: DataTypes.STRING,
        id_user: DataTypes.INTEGER,
    }, { tableName: "bots", schema: "public", timestamps: false }
);

/**
 * Modelo tabla functions
 */
const Functions = sequelize.define(
    "functions", {
        name_function: DataTypes.STRING,
        id_user: DataTypes.INTEGER,
    }, { tableName: "functions", schema: "public", timestamps: false }
);

/**
 * Modelo tabla bots_functions
 * TO DO, ver como se hace esta vaina pq no me dio
 * Es una tabla vista de muchas fk
 */
const BotsFunctions = sequelize.define(
    "bots_functions", {
        fk_id_bot: DataTypes.INTEGER,
        fk_id_function: DataTypes.INTEGER,
    }, { tableName: "bots_functions", schema: "public", timestamps: false }
);

// makes a join table between the users and projects
// 'through' key sets the name of the table: user_projects
Functions.belongsToMany(Bots, {
    through: BotsFunctions,
    foreignKey: "id_function",
});
Bots.belongsToMany(Functions, { through: BotsFunctions, foreignKey: "id_bot" });

module.exports = { User, Bots, Functions, BotsFunctions };