import * as React from "react";
import ViewModel from "../ViewModel/ViewModel";
import { observer } from "mobx-react-lite";
import Stage from "./Stage/Stage";

interface Prop {
    vm: ViewModel;
}

const View = ({ vm }: Prop) => {
    return <React.Fragment>
        <h1>{vm.secondsPassed}</h1>
        <Stage></Stage>
    </React.Fragment>
};
export default observer(View);
