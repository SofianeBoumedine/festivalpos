import { connectTo, Store } from "aurelia-store";
import { State, getOrderTotal, getOrderQuantityTotal, resetOrder } from "../state";
import { computedFrom, autoinject, bindable } from "aurelia-framework";
import { Api } from "../api";
import { Router } from "aurelia-router";
import { Order } from "../api/order";
import { Sumup } from "../sumup";

@autoinject()
@connectTo()
export class PayButtonCustomElement {
    private state!: State;
    @bindable() confirm?: () => void | Promise<void>;

    @computedFrom("state")
    get total() {
        if (this.state) {
            return getOrderTotal(this.state);
        }
    }

    get canConfirm() {
        if (this.state) {
            return getOrderQuantityTotal(this.state) > 0;
        }
    }

    constructor(private api: Api, private store: Store<State>, private sumup: Sumup, private router: Router) {
    }

    async doConfirm(method: "card" | "cash" | "account") {
        if (!this.canConfirm) {
            return;
        }

        if (this.confirm) {
            await Promise.resolve(this.confirm());
        }

        const order = await this.api.createOrder({
            terminalId: this.state.terminalId,
            pointOfSaleId: this.state.pointOfSaleId,
            lines: this.state.orderLines
        }).transfer();

        await this.store.dispatch(resetOrder);

        if (method === "card") {
            await this.sumup.redirectToApp(order);
        } else {
            this.router.navigate(`/checkout/orders/${order.id}/pay/${method}`);
        }
    }
}