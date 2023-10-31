import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async checkHealth() {
    return await this.appService.checkHealth();
  }

  @Post('logger/log-analysis/ai')
  async analyzeLogs() {
    return await this.appService.analyzeLogs();
  }

  @Post('logger/post-logs')
  async postLogs(@Body() logData: any) {
    return await this.appService.postLogs(logData);
  }

  @Post('clear')
  clearLogs() {
    return this.appService.clearLogs();
  }
}
