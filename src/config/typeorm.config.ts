import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const getTypeOrmConfig = (): DataSourceOptions => {
  const neonConnectionString = configService.get('DATABASE_URL');
  
  if (neonConnectionString) {
    return {
      type: 'postgres',
      url: neonConnectionString,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }


  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('POSTGRES_PORT') || '5432', 10),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: true,
  };
};

export default new DataSource(getTypeOrmConfig()); 