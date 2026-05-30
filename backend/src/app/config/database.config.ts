import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const getSequelizeConfig = (configService: ConfigService): SequelizeModuleOptions => {
    return {
        dialect: "postgres",
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: false,
        dialectOptions: {
            useUTC: false,
            timezone: 'America/Sao_Paulo',
        },
        timezone: 'America/Sao_Paulo',
        models: [],
        logging: false
    };
};