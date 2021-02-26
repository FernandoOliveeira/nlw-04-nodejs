import { Request, Response } from "express";
import { getCustomRepository, RepositoryNotTreeError } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from 'yup';


class UserController {

    async create(request: Request, response: Response) {
        const {name, email} = request.body;

        // Validação dos campos nome e email
        const schema = yup.object().shape({
            name: yup.string().required(),
            email: yup.string().email().required(),            
        })

        try{
            await schema.validate(request.body, {abortEarly: false})
        }catch(err){
            return response.status(400).json({error: err})
        }
        


        const usersRepository = getCustomRepository(UsersRepository);
        // SELECT * FROM USERS WHERE EMAIL = EMAIL
        const userAlreadyExists = await usersRepository.findOne({
            email
        });

        if(userAlreadyExists){
            return response.status(400).json({
                error: "User already exists !",
            })
        }

        const user  = usersRepository.create({
            name, email
        });

        // Salva o usuário no banco de dados
        await usersRepository.save(user);

        return response.status(201).json(user);

    }
}

export { UserController };

