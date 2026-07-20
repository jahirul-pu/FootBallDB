import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { PersonsRepository } from './persons.repository';
// Note: We will import CacheModule, DatabaseModule, and AuditModule in the main AppModule globally,
// or we can import them here if they are not global. Assuming they are global or imported as needed.

@Module({
  controllers: [PersonsController],
  providers: [PersonsService, PersonsRepository],
  exports: [PersonsService],
})
export class PersonsModule {}
