import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const getTypeOrmConfig = (): DataSourceOptions => {
  // Check if Neon connection string is provided
  const neonConnectionString = configService.get('DATABASE_URL');
  
  if (neonConnectionString) {
    // Use Neon connection string
    return {
      type: 'postgres',
      url: neonConnectionString,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false, // Required for Neon
      },
    };
  }

  // Fallback to individual environment variables (for local development)
  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') || '5432', 10),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
  };
};

export default new DataSource(getTypeOrmConfig()); 