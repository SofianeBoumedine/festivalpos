import { Order } from "./api/order";
import { autoinject } from "aurelia-framework";
import { Api } from "./api";

@autoinject()
export class Sumup {
    constructor(private api: Api) {
    }

    async redirectToApp(order: Order) {
        const pos = await this.api.getPointOfSale(order.pointOfSaleId).transfer();

        // Example: <a href="sumupmerchant://pay/1.0?affiliate-key=7ca84f17-84a5-4140-8df6-6ebeed8540fc&app-id=com.example.myapp&total=1.23&currency=EUR&title=Taxi Ride&receipt-mobilephone=+3531234567890&receipt-email=customer@mail.com&callback=http://example.com/myapp/mycallback">Start SumUp Payment</a>

        const affiliateKey = "7ca84f17-84a5-4140-8df6-6ebeed8540fc";
        const appId = "com.rmja.festivalpos";
        const total = order.amountDue.toFixed(2); // Has "." as decimal separator
        const title = `Kajfest ${pos.name}`;

        const callbackUrl = `${window.location.origin}/#/checkout/orders/${order.id}/pay/card-callback?amount=${order.amountDue}`;

        if (confirm("Debug?")) {
            if (confirm("Success?")) {
                window.location.href = `${callbackUrl}&smp-status=success&smp-tx-code=123abc`;
            }
            else {
                window.location.href = `${callbackUrl}&smp-status=failed&smp-failure-cause=testfejl&smp-message=fejlbesked&smp-tx-code=123abc`;
            }
        }
        else {
            window.location.href = `sumupmerchant://pay/1.0?affiliate-key=${affiliateKey}&app-id=${appId}&total=${total}&currency=DKK&title=${title}&callback=${encodeURIComponent(callbackUrl)}`;
        }
    }
}