import { Connection } from 'typeorm';
import { User } from "../models/user";
import { ConnectionManager } from "./connectionManager";
import { Message } from "../common/message";
import { ResObject } from "../models/ResObject";
import { ValidateUtil } from "../utils/validateUtil";

export class UserService {
    static async checkUser(email: string, pwd: string): Promise<ResObject> {

    }

    static async createUser(name: string, email: string, pwd: string): Promise<ResObject> {
        const isEmailExist = await UserService.IsUserEmailExist(email);
        if (isEmailExist) {
            return { success: false, message: Message.userEmailRepeat };
        }

        let checkRst = ValidateUtil.checkEmail(email);
        checkRst.success && (checkRst = ValidateUtil.checkPassword(pwd));
        if (!checkRst.success) {
            return checkRst;
        }

        const user = new User(name, email, pwd);
        user.save();

        return { success: true, message: Message.userCreateSuccess };
    }

    static async IsUserEmailExist(email: string): Promise<boolean> {

        const connection = await ConnectionManager.getInstance();

        const user = await connection.getRepository('user').findOne({ alias: 'user', where: 'user.email=:email' });

        return user !== undefined;
    }

    static async getUser(userId: string): Promise<User> {
        const connection = await ConnectionManager.getInstance();

        return await connection.getRepository(User)
            .createQueryBuilder("user")
            .innerJoinAndSelect('user.teams', 'team')
            .where(`user.id = :id`)
            .setParameter('id', userId)
            .getOne();
    }
}