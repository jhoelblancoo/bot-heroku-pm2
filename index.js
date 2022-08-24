const { Telegraf } = require("telegraf");
const dotenv = require("dotenv").config();

function main() {
    //if (ctx.from){
    const bot = new Telegraf(process.env.TOKEN);

    bot.start(ctx => ctx.reply("Bienvenidos al  Bot de nskdj!"));

    bot.hears("hola", ctx => {
        ctx.reply("Hola estimado usuario!");
        console.log(ctx.from.id);
    });

    bot.hears("chao", ctx => {
        ctx.reply("chao estimado usuario!");
        console.log(ctx.from.id);
    });

    bot.hears("jhoel", ctx => {
        ctx.reply("Hola jhoel!");
        console.log(ctx.from.id);
    });

    bot.launch();
}

main();