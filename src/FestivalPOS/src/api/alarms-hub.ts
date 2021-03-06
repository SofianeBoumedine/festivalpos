import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@aspnet/signalr";
import { AlarmEvent } from "./alarms";
import { EventAggregator } from "aurelia-event-aggregator";
import { modelBind } from "ur-json";
import { autoinject } from "aurelia-framework";

@autoinject()
export class AlarmsHub {
    private connection: HubConnection;
    private connectPromise?: Promise<void>;
    private connectedUsers = 0;
    
    constructor(eventAggregator: EventAggregator) {
        this.connection = new HubConnectionBuilder()
            .withUrl("/alarms")
            .build();

        this.connection.on("event-created", (event: any) => {
            event = modelBind(AlarmEvent, event);
            eventAggregator.publish(new EventCreated(event));
        });
    }

    async connect() {
        if (!this.connectPromise) {
            this.connectPromise = this.connection.start();
        }

        await this.connectPromise;

        this.connectedUsers++;
    }

    async disconnect() {
        if (--this.connectedUsers === 0) {
            await this.connection.stop();
        }
    }
}

export class EventCreated {
    constructor(public event: AlarmEvent) {
    }
}