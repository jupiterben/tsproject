import * as React from "react";
import ViewModel from "../ViewModel/ViewModel";
import { observer } from "mobx-react-lite";
import Stage from "./Stage/Stage";
import styles from "./View.css";

export const STAGE_ID = '__node_editor_stage__'
export const DRAG_CONNECTION_ID = '__node_editor_drag_connection__'
export const CONNECTIONS_ID = '__node_editor_connections__'

interface Prop {
    vm: ViewModel;
}

const View = ({ vm }: Prop) => {
    return <div style={{ height: 600 }}>
        <h1>{vm.secondsPassed}</h1>
        <Stage vm={vm.stageVM}>
            <div className={styles.dragWrapper} id={`${DRAG_CONNECTION_ID}${vm.editorId}`} />
        </Stage>
    </div>
};
export default observer(View);
