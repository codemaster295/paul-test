import { Database } from '../database/Database';
import { Logger } from '../logging/Logger';
import { UserRepository } from '../../repositories/UserRepository';
import { PublicationRepository } from '../../repositories/PublicationRepository';
import { AuthService } from '../../services/AuthService';
import { PublicationService } from '../../services/PublicationService';
import { env } from '../../config/environment';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeServices(): void {
    // Initialize infrastructure
    const database = Database.getInstance(env.DATABASE_URL);
    const logger = Logger.getInstance('ContentPublisher');

    // Initialize repositories
    const userRepository = new UserRepository(database);
    const publicationRepository = new PublicationRepository(database);

    // Initialize services
    const authService = new AuthService(userRepository);
    const publicationService = new PublicationService(publicationRepository);

    // Register all services
    this.services.set('database', database);
    this.services.set('logger', logger);
    this.services.set('userRepository', userRepository);
    this.services.set('publicationRepository', publicationRepository);
    this.services.set('authService', authService);
    this.services.set('publicationService', publicationService);
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }

  // Helper methods for common services
  getDatabase(): Database {
    return this.get<Database>('database');
  }

  getLogger(): Logger {
    return this.get<Logger>('logger');
  }

  getAuthService(): AuthService {
    return this.get<AuthService>('authService');
  }

  getPublicationService(): PublicationService {
    return this.get<PublicationService>('publicationService');
  }
}
