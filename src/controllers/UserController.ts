import { Request, Response } from "express";
import { getCustomRepository, RepositoryNotTreeError } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from 'yup';
import { AppError } from "../errors/AppError";


class UserController {

    async create(request: Request, response: Response) {
        const { name, email } = request.body;

        // Validação dos campos nome e email
        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required(),
        })

        try {
            await schema.validate(request.body, { abortEarly: false })
        } catch (err) {
            throw new AppError(err);
        }



        const usersRepository = getCustomRepository(UsersRepository);
        // SELECT * FROM USERS WHERE EMAIL = EMAIL
        const userAlreadyExists = await usersRepository.findOne({
            email
        });

        // Caso o email já esteja cadastrado
        if (userAlreadyExists) {
            throw new AppError("User already exists !");
        }

        // Salva o usuário no banco de dados
        const user = usersRepository.create({
            name, email
        });
        await usersRepository.save(user);

        return response.status(201).json(user);

    }
}

export { UserController };

