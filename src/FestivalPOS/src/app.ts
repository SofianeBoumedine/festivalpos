import { autoinject, PLATFORM } from "aurelia-framework";
import { RouteConfig, RouterConfiguration, Router } from "aurelia-router";
import { Store, MiddlewarePlacement, logMiddleware, LogLevel, localStorageMiddleware, rehydrateFromLocalStorage } from "aurelia-store";
import { State, addProductOrderLine, resetOrder, removeOrderLine, updateCurrentMisc, addCurrentMiscOrderLine, setup, ensureValidState } from "./state";

import { routes as settingsRoutes } from "./settings/router";

const routes: RouteConfig[] = [
    { route: "", redirect: "sale" },
    { route: "sale", name: "sale", moduleId: PLATFORM.moduleName("./sale/router", "sale"), nav: true, title: "Salg" },
    { route: "checkout", name: "checkout", moduleId: PLATFORM.moduleName("./checkout/router", "checkout"), title: "Betaling" },
    { route: "accounts", name: "accounts", moduleId: PLATFORM.moduleName("./accounts/router", "accounts"), nav: true, title: "Konti" },
    { route: "alarms", name: "alarms", moduleId: PLATFORM.moduleName("./alarms/router", "alarms"), nav: true, title: "Alarmeringer" },
    { route: "statistics", name: "statistics", moduleId: PLATFORM.moduleName("./statistics/router", "statistics"), nav: true, title: "Statistik" },
    { route: "setup", name: "setup", moduleId: PLATFORM.moduleName("./setup", "setup"), nav: true, title: "Opsætning" },
    { route: "settings", name: "settings", moduleId: PLATFORM.moduleName("./settings/router", "settings"), nav: true, title: "Indstillinger", settings: { childRoutes: settingsRoutes } },
];

@autoinject()
export class App {
    router!: Router;

    constructor(private store: Store<State>) {
        store.registerMiddleware(logMiddleware, MiddlewarePlacement.After, { logType: LogLevel.log });
        store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key: "festivalpos-state" });

        store.registerAction("EnsureValidState", ensureValidState);
        store.registerAction("Setup", setup);
        store.registerAction("ResetOrder", resetOrder);
        store.registerAction("UpdateCurrentMisc", updateCurrentMisc);
        store.registerAction("AddProductOrderLine", addProductOrderLine);
        store.registerAction("AddCurrentMiscOrderLine", addCurrentMiscOrderLine);
        store.registerAction("RemoveOrderLine", removeOrderLine);
        store.registerAction('Rehydrate', rehydrateFromLocalStorage);
    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.map(routes);
        this.router = router;
    }

    async activate() {
        await this.store.dispatch(rehydrateFromLocalStorage, "festivalpos-state");
        await this.store.dispatch(ensureValidState);
    }
}