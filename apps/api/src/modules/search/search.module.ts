import { Module } from '@nestjs/common'; import { AuthModule } from '../auth/auth.module'; import { AiModule } from '../ai/ai.module'; import { SearchController } from './search.controller'; import { SearchService } from './search.service';
@Module({imports:[AuthModule,AiModule],controllers:[SearchController],providers:[SearchService]}) export class SearchModule {}
