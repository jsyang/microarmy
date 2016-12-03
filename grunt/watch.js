module.exports = {
    options: {
        livereload: false
    },
    js: {
        files: ["src/**/*.js"],
        tasks: "browserify".split(',')
    },
    assets: {
        files: [
            "assets/images/**/*",
            "assets/sounds/**/*"
        ],
        tasks: "compress".split(',')
    }
};