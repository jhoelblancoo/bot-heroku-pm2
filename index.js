const { Telegraf } = require("telegraf");
const dotenv = require("dotenv").config();

function main() {
    console.log("first");
    //if (ctx.from){
    const bot = new Telegraf(process.env.TOKEN);

    console.log(bot);
    bot.start(ctx => ctx.reply("Bienvenidos al  Bot de nskdj!"));

    bot.hears("hola" || "Hola", ctx => {
        ctx.reply("pruebaaaaa de pm2");
        console.log(ctx.from.id);
    });

    bot.launch();
}

main();