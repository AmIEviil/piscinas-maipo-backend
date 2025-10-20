import { Module } from '@nestjs/common';
import { RepairsService } from './repairs.service';
import { RepairsController } from './repairs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repair } from './entities/repair.entity';

@Module({
  providers: [RepairsService],
  controllers: [RepairsController],
  imports: [TypeOrmModule.forFeature([Repair])],
  exports: [RepairsService],
})
export class RepairsModule {}
