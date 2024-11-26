import {Controller, Get, Inject, Param} from '@nestjs/common';
import {GeoService} from './geo.service';
import {GetCityPickupPointsParamsDto, GetPickupPointParamsDto} from './dtos';

@Controller('geo')
export class GeoController {
  @Inject(GeoService)
  private geoService: GeoService;

  @Get('/cities')
  getAllCities() {
    return this.geoService.getAllCities();
  }

  @Get('/cities/:id/pickup-points')
  getCityPickupPoints(@Param() params: GetCityPickupPointsParamsDto) {
    return this.geoService.getCityPickupPoints(params.id);
  }

  @Get('/pickup-points/:id')
  getPickupPoint(@Param() params: GetPickupPointParamsDto) {
    return this.geoService.getPickupPoint(params.id);
  }
}
