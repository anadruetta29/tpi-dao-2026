import { CreateOrderReq } from "../dto/order/request/CreateOrderReq";
import { CreateOrderRes } from "../dto/order/response/CreateOrderRes";
import { GetOrderByOrderNumberReq } from "../dto/order/request/GetOrderByOrderNumberReq";
import { GetOrderByOrderNumberRes } from "../dto/order/response/GetOrderByOrderNumberRes";
import { GetAllOrdersReq } from "../dto/order/request/GetAllOrdersReq";
import { GetAllOrdersRes } from "../dto/order/response/GetAllOrdersRes";
import { UpdateOrderStatusReq } from "../dto/order/request/UpdateOrderStatusReq";
import { UpdateOrderStatusRes } from "../dto/order/response/UpdateOrderStatusRes";
import { ApplyOrderDiscountReq } from "../dto/order/request/ApplyOrderDiscountReq";
import { ApplyOrderDiscountRes } from "../dto/order/response/ApplyOrderDiscountRes";
import { DeleteOrderReq } from "../dto/order/request/DeleteOrderReq";
import { DeleteOrderRes } from "../dto/order/response/DeleteOrderRes";

export abstract class OrderRepositoryI {
    abstract createOrder(dto: CreateOrderReq): Promise<CreateOrderRes>;
    abstract getOrderByOrderNumber(dto: GetOrderByOrderNumberReq): Promise<GetOrderByOrderNumberRes>;
    abstract getAllOrders(dto: GetAllOrdersReq): Promise<GetAllOrdersRes>;
    abstract updateOrderStatus(dto: UpdateOrderStatusReq): Promise<UpdateOrderStatusRes>;
    abstract applyOrderDiscount(dto: ApplyOrderDiscountReq): Promise<ApplyOrderDiscountRes>;
    abstract deleteOrder(dto: DeleteOrderReq): Promise<DeleteOrderRes>;
}
