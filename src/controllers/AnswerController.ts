import { Request, Response } from "express";
import { getCustomRepository, RepositoryNotTreeError } from "typeorm";
import { SurveyUsersRepository } from "../repositories/SurveysUsersRepository";


class AnswerController {

    async execute(request: Request, response: Response){
        const { value } = request.params;
        const { u } = request.query;

        const surveysUsersRepository = getCustomRepository(SurveyUsersRepository);

        const surveyUser = await surveysUsersRepository.findOne({
            id: String(u)
        });

        // Verifica se o surveyUser existe
        if(!surveyUser){
            return response.status(400).json({
                error: "Survey user does not exist"
            })
        }

        surveyUser.value = Number(value);


        await surveysUsersRepository.save(surveyUser);

        return response.json(surveyUser)
    }
}


export { AnswerController }