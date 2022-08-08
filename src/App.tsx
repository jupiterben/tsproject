import * as React from "react";
import View from "./View/View";
import ViewModel from "./ViewModel/ViewModel";
import { createRoot } from "react-dom/client";
import Model from './Model/Model';

class App {
    model: Model;
    vm: ViewModel;
    constructor() {
        this.model = new Model();
        this.vm = new ViewModel(this.model);
    }
    Render() {
        const container = document.getElementById("root");
        const root = createRoot(container!);
        root.render(<View vm={this.vm} />);
    }
}

var app = new App();
app.Render();

export default app;
