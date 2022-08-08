import React from "react";
import StageVM from '../../ViewModel/FPStageVM';
import * as styles from "./Stage.module.css";
interface Prop {
    vm: StageVM;
    children: React.ReactNode;
}
const Stage = ({ vm, children }: Prop) => {
    var scale = vm.scale;
    var translate = vm.translate;
    return (
        <div className={styles.wrapper}>
            <div className={styles.transformWrapper} style={{ transform: `translate(${-translate.x}px, ${-translate.y}px)` }}            >
                <div className={styles.scaleWrapper} style={{ transform: `scale(${scale})` }}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Stage;