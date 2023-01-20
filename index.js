const {
    Telegraf,
    Context
} = require("telegraf");
const axios = require("axios");
const {
    config
} = require("dotenv");
const {
    User,
    Bots,
    Functions,
    BotsFunctions
} = require("./src/db_model.js");
const {
    col
} = require("sequelize");
config();

var BOTS_DYNAMIC = [];

var express = require("express");
var app = express();

global.botInstance = {};

/**
 * Servidor web express
 */
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000");
});

app.get("/update", (req, res, next) => {
    connectDB(false);
    res.json("YA SE LLAMO A CONNECT");

    return;
});

/**
 * Funcion que ejecuta los bots en telegram a tiempo real
 */
function main(isFirst) {
    try {
        BOTS_DYNAMIC.forEach(element => {
            try {
                const BOT = new Telegraf(element.BOT_TOKEN).catch(err => {
                    console.log("Ooops", err);
                });

                BOT.start(ctx => ctx.reply("Bienvenidos al bot: #" + element.idBot));

                const weatherApiKey = process.env.WEATHER_API_KEY;

                global.botInstance[element.idBot] = element;
                // BOT.hears(/[A-za-z0–9_]/, ctx => {
                BOT.on("text", ctx => {
                    BOT.context.bot = global.botInstance[element.idBot].BOT_FUNCTIONS;

                    // Obtengo el texto de lo que introdujo el usuario
                    let userText = ctx.message.text;

                    // Busco si existe algun alias dentro de sus botsfunctions que sea igual a lo que introdujo el usuario
                    // Tambien borro los espacios entre las palabras

                    let botFunction = global.botInstance[
                        element.idBot
                    ].BOT_FUNCTIONS.filter(
                        element2 =>
                        element2.nickName.replace(/\s/g, "").toLowerCase() ===
                        userText.replace(/\s/g, "").toLowerCase()
                    );

                    // Si existe , entonces hago un switch para ver a donde me voy
                    if (botFunction.length > 0 && botFunction[0]) {
                        // Mi condicion es el valor del NOMBRE REAL DE LA FUNCTION que tiene el usuario registrado y asi veo a donde voy y le ejecuto lo que tenga
                        switch (botFunction[0].nameFunction) {
                            case "Calculadora":
                                ctx.reply(
                                    "Has ejecutado la funcion calculadora, dime tu operacion"
                                );

                                const operacion = ctx.message.text;
                                //remove spaces
                                const operacionSinEspacios = operacion.replace(/\s/g, "");
                                //remove /calcular
                                const operacionSinComando = operacionSinEspacios.replace(
                                    botFunction[0].nickName,
                                    ""
                                );
                                //url encode
                                const operacionUrlEncode =
                                    encodeURIComponent(operacionSinComando);
                                axios
                                    .get(`https://api.mathjs.org/v4/?expr=${operacionUrlEncode}`)
                                    .then(response => {
                                        const data = response.data;
                                        ctx.reply(`El resultado es: ${data}`);
                                    })
                                    .catch(error => {
                                        ctx.reply("No se ha encontrado la operación");
                                    });

                                break;

                            case "Noticias":
                                const newsApiKey = process.env.NEWS_API_KEY;
                                const noticia = ctx.message.text;
                                const url = `https://newsapi.org/v2/everything?q=${noticia}&apiKey=${newsApiKey}`;

                                axios
                                    .get(url)
                                    .then(response => {
                                        const data = response.data;
                                        for (let i = 0; i < 3; i++) {
                                            ctx.reply(
                                                `${data.articles[i].title} ${data.articles[i].description} ${data.articles[i].url} `
                                            );
                                        }
                                    })
                                    .catch(error => {
                                        ctx.reply("No se ha encontrado la noticia");
                                    });

                                break;

                            case "Clima":
                                const ciudad = ctx.message.text;
                                const ciudadLimpia = ciudad.replace(
                                    botFunction[0].nickName,
                                    ""
                                );

                                axios
                                    .get(
                                        `http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${ciudadLimpia}&units=m`
                                    )
                                    .then(response => {
                                        const data = response.data;
                                        const {
                                            current,
                                            location
                                        } = data;
                                        const weatherStatus = current.weather_descriptions[0];

                                        ctx.reply(
                                            `🌆 Ciudad:${location.name}\n-\n 🌡 Temperatura ${
                        current.temperature
                      }°\n-\n❓ Clima: ${
                        (weatherStatus.toLowerCase().includes("clear") ===
                          true &&
                          "☀️") ||
                        (weatherStatus.toLowerCase().includes("sunny") ===
                          true &&
                          "☀️") ||
                        (weatherStatus.toLowerCase().includes("cloud") ===
                          true &&
                          "☁️") ||
                        (weatherStatus.toLowerCase().includes("overcast") ===
                          true &&
                          "☁️") ||
                        (weatherStatus.toLowerCase().includes("rain") ===
                          true &&
                          "🌧") ||
                        (weatherStatus.toLowerCase().includes("snow") ===
                          true &&
                          "❄️")
                      } ${current.weather_descriptions[0]}`
                                        );
                                    })
                                    .catch(error => {
                                        ctx.reply("No se ha encontrado la ciudad");
                                    });
                                break;

                            default:
                                break;
                        }
                    } else {
                        ctx.reply("Usted no posee esta funcion registrada en botly!");
                    }
                });

                if (isFirst) {
                    BOT.launch();
                }
            } catch (error) {
                console.log("EN ERROR CAPAZ");
            }
        });
    } catch (error) {
        console.log("EN EL ERROR");
        console.log(error);
    }
}

