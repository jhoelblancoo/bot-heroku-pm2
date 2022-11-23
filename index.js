const { Telegraf } = require("telegraf");
const axios = require("axios");
const { config } = require("dotenv");
const { User, Bots, Functions, BotsFunctions } = require("./src/db_model.js");
const { col } = require("sequelize");
config();

// const Bot1 = "5469474008:AAHsNkCs06eI2-fxsxbBSRzf-7KLWtJ2r5g";
// const Bot2 = "5610536765:AAH4iZ2gqwtV1NyU9ESV_0TGHai9P5Lg1VA";
// const Bot3 = "5746503539:AAGIQURCOkb9L6RhQxiYpeLA42OjsAeSwgU";

var BOTS_DYNAMIC = [];

var express = require("express");
var app = express();

/**
 * Servidor web express
 */
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000");
});

// Api para crear un nuevo bot, recibo los parametros del req, y si son los correctos, entonces llamo a la funcion que inserta ese nuevo bot a bd
app.get("/createNewBot", (req, res, next) => {
    res.json("hola voy a meter a un bicho en bd");

    createNewUserDB(); // se supone que deberia llamar es a una funcion que cree bots en BD pero por ahora que cree users
    // esto si va pero con otros parametros
    // createNewBot({
    //     idBot: Math.round(Math.random() * 100000),
    //     token: "jhoeltoken" + String(Math.round(Math.random() * 9999999)),
    // });
});

// Api para crear un nuevo bot, recibo los parametros del req, y si son los correctos, entonces llamo a la funcion que inserta ese nuevo bot a bd
app.get("/prueba_postman", (req, res, next) => {
    res.json({ parametro: "Paso la prueba de postman" });
});

app.get("/update", (req, res, next) => {
    console.log("ESTOY EN UPDATE");
    connectDB();
    res.json("YA SE LLAMO A CONNECT");
    return;
});

/**
 * Funcion que ejecuta los bots en telegram a tiempo real
 */
function main() {
    console.log("ESTOY EN MAIN");
    BOTS_DYNAMIC.forEach(element => {
        const BOT = new Telegraf(element.BOT_TOKEN);
        BOT.start(ctx => ctx.reply("Bienvenidos al  Bot de nskdj!"));
        const weatherApiKey = process.env.WEATHER_API_KEY;
        BOT.command("clima", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2.nameFunction == "Clima"
            );
            if (applyFunction) {
                const ciudad = ctx.message.text;
                const ciudadLimpia = ciudad.replace("/clima ", "");
                const url = `http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${ciudadLimpia}&units=m`;
                axios
                    .get(url)
                    .then(response => {
                        const data = response.data;
                        const { current, location } = data;
                        const weatherStatus = current.weather_descriptions[0];

                        ctx.reply(
                            `🌆 Ciudad:${location.name}\n-\n 🌡 Temperatura ${
                current.temperature
              }°\n-\n❓ Clima: ${
                (weatherStatus.toLowerCase().includes("clear") === true &&
                  "☀️") ||
                (weatherStatus.toLowerCase().includes("sunny") === true &&
                  "☀️") ||
                (weatherStatus.toLowerCase().includes("cloud") === true &&
                  "☁️") ||
                (weatherStatus.toLowerCase().includes("overcast") === true &&
                  "☁️") ||
                (weatherStatus.toLowerCase().includes("rain") === true &&
                  "🌧") ||
                (weatherStatus.toLowerCase().includes("snow") === true && "❄️")
              } ${current.weather_descriptions[0]}`
                        );
                    })
                    .catch(error => {
                        ctx.reply("No se ha encontrado la ciudad");
                    });
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });

        BOT.command("calcular", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2.nameFunction == "Calculadora"
            );
            if (applyFunction) {
                const operacion = ctx.message.text;
                //remove spaces
                const operacionSinEspacios = operacion.replace(/\s/g, "");
                //remove /calcular
                const operacionSinComando = operacionSinEspacios.replace(
                    "/calcular",
                    ""
                );
                //url encode
                const operacionUrlEncode = encodeURIComponent(operacionSinComando);
                const url = `https://api.mathjs.org/v4/?expr=${operacionUrlEncode}`;
                axios
                    .get(url)
                    .then(response => {
                        const data = response.data;
                        ctx.reply(`El resultado es: ${data}`);
                    })
                    .catch(error => {
                        ctx.reply("No se ha encontrado la operación");
                    });
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });

        BOT.command("noticias", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2.nameFunction == "Noticias"
            );
            if (applyFunction) {
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
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });
        BOT.hears("hola", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2.nameFunction == "hola"
            );

            if (applyFunction) {
                ctx.reply("Hola estimado usuario!");
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });

        BOT.hears("chao", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2.nameFunction == "chao"
            );

            if (applyFunction) {
                ctx.reply("chao estimado usuario!");
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });

        BOT.hears("jhoel", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2.nameFunction == "jhoel"
            );

            if (applyFunction) {
                ctx.reply("jhoeljhoeljhoel!");
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });
        BOT.launch();
    });
}

// yo deberia de llamar esta funcion para listar todo, luego que se liste,
// llamo a la otra de llenar la variable y
// luego llamo a main() que es la que lee ese array y ejecuta los bots en el servidor
async function connectDB() {
    try {
        console.log("ESTOY EN CONECT");
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
            raw: true,
            subQuery: false,
        });
        // listado de la tabla functions
        const functions = await Functions.findAll({
            attributes: [
                ["name_function", "nameFunction"],
                ["id_function", "idFunction"],
            ],
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
                },
                {
                    model: Bots,
                    attributes: [],
                },
            ],
            where: {
                bool_delete: false,
            },
            raw: true,
            subQuery: false,
        });

        await setNewBotsArray(bots, botsFunctions);
    } catch (error) {
        console.log(error);
    }
}

async function setNewBotsArray(botsList, botsFunctionsList) {
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
    // console.log(list2);

    BOTS_DYNAMIC = []; // reviar si esto va o no

    BOTS_DYNAMIC = list2;
    // Esto no iria, agarro cada bot y le meto una lista de funciones (esto deberia venir del query)
    // bots.forEach((element, index) => {
    //     Object.assign(element, { functions: BOTS_ARRAY[index].BOT_FUNCTIONS });
    //     BOTS_DYNAMIC.push(element);
    // });

    // llamo a la funcion main para que actualice el nuevo listado de bots
    main();
}

// // aqui deberia hacer un query para insertar un nuevo bot en la tabla, llenar sus relaciones con las funciones y luego llamar a connectDb para que lea todo otra vez y actualice el Bots_Dynamic
// async function createNewBot(newBot) {
//     Object.assign(newBot, { functions: ["hola"] }); //esto no va

//     /**
//      *TO DO Aqui voy a hacer un insert a bd y si es exitoso entonces llamo a connectDB(0)
//      */

//     BOTS_DYNAMIC.push(newBot); //esto no va (es simulando que voy a guardar un bot en bd)

//     connectDB();
// }

//Funcion para insertar un nuevo usuario en la tabla usuarios
async function createNewUserDB(newBot) {
    try {
        // query para insertar un nuevo row en la tabla users_serial
        await User.create({
            name: "Pablo",
            lastname: "Gavi",
        });

        console.log("\n ahora llamo a la bd para leer\n");

        // llamo a la funcion que lista lo que este en bd y empieza el flujo
        await connectDB();
    } catch (error) {
        console.log("error al crear el bicho en bd");
    }
}

console.log("first");
connectDB();