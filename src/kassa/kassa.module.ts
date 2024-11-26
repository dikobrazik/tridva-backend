import {Module} from '@nestjs/common';
import {KassaService} from './kassa.service';

@Module({
  providers: [KassaService],
  exports: [KassaService],
})
export class KassaModule {}
