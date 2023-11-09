import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessageWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly userRespository: Repository<User>) { }

    async registerClient(client: Socket, userId: string) {

        const user = await this.userRespository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found!');
        if (!user.isActive) throw new Error('User not active!');

        this.checkUserConnection(user);

        this.connectedClients[client.id] = {
            socket: client,
            user,
        };
    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }

    getUser(clientId: string): User {
        return this.connectedClients[clientId].user;
    }

    private checkUserConnection(user: User) {
        const connection = Object.values(this.connectedClients).find((value) => value.user.id === user.id);
        if (connection) {
            connection.socket.disconnect();
        }
    }

}
