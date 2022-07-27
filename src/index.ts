import "reflect-metadata";
import { AppDataSource } from "./db";
import  app from "./app";

async function main() {
    try {
        await AppDataSource.initialize();
        app.listen(3000);
        console.log(`Server escuchando en puerto ${3000}`);
        console.log(`Database online`);
    } catch (error) {
        console.log(`No se ha podido conectar ${error}`);
    }
    
}

main();
