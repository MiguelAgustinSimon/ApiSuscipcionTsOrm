const { getLogger, configure } =require("log4js");

configure({
    appenders:{
        app:{type:'file',filename: "./src/logs/ProductScope.log", pattern: "yyyy-MM-dd-hh"},
        out:{type:'stdout'}
    },
    categories:{
        default:{
            appenders:["app","out"],
            level:"info"
        }
    }
});

const logger=getLogger();

module.exports = {
    //Aca exporto 
    logger
}
