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
    BotsFunctions,
    CatStatus,
} = require("./src/db_model.js");
const {
    col
} = require("sequelize");
config();

var BOTS_DYNAMIC = [];

var express = require("express");
var app = express();

global.botInstance = {};

global.numberIterations = 0;

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
        // TODO ESTO ES PARA CUANDO ELIMINE UN BOT, SE ACTUALICE TAMBIEN LA VARIABLE GLOBAL
        let a = [];
        for (const [key] of Object.entries(global.botInstance)) {
            a.push(String(key));
        }

        let b = [];
        BOTS_DYNAMIC.forEach(element => {
            b.push(String(element.idBot));
        });

        a.forEach(element => {
            if (b.includes(element)) {} else {
                delete global.botInstance[element];
            }
        });

        BOTS_DYNAMIC.forEach(element => {
            try {
                const BOT = new Telegraf(element.BOT_TOKEN).catch(err => {
                    console.log("Ooops", err);
                });

                // Bienvenida del bot
                BOT.start(ctx => {
                    ctx.reply(
                        `¡Hola😁 @${element.username}!\n\n` +
                        "Te saludamos desde el equipo de Botly 👋🏼👨🏻‍💻 \n\n" +
                        `Bienvenido al bot: 🤖${element.nickname}🤖\n\n` +
                        "\u{1F4E2} Síguenos en nuestras redes sociales: \n\n" +
                        "   📲Instagram: @botly_ve\n\n" +
                        "   📲Twitter: @Botly_ve\n\n" +
                        "   💻Página web: https://f-botly.netlify.app/\n\n"
                    );
                    ctx.reply(
                        "🚨 Puedes controlarme enviando estos comandos: \n\n" +
                        "/start -    👋🏼 Bienvenida al bot\n\n" +
                        "/info -    ℹ️ Información sobre el bot\n\n" +
                        "/funciones -  🤖 Funciones del bot\n\n" +
                        "/help -    ❔ Preguntas frecuentes\n\n"
                    );
                });

                // Informacion del bot
                BOT.command("info", ctx => {
                    ctx.reply(
                        "🤖 Información del bot 🤖\n\n" +
                        `   🆔 Alias: ${element.nickname}\n\n` +
                        `   ${element.idStatus == 1 ? "✅" : "⚠️"} Estatus del bot: ${
                element.statusName
              }\n\n` +
                        `   📅 Fecha de creación: ${element.createDate}\n\n` +
                        `   👤 Usuario: ${element.username}\n\n` +
                        `   📝 Funciones: /funciones\n\n`
                    );
                });

                // Funciones del bot
                BOT.command("funciones", ctx => {
                    // element.BOT_FUNCTIONS = [];
                    if (element.BOT_FUNCTIONS.length > 0) {
                        let funciones = [];
                        element.BOT_FUNCTIONS.forEach(funcion => {
                            funciones.push(
                                `       ✅ ${funcion.nickName} - (${funcion.nameFunction}) \n\n`
                            );
                        });
                        ctx.reply(
                            "🎁 Estas son las funcioness que me has agregado 🎁\n\n" +
                            funciones.join("") +
                            "⚠️ RECORDATORIO: PARA EJECUTAR UNA FUNCIÓN DEBES ESCRIBIR EXCLUSIVAMENTE EL ALIAS.⚠️\n\n" +
                            `📌Ejemplo: \n\Para ejecutar la funcion ${element.BOT_FUNCTIONS[0].nameFunction}, debes escribir: ${element.BOT_FUNCTIONS[0].nickName}\n\n`
                        );
                    } else {
                        ctx.reply("⚠️ Este bot no tiene funciones agregadas ⚠️\n\n");
                    }
                });

                // Ayuda del bot
                BOT.command("help", ctx => {
                    ctx.reply(
                        "🚨 Puedes controlarme enviando estos comandos: \n\n" +
                        "/start -    👋🏼 Bienvenida al bot\n\n" +
                        "/info -    ℹ️ Información sobre el bot\n\n" +
                        "/funciones -  🤖 Funciones del bot\n\n" +
                        "💻❔Puedes consultar nuestras preguntas frecuentes ingresando a la página web de Botly:\nhttps://f-botly.netlify.app/faqs"
                    );
                });

                const weatherApiKey = process.env.WEATHER_API_KEY;

                if (isFirst) {
                    element.isLaunch = false;
                } else {
                    if (global.botInstance[element.idBot] == undefined) {
                        global.botInstance[element.idBot] = element;
                        Object.assign(global.botInstance[element.idBot], {
                            isLaunch: false,
                        });
                        global.botInstance[element.idBot].isLaunch = false;
                    }
                }

                // Con esto le digo a la variable global que cree un nuevo element (bot) y que es su primera iteracion
                global.botInstance[element.idBot] = element;
                global.botInstance[element.idBot].numberIterations = 0;

                // BOT.hears(/[A-za-z0–9_]/, ctx => {
                BOT.on("text", ctx => {
                    // Si el bot que escribe NO EXISTE, detengo el bot, si existe dejo que se ejecute
                    if (global.botInstance[element.idBot] == undefined) {
                        BOT.stop("");
                    }

                    // SI el bot esta INACTIVO, o el usario INACTIVO O ELIMINADO no puede ejecutar ninguna de sus funciones aunque las tenga
                    else if (+global.botInstance[element.idBot].idStatus == 2 ||
                        +global.botInstance[element.idBot].idUserStatus == 5 ||
                        +global.botInstance[element.idBot].idUserStatus == 6
                    ) {
                        ctx.reply("Este bot se encuentra inactivo.");
                    } else {
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
                                        .get(
                                            `https://api.mathjs.org/v4/?expr=${operacionUrlEncode}`
                                        )
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
                    }
                });

                // SOLO ejecuto el bot si primera vez, y si su numero de iteraciones es 0, O si es un nuevo bot y su numero de iteraciones tambein es 0
                if (
                    (isFirst &&
                        global.botInstance[element.idBot].numberIterations == 0) ||
                    (global.botInstance[element.idBot].numberIterations == 0 &&
                        global.botInstance[element.idBot].isLaunch == false)
                ) {
                    BOT.launch();
                    global.botInstance[element.idBot].numberIterations += 1;
                    global.botInstance[element.idBot].isLaunch = true;
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
        // listado de la tabla bots
        const bots = await Bots.findAll({
            attributes: [
                ["token", "token"],
                ["id_bot", "idBot"],
                ["bool_delete", "boolDelete"],
                ["fk_id_status", "idStatus"],
                ["nickname", "nickname"],
                ["fk_id_user", "idUser"],
                ["create_date", "createDate"],
                [col("users_serial.fk_id_status"), "idUserStatus"],
                [col("users_serial.username"), "username"],
                [col("cat_status.name"), "statusName"],
            ],
            include: [{
                model: User,
                attributes: [],
            }, {
                model: CatStatus,
                attributes: [],
            }, ],
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
        // Convierto la fecha a formato venezuela
        let date = new Date(botExisted.createDate);
        date =
            date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

        let botComplete = {};
        botComplete.idBot = botExisted.idBot;
        botComplete.boolDelete = botExisted.boolDelete;
        botComplete.idStatus = botExisted.idStatus;
        botComplete.idUserStatus = botExisted.idUserStatus;
        botComplete.username = botExisted.username;
        botComplete.nickname = botExisted.nickname;
        botComplete.statusName = botExisted.statusName;
        botComplete.createDate = date;

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