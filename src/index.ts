import "reflect-metadata";
import Server from './entities/Server';
import dotenv from 'dotenv';

async function main() {
    try {
        dotenv.config();
        const server = new Server();
        server.listen();

    } catch (error) {
        console.log(`No se ha podido conectar ${error}`);
    }
}

main();


//Preparar proyecto node en TS: https://www.youtube.com/watch?v=tGJt93O_DMo&ab_channel=FaztCode
//4.40m