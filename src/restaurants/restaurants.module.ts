import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  // restaurant module안에서 typeOrm으로 각각 restaurant와 CategoryRepository의 DB를 제어하고 싶다면
  // import에 해당 entity들을 추가해줌
  // custom된 CategoryRepository를 사용하기 위해 CategoryRepository를 import함
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  // 위와 비슷한개념으로 이 restaurant모듈 안에서 각각의 resolver와 service를 끌어와 사용하고 싶다면 providers에 추가
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
