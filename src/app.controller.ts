import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  getHello(): { status: string; version: string } {
    return { status: 'ok', version: '1.0' };
  }
}
