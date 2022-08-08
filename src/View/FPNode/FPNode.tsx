
import React from "react";
import FNodeVM from '../../ViewModel/FPNodeVM';

interface Prop {
    vm: FNodeVM;
    children: React.ReactNode;
}

const FPNode = ({ vm, children }: Prop) => {
    return (
        <div >
            {children}
        </div>
    )
}

export default FPNode;