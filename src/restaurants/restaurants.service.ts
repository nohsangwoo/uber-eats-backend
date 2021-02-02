import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/cetegory.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

// 서비스파일 상용구
@Injectable()
export class RestaurantService {
  constructor(
    // restaurant entiry를 가져와 사용할수있음
    // repository를 가져올때 사용하는 상용구
    // const restaurants = connection.getRepository(Restaunrant); 가 함축돼있는 데코레이터

    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>, // restaurants DB를 사용하겠다는 말
    // Repository<Category>를 extends하고있어서 CategoryRepository를 불러오기만 함
    private readonly categories: CategoryRepository
  ) {}

  async getOrCreate(name: string): Promise<Category> {
    // 카테고리이름을 소문자로 만들고 각각 나눠서 배열로 만들어준다
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.categories.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName })
      );
    }
    return category;
  }

  async createRestaurant(
    // 이 owner는  @AuthUser() 로 인증과정을 거쳐서 전달받은 User정보이다.
    owner: User,
    // Input DTO
    createRestaurantInput: CreateRestaurantInput
    // output DTO
  ): Promise<CreateRestaurantOutput> {
    try {
      // typeOrm 명ㅇ]령어중 create명령어를사용하여 javascript상에서만 존재하는 오브젝트를 생성
      // (아직 DB저장 안함)
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      // 생성된 객체에서 owner를 덮어씌어줌
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
      // 에러롤 수동으로 처리해주는 과정
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }
}
