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
        id_user: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        lastname: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        phone_number: {
            type: Sequelize.STRING,
        },
        username: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
        created_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        bool_delete: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        photo: {
            type: Sequelize.STRING,
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
        nickname: DataTypes.STRING,
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

/**
 * Modelo tabla cat_status
 */
const CatStatus = sequelize.define(
    "cat_status", {
        id_cat_status: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
    }, {
        tableName: "cat_status",
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

//Foreign Key de user
Bots.belongsTo(User, {
    foreignKey: "fk_id_user",
    sourceKey: "id_user",
});

//Foreign Key de Cat_status
Bots.belongsTo(CatStatus, {
    foreignKey: "fk_id_status",
    sourceKey: "id_cat_status",
});

module.exports = {
    User,
    Bots,
    Functions,
    BotsFunctions,
    CatStatus,
};