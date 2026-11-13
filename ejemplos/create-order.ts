import { OrderRepositoryI } from "../../repositories/order";
import { Order } from "../../entities/order";

export interface CreateOrderCommand {
    customer: {
        name: string;
        email: string;
        whatsapp: string;
        dni?: string | null;
    };
    shippingType: string;
    paymentType?: string;
    address?: {
        postalCode?: string | null;
        street?: string | null;
        number?: string | null;
        floorApartment?: string | null;
        city?: string | null;
        province?: string | null;
        betweenStreets?: string | null;
    } | null;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    notes?: string | null;
    discountCode?: string | null;
}

export interface CreateOrderResult {
    order: Order;
}

export class CreateOrderUseCase {

    private readonly orderRepository: OrderRepositoryI;

    constructor(orderRepository: OrderRepositoryI) {
        this.orderRepository = orderRepository;
    }

    public async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
        const response = await this.orderRepository.createOrder({
            customer: command.customer,
            shippingType: command.shippingType,
            paymentType: command.paymentType,
            address: command.address,
            items: command.items,
            notes: command.notes,
            discountCode: command.discountCode
        });

        return {
            order: response.order
        };
    }

}
