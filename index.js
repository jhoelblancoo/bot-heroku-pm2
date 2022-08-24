const { Telegraf } = require("telegraf");
const dotenv = require("dotenv").config();

const Bot1 = "5469474008:AAHsNkCs06eI2-fxsxbBSRzf-7KLWtJ2r5g";
const Bot2 = "5610536765:AAH4iZ2gqwtV1NyU9ESV_0TGHai9P5Lg1VA";
const Bot3 = "5746503539:AAGIQURCOkb9L6RhQxiYpeLA42OjsAeSwgU";
const BOTS_ARRAY = [
    { BOT_TOKEN: Bot1, BOT_FUNCTIONS: ["hola", "chao"] },
    { BOT_TOKEN: Bot2, BOT_FUNCTIONS: [] },
    { BOT_TOKEN: Bot3, BOT_FUNCTIONS: ["jhoel", "chao"] },
];

function main() {
    BOTS_ARRAY.forEach(element => {
        const BOT = new Telegraf(element.BOT_TOKEN);

        BOT.start(ctx => ctx.reply("Bienvenidos al  Bot de nskdj!"));

        BOT.hears("hola", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2 == "hola"
            );

            if (applyFunction) {
                ctx.reply("Hola estimado usuario!");
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });

        BOT.hears("chao", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2 == "chao"
            );

            if (applyFunction) {
                ctx.reply("chao estimado usuario!");
            } else {
                ctx.reply("Usted no posee esta funcion registrada en botly!");
            }
        });

        BOT.hears("jhoel", ctx => {
            let applyFunction = element.BOT_FUNCTIONS.some(
                element2 => element2 == "jhoel"
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

main();