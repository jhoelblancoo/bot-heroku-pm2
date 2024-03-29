const { Telegraf, Context } = require("telegraf");
const axios = require("axios");
const { config } = require("dotenv");
const {
  User,
  Bots,
  Functions,
  BotsFunctions,
  CatStatus,
} = require("./src/db_model.js");
const { col } = require("sequelize");
config();

var BOTS_DYNAMIC = [];

var express = require("express");
var app = express();

var youtube = require("./src/youtube.js"); // Provides easy access to YouTube API

global.botInstance = {};

global.numberIterations = 0;

/**
 * Servidor web express
 */
app.listen(process.env.PORT || 3000, () => {
  console.log(
    "\n\nBotly-Telegram is online! on port=" + process.env.PORT + "\n\n"
  );
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
      if (b.includes(element)) {
      } else {
        delete global.botInstance[element];
      }
    });

    BOTS_DYNAMIC.forEach(element => {
      try {
        const BOT = new Telegraf(element.BOT_TOKEN).catch(err => {
          console.log("Ooops", err);
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

        // Si el bot existe y tiene estatus activo, entonces sus comandos responden
        // Bienvenida del bot
        BOT.start(ctx => {
          ctx.reply(
            `¡Hola😁 @${global.botInstance[element.idBot].username}!\n\n` +
              "Te saludamos desde el equipo de Botly 👋🏼👨🏻‍💻 \n\n" +
              `Bienvenido al bot: 🤖${
                global.botInstance[element.idBot].nickname
              }🤖\n\n` +
              "\u{1F4E2} Síguenos en nuestras redes sociales: \n\n" +
              `   📲Instagram: ${process.env.BOTLY_INSTAGRAM}\n\n` +
              `   📲Twitter: ${process.env.BOTLY_TWITTER}\n\n` +
              `   💻Página web: ${process.env.BOTLY_WEB_PAGE}\n\n`
          );

          // Si el bot esta activo le muestro los comandos
          if (global.botInstance[element.idBot].idStatus == 1) {
            ctx.reply(
              "🚨 Puedes controlarme enviando estos comandos: \n\n" +
                "/start -    👋🏼 Bienvenida al bot\n\n" +
                "/info -    ℹ️ Información sobre el bot\n\n" +
                "/funciones -  🤖 Funciones del bot\n\n" +
                "/help -    ❔ Preguntas frecuentes\n\n"
            );
          } else {
            // Bot esta inactivo
            ctx.reply(
              "🤖 Información del bot 🤖\n\n" +
                `   🆔 Alias: ${
                  global.botInstance[element.idBot].nickname
                }\n\n` +
                `   ${
                  global.botInstance[element.idBot].idStatus == 2 ? "⚠️" : "🚫"
                } Estatus del bot: ${
                  global.botInstance[element.idBot].statusName
                }\n\n` +
                `   👤 Usuario: ${
                  global.botInstance[element.idBot].username
                }\n\n`
            );
          }
        });

        // Informacion del bot
        BOT.command(["info", "Info", "informacion", "Informacion"], ctx => {
          ctx.reply(
            "🤖 Información del bot 🤖\n\n" +
              `   🆔 Alias: ${global.botInstance[element.idBot].nickname}\n\n` +
              `   ${
                global.botInstance[element.idBot].idStatus == 1 ? "✅" : "⚠️"
              } Estatus del bot: ${
                global.botInstance[element.idBot].statusName
              }\n\n` +
              `   📅 Fecha de creación: ${
                global.botInstance[element.idBot].createDate
              }\n\n` +
              `   👤 Usuario: ${
                global.botInstance[element.idBot].username
              }\n\n` +
              `   📝 Funciones: /funciones\n\n`
          );
        });

        // Funciones del bot
        BOT.command(
          [
            "funciones",
            "Funciones",
            "funcion",
            "Funcion",
            "funcionalidad",
            "Funcionalidad",
            "Funcionalidades",
            "funcionalidades",
          ],
          ctx => {
            if (global.botInstance[element.idBot].BOT_FUNCTIONS.length > 0) {
              let funciones = [];
              global.botInstance[element.idBot].BOT_FUNCTIONS.forEach(
                funcion => {
                  funciones.push(
                    `       ✅ ${funcion.nickName} - (${funcion.nameFunction}) \n\n`
                  );
                }
              );
              ctx.reply(
                "🎁 Estas son las funcioness que me has agregado 🎁\n\n" +
                  funciones.join("") +
                  "⚠️ RECORDATORIO: PARA EJECUTAR UNA FUNCIÓN DEBES ESCRIBIR EXCLUSIVAMENTE EL ALIAS.⚠️\n\n" +
                  `📌Ejemplo: \n\Para ejecutar la funcion ${
                    global.botInstance[element.idBot].BOT_FUNCTIONS[0]
                      .nameFunction
                  }, debes escribir: ${
                    global.botInstance[element.idBot].BOT_FUNCTIONS[0].nickName
                  }\n\n`
              );
            } else {
              ctx.reply(
                "⚠️ Este bot no posee ninguna función ⚠️\n\n" +
                  `Recuerda que puedes añadirle funciones a tus bots desde la sección Tienda, ingresando a la página web de Botly:\n${process.env.BOTLY_WEB_PAGE_SHOP}`
              );
            }
          }
        );

        // Ayuda del bot
        BOT.command(
          [
            "help",
            "Help",
            "ayuda",
            "Ayuda",
            "noentiendo",
            "Noentiendo",
            "nose",
            "Nose",
          ],
          ctx => {
            ctx.reply(
              "🚨 Puedes controlarme enviando estos comandos: \n\n" +
                "/start -    👋🏼 Bienvenida al bot\n\n" +
                "/info -    ℹ️ Información sobre el bot\n\n" +
                "/funciones -  🤖 Funciones del bot\n\n" +
                `💻❔Puedes consultar nuestras preguntas frecuentes ingresando a la página web de Botly:\n${process.env.BOTLY_WEB_PAGE_FAQ}`
            );
          }
        );

        // BOT.hears(/[A-za-z0–9_]/, ctx => {
        BOT.on("text", ctx => {
          // Si el bot que escribe NO EXISTE, detengo el bot, si existe dejo que se ejecute
          if (global.botInstance[element.idBot] == undefined) {
            BOT.stop("");
          }

          // SI el bot esta INACTIVO, o el usario INACTIVO O ELIMINADO no puede ejecutar ninguna de sus funciones aunque las tenga
          else if (
            +global.botInstance[element.idBot].idStatus == 2 ||
            +global.botInstance[element.idBot].idUserStatus == 5 ||
            +global.botInstance[element.idBot].idUserStatus == 6
          ) {
            ctx.reply(
              "⛔ Este bot se encuentra inactivo, por lo tanto no podrás ejecutar ninguna de tus funciones. ⛔\n\n" +
                `Recuerda que puedes activar tus bots desde la sección Mis Bots, ingresando a la página web de Botly:\n${process.env.BOTLY_WEB_PAGE_BOTS}`
            );
          } else {
            BOT.context.bot = global.botInstance[element.idBot].BOT_FUNCTIONS;

            // Obtengo el texto de lo que introdujo el usuario
            let userText = ctx.message.text;

            // Busco si existe algun alias dentro de sus botsfunctions que sea igual a lo que introdujo el usuario
            // Tambien borro los espacios entre las palabras

            // global.botInstance[element.idBot].BOT_FUNCTIONS.forEach(funn => {
            //   console.log(userText);
            //   console.log(userText.includes(funn.nickName));
            //   console.log(funn.nickName);

            //   // if (
            //   //   funn.nickName
            //   //     .replace(/\s/g, "")
            //   //     .toLowerCase()
            //   //     .includes(userText.replace(/\s/g, "").toLowerCase())
            //   // ) {
            //   //   console.log(funn);
            //   // } else {
            //   //   console.log(funn.nickName.replace(/\s/g, "").toLowerCase());
            //   // }
            // });

            // let botFunction = global.botInstance[
            //   element.idBot
            // ].BOT_FUNCTIONS.filter(
            //   element2 =>
            //     element2.nickName.replace(/\s/g, "").toLowerCase() ===
            //     userText.replace(/\s/g, "").toLowerCase()
            // );

            /**
             * NUEVOOO
             */

            // Esta es la funcion que corresponde a lo que escribe el usuario
            const botFunction = global.botInstance[
              element.idBot
            ].BOT_FUNCTIONS.find(element =>
              userText
                .replace(/\s/g, "")
                .toLowerCase()
                .includes(element.nickName.replace(/\s/g, "").toLowerCase())
            );

            // Esta variable es lo que el usuario quiere consultar 2+2 o caracas etc
            let userContent;

            if (botFunction) {
              // Aqui lo hago es separar, el alias, con el resto del mensaje
              userContent = userText
                // .replace(/\s/g, "")
                .toLowerCase()
                .split(botFunction.nickName.toLowerCase());
            }

            // Si existe , entonces hago un switch para ver a donde me voy
            if (botFunction) {
              // Mi condicion es el valor del NOMBRE REAL DE LA FUNCTION que tiene el usuario registrado y asi veo a donde voy y le ejecuto lo que tenga
              switch (botFunction.nameFunction) {
                case "Calculadora":
                  // ctx.reply(
                  //   "Has ejecutado la funcion calculadora, dime tu operacion"
                  // );

                  // const operacion = ctx.message.text;
                  // //remove spaces
                  // const operacionSinEspacios = operacion.replace(/\s/g, "");
                  // //remove /calcular
                  // const operacionSinComando = operacionSinEspacios.replace(
                  //   botFunction.nickName,
                  //   ""
                  // );

                  // Extraigo la operacion del mensaje del usuario
                  let operacion = userContent[1].replace(" ", "");
                  operacion = operacion
                    .replaceAll(" ", "")
                    .replaceAll(",", ".");

                  //url encode
                  const operacionUrlEncode = encodeURIComponent(
                    operacion ? operacion : "abc"
                  );

                  ctx.reply(`⏳ Consultando la operación: ${operacion} ⏳`);

                  // Viene operacion
                  if (operacion) {
                    axios
                      .get(
                        `https://api.mathjs.org/v4/?expr=${operacionUrlEncode}`
                      )
                      .then(response => {
                        const data = response.data;

                        ctx.reply(
                          `🧮 El resultado de ${operacion} es: \n\n ${new Intl.NumberFormat(
                            "es-ES",
                            { maximumFractionDigits: 2 }
                          ).format(data)}`
                        );
                      })
                      .catch(error => {
                        ctx.reply(
                          `❌ No se ha podido resolver la operación: ${operacion} ❌`
                        );
                      });
                  }

                  // No viene operacion
                  if (!userContent[1]) {
                    ctx.reply(
                      `⚠️ No has escrito ninguna operación ⚠️.` +
                        "\n\nRecuerda que puedes consultar una operación matemática escribiendo el siguiente ejemplo:" +
                        `\n\nEj: ${botFunction.nickName} 123 * 19`
                    );
                  }

                  break;

                case "Noticias populares":
                  const newsApiKey = process.env.NEWS_API_KEY;

                  // Noticia que quiere buscar el usuario (deporte, clima, petroleo etc)
                  const noticia = String(userContent)
                    .replace(",", "")
                    .replace(" ", "");

                  // Url del api que trae las noticias
                  const url = `https://newsapi.org/v2/everything?q=${
                    noticia ? noticia : "noticia"
                  }&apiKey=${newsApiKey}&language=es&sortBy=popularity`;

                  ctx.reply(
                    `⏳ Consultando noticias populares (español) relacionadas a: ${
                      noticia ? noticia : "general"
                    }⏳`
                  );

                  // llamado al api de noticias
                  axios
                    .get(url)
                    .then(response => {
                      const data = response.data;

                      for (let i = 0; i < 5; i++) {
                        ctx.reply(
                          `${data.articles[i].title} ${data.articles[i].description} ${data.articles[i].url} `
                        );
                      }
                    })
                    .catch(error => {
                      ctx.reply(
                        `❌ No se han encontrado resultados para noticias: ${noticia}. ❌` +
                          "\n\nRecuerda que puedes consultar una noticia escribiendo el siguiente ejemplo:" +
                          `\n\nEj: ${botFunction.nickName} deportes`
                      );
                    });

                  break;

                case "Clima":
                  // Extraemos la ciudad del mensaje del usuario
                  const cityRequest = userContent[1]
                    ? userContent[1]
                    : "Caracas";

                  ctx.reply(
                    `⏳ Consultando clima para la ciudad: ${cityRequest} ⏳`
                  );

                  axios
                    .get(
                      `http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${cityRequest}&units=m`
                    )
                    .then(response => {
                      const data = response.data;
                      const { current, location } = data;

                      const weatherStatus = current.weather_descriptions[0];

                      ctx.reply(
                        `🌆 Ciudad: ${location.name} - (${location.region}, ${location.country})` +
                          `\n-\n${
                            current.is_day == "yes" ? "🌞" : "🌙"
                          } Hora local: ${location.localtime} ` +
                          `\n-\n🌡 Temperatura: ${current.temperature}° ` +
                          `\n-\n🌡 Sensación termica: ${current.feelslike}° ` +
                          `\n-\n❓ Clima: ${
                            (weatherStatus.toLowerCase().includes("clear") ===
                              true &&
                              "☀️") ||
                            (weatherStatus.toLowerCase().includes("sunny") ===
                              true &&
                              "☀️") ||
                            (weatherStatus.toLowerCase().includes("cloud") ===
                              true &&
                              "☁️") ||
                            (weatherStatus
                              .toLowerCase()
                              .includes("overcast") === true &&
                              "☁️") ||
                            (weatherStatus.toLowerCase().includes("rain") ===
                              true &&
                              "🌧") ||
                            (weatherStatus.toLowerCase().includes("snow") ===
                              true &&
                              "❄️")
                          } ${current.weather_descriptions[0]} ` +
                          `\n-\n☔ Prob. de precipitaciones: ${
                            current.precip * 100
                          }% ` +
                          `\n-\n🌫️ Humedad: ${current.humidity}% ` +
                          `\n-\n💨 Viento: ${current.wind_speed} km/hr `
                      );
                    })
                    .catch(error => {
                      ctx.reply(
                        `❌ No se ha encontrado la ciudad: ${cityRequest} ❌` +
                          "\n\nRecuerda que puedes consultar el clima de una ciudad escribiendo el siguiente ejemplo:" +
                          `\n\nEj: ${botFunction.nickName} Miami`
                      );
                    });

                  if (!userContent[1]) {
                    ctx.reply(
                      `⚠️ No has escrito ninguna ciudad ⚠️. Por defecto, se consultará el clima de la ubicación donde se encuentran los servidores de Botly.` +
                        "\n\nRecuerda que puedes consultar el clima de una ciudad escribiendo el siguiente ejemplo:" +
                        `\n\nEj: ${botFunction.nickName} Miami`
                    );
                  }
                  break;

                case "Youtube":
                  let userSearch = userContent[1].trim(); // Take the nickname out of Telegraf context structure.

                  ctx.reply(
                    `⏳ Consultando contenido de Youtube▶️ relacionado con: ${userSearch} ⏳`
                  );

                  try {
                    if (userSearch.length > 0) {
                      // If user input is longer than 3 characters
                      // Search channel based on userSearch. If there is one with same user query, let's retrieve its channel ID.
                      youtube
                        .get_id_from_nickname(userSearch)
                        .then(channel_id => {
                          // Let's get last uploaded videos as data structure through YouTube API (thanks to our written model).
                          youtube
                            .fetch_channel_uploads(channel_id)
                            .then(structured_data => {
                              // Let's parse those structured data to get only essential informations for video listing.
                              youtube
                                .parse_list_videos(structured_data)
                                .then(video_info => {
                                  // Let's encapsulate those informations in a list that Telegraf API can digest.
                                  let new_arr = [];
                                  // For each video, extract retrieved informations for extra elaborations.
                                  for (let k in video_info) {
                                    new_arr[k] = {
                                      type: "video",
                                      id: k,
                                      title: video_info[k].title,
                                      description: video_info[k].description,
                                      video_url: video_info[k].url,
                                      mime_type: "video/mp4",
                                      thumb_url: video_info[k].thumb,
                                      input_message_content: {
                                        message_text:
                                          "[BOT] " + video_info[k].url,
                                      },
                                    };

                                    // Respondo la cancion con su nombre y su link
                                    ctx.reply(
                                      video_info[k].title +
                                        "\n" +
                                        video_info[k].url +
                                        "\n"
                                    );

                                    // return ctx.reply("new_arr");
                                  }

                                  // Let's show this list to the user. Cache time is set to zero for development purposes.
                                  // return ctx.reply(new_arr, {
                                  //   cache_time: 0,
                                  // });
                                })
                                .catch(error => {
                                  ctx.reply("Error de youtube 0");
                                });
                            })
                            .catch(error => {
                              ctx.reply("Error de youtube 1");
                            });
                        })
                        .catch(error => {
                          ctx.reply("Error de youtube 2");
                        });
                    } else {
                      ctx.reply(
                        `❌ No se han podido obtener resultados de Youtube para la búsqueda: ${userSearch} ❌` +
                          "\n\nRecuerda que puedes consultar el contenido de Youtube, escribiendo el siguiente ejemplo:" +
                          `\n\nEj: ${botFunction.nickName} michael jackson`
                      );
                    }
                  } catch (error) {
                    ctx.reply(
                      `❌ Error en la consulta hacia los servidores de Youtube, intente nuevamente en unos minutos. ❌` +
                        "\n\nRecuerda que puedes consultar el contenido de Youtube, escribiendo el siguiente ejemplo:" +
                        `\n\nEj: ${botFunction.nickName} michael jackson`
                    );
                  }
                  break;

                case "Películas":
                  try {
                    //Recibimos el mensaje de usuario
                    const pelicula = userContent[1];

                    //Se arma la url de la api
                    const link = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=es&query=${pelicula}`;

                    ctx.reply(
                      `⏳ Consultando contenido de IMDb🎥 (películas) relacionado con: ${pelicula} ⏳`
                    );

                    //Se hace la peticion a la api
                    axios
                      .get(link)
                      .then(response => {
                        //Se obtienen los resultados
                        //En caso de error se envia un mensaje al usuario
                        const movies = response.data.results;

                        //Limitamos la cantidad de resultados a 3
                        for (let i = 0; i < 3; i++) {
                          //Se arma la url para obtener los datos de la pelicula
                          const linkFind = `https://api.themoviedb.org/3/movie/${movies[i].id}?api_key=${process.env.MOVIE_API_KEY}&language=es&append_to_response=external_ids`;

                          //Se hace la peticion a la api
                          axios.get(linkFind).then(response => {
                            //Se obtienen los resultados
                            const film = response.data;

                            //Se arma la url para obtener el trailer de la pelicula
                            const linkVideo = `https://api.themoviedb.org/3/movie/${film.id}/videos?api_key=${process.env.MOVIE_API_KEY}&language=es`;

                            //Se hace la peticion a la api
                            axios.get(linkVideo).then(responseVideo => {
                              //Se obtienen los resultados
                              var video = responseVideo.data.results[0];

                              //Se cambia el idioma de la pelicula por su bandera
                              switch (film.original_language) {
                                case "en":
                                  film.original_language = "🇺🇸";
                                  break;
                                case "es":
                                  film.original_language = "🇪🇸";
                                  break;
                                case "fr":
                                  film.original_language = "🇫🇷";
                                  break;
                                case "de":
                                  film.original_language = "🇩🇪";
                                  break;
                                case "it":
                                  film.original_language = "🇮🇹";
                                  break;
                                case "ja":
                                  film.original_language = "🇯🇵";
                                  break;
                                case "pt":
                                  film.original_language = "🇵🇹";
                                  break;
                                case "ru":
                                  film.original_language = "🇷🇺";
                                  break;
                              }

                              //Se arma el mensaje
                              let message = "";

                              //Si no existe trailer se envia el mensaje sin trailer
                              if (video === undefined) {
                                message +=
                                  `\n🎬 ${film.title} 🎬` +
                                  `\n\nVer película 🍿: https://www.imdb.com/title/${film.imdb_id}` +
                                  `\n\nFecha de estreno 📅: ${film.release_date}` +
                                  `\n\nDuración ⏰: ${film.runtime} min` +
                                  `\n\nPuntaje promedio (1-10) 📈: ${film.vote_average}` +
                                  `\n\nConteo de votos 🙋: ${film.vote_count}` +
                                  `\n\nIdioma original 🎙️: ${film.original_language}` +
                                  `\n\nSinopsis 📝: ${film.overview}\n\n`;
                              } else {
                                message +=
                                  `\n🎬 ${film.title} 🎬` +
                                  `\n\nVer película 🍿: https://www.imdb.com/title/${film.imdb_id}\n\n` +
                                  `Tráiler 🎥: https://www.youtube.com/watch?v=${video.key}` +
                                  `\n\nFecha de estreno 📅: ${film.release_date}` +
                                  `\n\nDuración ⏰: ${film.runtime} min` +
                                  `\n\nPuntaje promedio (1-10) 📈: ${film.vote_average}` +
                                  `\n\nConteo de votos 🙋: ${film.vote_count}` +
                                  `\n\nIdioma original 🎙️: ${film.original_language}` +
                                  `\n\nSinopsis 📝: ${film.overview}\n\n`;
                              }

                              //Se envia el mensaje de la pelicula al usuario
                              ctx.reply(message);
                            });
                          });
                        }
                        //Si no hay resultados se envia un mensaje al usuario
                      })
                      .catch(error => {
                        ctx.reply(
                          `❌ No se han encontrado resultados para: ${pelicula} ❌` +
                            "\n\nRecuerda que puedes consultar una pelicula escribiendo el siguiente ejemplo:" +
                            `\n\nEj: ${botFunction.nickName} Avengers`
                        );
                      });
                  } catch (error) {
                    ctx.reply(
                      `❌ No se han encontrado resultados para: ${pelicula} ❌` +
                        "\n\nRecuerda que puedes consultar una pelicula escribiendo el siguiente ejemplo:" +
                        `\n\nEj: ${botFunction.nickName} Avengers`
                    );
                  }
                  break;

                case "Series":
                  try {
                    //Recibimos el mensaje de usuario
                    const serie = userContent[1];

                    //Se arma la url de la api
                    const link = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.MOVIE_API_KEY}&language=es&query=${serie}`;

                    ctx.reply(
                      `⏳ Consultando contenido de IMDb🎥 (series) relacionado con: ${serie} ⏳`
                    );

                    //Se hace la peticion a la api
                    axios
                      .get(link)
                      .then(response => {
                        //Se obtienen los resultados
                        const series = response.data.results;

                        //Limitamos la cantidad de resultados a 3
                        for (let i = 0; i < 3; i++) {
                          //Se arma la url para obtener los datos de la serie
                          const linkFind = `https://api.themoviedb.org/3/tv/${series[i].id}?api_key=${process.env.MOVIE_API_KEY}&language=es&append_to_response=external_ids`;

                          //Se hace la peticion a la api
                          axios.get(linkFind).then(response => {
                            //Se obtienen los resultados
                            const film = response.data;

                            //Se arma la url para obtener el trailer de la serie
                            const linkVideo = `https://api.themoviedb.org/3/tv/${film.id}/videos?api_key=${process.env.MOVIE_API_KEY}&language=es`;

                            //Se hace la peticion a la api
                            axios.get(linkVideo).then(responseVideo => {
                              //Se obtienen los resultados
                              var video = responseVideo.data.results[0];

                              //Se cambia el idioma de la serie por su bandera
                              switch (film.original_language) {
                                case "en":
                                  film.original_language = "🇺🇸";
                                  break;
                                case "es":
                                  film.original_language = "🇪🇸";
                                  break;
                                case "fr":
                                  film.original_language = "🇫🇷";
                                  break;
                                case "de":
                                  film.original_language = "🇩🇪";
                                  break;
                                case "it":
                                  film.original_language = "🇮🇹";
                                  break;
                                case "ja":
                                  film.original_language = "🇯🇵";
                                  break;
                                case "pt":
                                  film.original_language = "🇵🇹";
                                  break;
                                case "ru":
                                  film.original_language = "🇷🇺";
                                  break;
                                case "ko":
                                  film.original_language = "🇰🇷";
                              }

                              //Se arma el mensaje
                              let message = "";

                              //Si no existe trailer se envia el mensaje sin trailer
                              if (video === undefined) {
                                message +=
                                  `\n🎬 ${film.name} 🎬` +
                                  `\n\nVer serie 🍿: https://www.imdb.com/title/${film.external_ids.imdb_id}` +
                                  `\n\nFecha de estreno 📅: ${film.first_air_date}` +
                                  `\n\nPuntaje promedio (1-10) 📈: ${film.vote_average}` +
                                  `\n\nConteo de votos 🙋: ${film.vote_count}` +
                                  `\n\nIdioma original 🎙️: ${film.original_language}` +
                                  `\n\nSinopsis 📝: ${film.overview}\n\n`;

                                //Si existe trailer se envia el mensaje con trailer
                              } else {
                                message +=
                                  `\n🎬 ${film.name} 🎬` +
                                  `\n\nVer serie 🍿: https://www.imdb.com/title/${film.external_ids.imdb_id}` +
                                  `\n\nTrailer 🎥: https://www.youtube.com/watch?v=${video.key}` +
                                  `\n\nFecha de estreno 📅: ${film.first_air_date}` +
                                  `\n\nPuntaje promedio (1-10) 📈: ${film.vote_average}` +
                                  `\n\nConteo de votos 🙋: ${film.vote_count}` +
                                  `\n\nIdioma original 🎙️: ${film.original_language}` +
                                  `\n\nSinopsis 📝: ${film.overview}\n\n`;
                              }

                              //Se envia el mensaje
                              ctx.reply(message);
                            });
                          });
                        }
                        //Si no hay resultados se envia un mensaje al usuario
                      })
                      .catch(error => {
                        ctx.reply(
                          `❌ No se han encontrado resultados para: ${serie}. ❌` +
                            "\n\nRecuerda que puedes consultar una serie escribiendo el siguiente ejemplo:" +
                            `\n\nEj: ${botFunction.nickName} Stranger things`
                        );
                      });
                  } catch (error) {
                    ctx.reply(
                      `❌ No se han encontrado resultados para: ${serie}. ❌` +
                        "\n\nRecuerda que puedes consultar una serie escribiendo el siguiente ejemplo:" +
                        `\n\nEj: ${botFunction.nickName} Stranger things`
                    );
                  }
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
      include: [
        {
          model: User,
          attributes: [],
        },
        {
          model: CatStatus,
          attributes: [],
        },
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
      include: [
        {
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
