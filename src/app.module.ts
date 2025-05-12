import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { OrdersModule } from './orders/orders.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [ProductModule,  CategoryModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