// yo deberia de llamar esta funcion para listar todo, luego que se liste,
// llamo a la otra de llenar la variable y
// luego llamo a main() que es la que lee ese array y ejecuta los bots en el servidor
async function connectDB(isFirst) {
    try {
        // listado de la tabla users
        const users = await User.findAll({
            attributes: [
                ["name", "name"],
                ["lastname", "lastname"],
                ["id_user", "idUser"],
            ],
            raw: true,
            subQuery: false,
        });

        // listado de la tabla bots
        const bots = await Bots.findAll({
            attributes: [
                ["token", "token"],
                ["id_bot", "idBot"],
            ],
            where: {
                bool_delete: false,
            },
            raw: true,
            subQuery: false,
        });
        // listado de la tabla functions
        const functions = await Functions.findAll({
            attributes: [
                ["name_function", "nameFunction"],
                ["id_function", "idFunction"],
            ],
            where: {
                bool_delete: false,
            },
            raw: true,
            subQuery: false,
        });

        // listado de la tabla bots_functions con los join a bots y a funcions pero no me dio
        const botsFunctions = await BotsFunctions.findAll({
            attributes: [
                ["fk_id_bot", "idBot"],
                ["fk_id_function", "idFunction"],
                ["nickname", "nickName"],
                // ["token", "token"],
                [col("function.name_function"), "nameFunction"],
                [col("bot.token"), "token"],
            ],
            include: [{
                model: Functions,
                attributes: [],
            }, {
                model: Bots,
                attributes: [],
            }, ],
            where: {
                bool_delete: false,
            },
            raw: true,
            subQuery: false,
        });

        await setNewBotsArray(bots, botsFunctions, isFirst);
    } catch (error) {
        console.log(error);
    }
}

async function setNewBotsArray(botsList, botsFunctionsList, isFirst) {
    var list2 = [];
    botsList.forEach(botExisted => {
        let botComplete = {};
        botComplete.idBot = botExisted.idBot;
        botComplete.BOT_TOKEN = botExisted.token;
        botComplete.BOT_FUNCTIONS = botsFunctionsList.filter(
            element => element.idBot == botComplete.idBot
        );
        list2.push(botComplete);
    });

    BOTS_DYNAMIC = []; // reviar si esto va o no

    BOTS_DYNAMIC = list2;

    main(isFirst);
}

// Me conecto a la BD y luego ejecuto la funcion main
connectDB(true);