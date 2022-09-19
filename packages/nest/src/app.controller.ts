import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log(123);
    return this.appService.getHello()
  }

  @Get('/error')
  getError() {
    throw new Error('Source map test')
  }
}
