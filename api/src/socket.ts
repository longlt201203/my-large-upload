import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";

export class SocketSingleton {
    private static io: SocketServer;
    static init(app: HttpServer) {
        const io = new SocketServer(app, {
            cors: {
                origin: '*'
            }
        });
    
        io.of("/socket").on("connection", (socket) => {
            this.initSocket(socket);
        });

        this.io = io;
    }
    static getInstance() {
        return this.io;
    }

    private static initSocket(socket: Socket) {
        console.log(`Initializing socket ${socket.id}...`);

        socket.on("ping", () => {
            socket.emit("pong");
        });

        socket.on("disconnect", (reason) => {
            console.log(`Socket ${socket.id} disconnected!`);
            console.log(reason);
        })
    }
}