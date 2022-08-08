import * as React from "react";
import ViewModel from "../ViewModel/ViewModel";
import { observer } from "mobx-react-lite";


interface Prop {
    vm: ViewModel;
}

const View = ({ vm }: Prop) => {
    return <h1>{vm.secondsPassed}</h1>;
};
export default observer(View);
