import {Controller, Inject} from '@nestjs/common';
import {AttributesService} from './attributes.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('attributes')
@Controller('attributes')
export class AttributesController {
  @Inject(AttributesService)
  private attributesService: AttributesService;
}
