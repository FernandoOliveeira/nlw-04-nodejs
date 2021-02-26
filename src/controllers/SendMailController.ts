import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { resolve } from 'path';



class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    // Busca qual usuário receberá a pesquisa
    const user = await usersRepository.findOne({ email });

    if (!user) {
      return response.status(400).json({
        error: "User does not exists !",
      });
    }

    // Busca a pesquisa que será enviada ao usuário
    const survey = await surveysRepository.findOne({ id: survey_id })

    if (!survey) {
      return response.status(400).json({
        error: "Survey does not exists !"
      })
    }

    // Caminho até o template do e-mail
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");


    // Verifica se o usuário já respondeu à pesquisa que será enviada 
    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: user.id, value: null },
      relations: ["user", "survey"],
    });


    // Variaveis que serão enviadas no corpo do e-mail
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL
    }


    // Verifica se o usuário já respondeu à pesquisa que será enviada 
    if (surveyUserAlreadyExists) {
      
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath)

      return response.json(surveyUserAlreadyExists)
    }

    // Salvar as informações na tabela surveyUser
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    })

    await surveysUsersRepository.save(surveyUser);


    // Enviar e-mail para o usuário
    variables.id = surveyUserAlreadyExists.id;
    await SendMailService.execute(email, survey.title, variables, npsPath);


    return response.json(surveyUser);
  }
}


export { SendMailController }
