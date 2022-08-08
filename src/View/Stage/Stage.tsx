import React from "react";
import * as styles from "./Stage.module.css";

const Stage = () => {
    var scale = 1;
    var translate = { x: 0, y: 0 };

    return (
        <div className={styles.wrapper}>
            <div className={styles.transformWrapper} style={{ transform: `translate(${-translate.x}px, ${-translate.y}px)` }}            >
                <div className={styles.scaleWrapper} style={{ transform: `scale(${scale})` }} />
            </div>
        </div>
    )
}

export default Stage;