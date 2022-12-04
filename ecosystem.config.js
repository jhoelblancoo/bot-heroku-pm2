module.exports = {
    apps: [{
        name: "app",
        script: "./index.js",
        cron_restart: "0 0 * * *",
        watch: true,
        // instances: "max",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
    }, ],
};