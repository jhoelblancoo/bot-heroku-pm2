const {
    Sequelize,
    Model,
    DataTypes
} = require("sequelize");

// variable sequelize con la inicializacion de las credenciales de la bd de heroku
const sequelize = new Sequelize({
    database: "railway",
    username: "postgres",
    password: "lP0yzOPe6KkBIftpBbwm",
    host: "containers-us-west-112.railway.app",
    port: 6356,
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
        id_user: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    }, {
        tableName: "users_serial",
        schema: "public",
        timestamps: false,
    }
);

/**
 * Modelo tabla bots
 */
const Bots = sequelize.define(
    "bots", {
        token: DataTypes.STRING,
        id_bot: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    }, {
        tableName: "bots_serial",
        schema: "public",
        timestamps: false,
    }
);

/**
 * Modelo tabla functions
 */
const Functions = sequelize.define(
    "functions", {
        name_function: DataTypes.STRING,
        id_function: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    }, {
        tableName: "functions",
        schema: "public",
        timestamps: false,
    }
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
        nickname: DataTypes.STRING,
        bool_delete: DataTypes.BOOLEAN,
    }, {
        tableName: "bots_functions",
        schema: "public",
        timestamps: false,
    }
);

BotsFunctions.belongsTo(Functions, {
    foreignKey: "fk_id_function",
    sourceKey: "id_function",
});

Functions.hasMany(BotsFunctions, {
    foreignKey: "fk_id_function",
});

BotsFunctions.belongsTo(Bots, {
    foreignKey: "fk_id_bot",
    sourceKey: "id_bot",
});
Bots.hasMany(BotsFunctions, {
    foreignKey: "fk_id_bot",
});

module.exports = {
    User,
    Bots,
    Functions,
    BotsFunctions,
};