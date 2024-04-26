import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

const CustomNode = ({
    data,
    isConnectable,
    targetPosition = Position.Right,
    sourcePosition = Position.Left,
}: NodeProps) => {
    return (
        <>
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
            />
            <div>
                {data?.label}
            </div>
            <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
            />
        </>
    );
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);
