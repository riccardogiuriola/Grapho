import { CloseIcon, CopyIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Icon, IconButton, Spacer, Text } from "@chakra-ui/react";
import ReactFlow, { Background, Controls, MiniMap, Panel, Position, useEdgesState, useNodesState } from "reactflow";
import CustomNode from "./CustomNode";
import DownloadButton from './DownloadButton';
import { useEffect, useRef, useState } from "react";
import dagre from "dagre";
import SearchInput from "./SearchInput";

const nodeTypes = {
    custom: CustomNode,
};

export default function Graph(props: { toggleDrawer: any; requests: any; selectedRow: any; }) {

    const { toggleDrawer, requests, selectedRow } = props;
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [copySuccess, setCopySuccess] = useState(false);
    const reactFlowWrapper: any = useRef(null);

    useEffect(() => {
        loadGraph();
    }, [selectedRow]);

    function loadGraph() {
        const { nodes, edges } = getRequestFlowElements(requests[selectedRow].responseData);

        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir: 'LR' });
        graph.setDefaultEdgeLabel(() => ({}));

        function getNodeWidth(label: { props: { children: { props: { children: string[]; }; }[]; }; }, lastMaxWidth: number | undefined = 0) {
            let key = label.props.children[0].props.children[0] + ':';
            let value = '"' + label.props.children[1].props.children[1] + '"';
            let stringLength = key.length + value.length;
            if (stringLength > lastMaxWidth) return stringLength;
            return lastMaxWidth;
        }

        // Add nodes to the graph
        nodes.forEach((node) => {
            let height = 105;
            let lastMaxWidth = 0;
            let labels: any = node.data.label;
            if (labels.length != undefined) {
                height = (labels.length + 2) * 35
                for (let label of labels) {
                    lastMaxWidth = getNodeWidth(label, lastMaxWidth);
                }
            } else {
                lastMaxWidth = getNodeWidth(labels, lastMaxWidth);
            }
            graph.setNode(node.id, { width: lastMaxWidth * 12, height: height }); // Set node width and height
        });

        // Add edges to the graph
        edges.forEach((edge) => {
            graph.setEdge(edge.source, edge.target);
        });

        // Run Dagre layout
        dagre.layout(graph);

        // Update node positions with the layout results
        nodes.forEach((node) => {
            const graphNode = graph.node(node.id);
            node.position = { x: graphNode.x, y: graphNode.y };
        });

        setNodes(nodes);
        setEdges(edges);
    }

    function getRequestFlowElements(
        responseData: any,
    ): { nodes: any[]; edges: any[] } {
        const nodes: any[] = [];
        const edges: any[] = [];

        const traverse = (
            data: any,
            parentId?: string,
        ) => {

            if (typeof data === "object" && data !== null) {
                const stringKeys: string[] = [];
                const objectKeys: string[] = [];

                // Separate keys into string and object keys
                Object.entries(data).forEach(([key, value]) => {
                    if (["string", "boolean", "number"].indexOf(typeof value) > -1) {
                        stringKeys.push(key);
                    } else if (typeof value === "object") {
                        if (value == null) {
                            stringKeys.push(key);
                        } else {
                            objectKeys.push(key);
                        }
                    }
                });

                // Group string values in the same node
                addStringNodes(stringKeys, data, parentId);

                // Recursively traverse object values in a new node
                addObjectNodes(objectKeys, data, parentId);
            }
        };

        const nodeDefaults = {
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
        };

        const addStringNodes = (
            keys: string[],
            data: any,
            parentId: string | undefined,
        ) => {
            if (keys.length > 0) {
                const stringValue = keys
                    .map((key) => {
                        return <Flex>
                            <Text as='b' color="#761CEA">{key}:</Text>
                            <Text color="#535353">"{String(data[key]).substring(0, 32)}{String(data[key]).length > 32 ? "..." : ""}"</Text>
                        </Flex>;
                    }
                    );
                const stringNodeId = `${parentId || "root"}-strings`;
                const stringNode = {
                    id: stringNodeId,
                    type: "default",
                    data: { label: stringValue },
                    style: {
                        width: "auto",
                        textAlign: "left"
                    },
                    ...nodeDefaults
                };
                nodes.push(stringNode);
                if (parentId) {
                    edges.push({
                        id: `${parentId}-${stringNodeId}`,
                        source: parentId,
                        target: stringNodeId,
                        ...nodeDefaults
                    });
                } else {
                    edges.push({
                        id: `${parentId}-${stringNodeId}`,
                        source: parentId,
                        target: stringNodeId,
                        ...nodeDefaults
                    });
                }
            }
        };

        const addObjectNodes = (
            keys: string[],
            data: any,
            parentId: string | undefined,
        ) => {
            keys.forEach((key) => {
                const id = `${parentId || "root"}-${key}`;
                const node = {
                    id,
                    type: "default",
                    data:
                    {
                        label:
                            <Flex>
                                <Text as='b' color="#FF6B00">{key}:</Text>
                                <Text color="#535353">{getObjectLabel(data[key])}</Text>
                            </Flex>
                    },
                    style: {
                        width: "auto",
                        textAlign: "left"
                    },
                    ...nodeDefaults
                };
                nodes.push(node);
                if (parentId) {
                    edges.push({
                        id: `${parentId}-${id}`,
                        source: parentId,
                        target: id,
                        ...nodeDefaults
                    });
                } else {
                    edges.push({
                        id: `${id}-${parentId || "root"}-strings`,
                        source: `${parentId || "root"}-strings`,
                        target: id,
                        ...nodeDefaults
                    });
                }
                traverse(data[key], id); // Recursively traverse object children
            });
        };

        const getObjectLabel = (value: any): string => {
            if (typeof value === "object" && value !== null) {
                return `(${Object.keys(value).length})`;
            }
            return value;
        };

        traverse(responseData);

        return { nodes, edges };
    }

    const searchNodes = (searchQuery: string) => {
        const filteredNodes = nodes.map(node => {
            let containsSearch = false;
            if (searchQuery !== '') {
                const labels: any = node.data.label;
                if (labels.length != undefined) {
                    for (let label of labels) {
                        const key = label.props.children[0].props.children;
                        const value = label.props.children[1].props.children;
                        const regex = new RegExp(searchQuery, 'i'); // 'i' flag for case-insensitive search
                        if (regex.test(key) || regex.test(value)) {
                            containsSearch = true;
                            break;
                        }
                    }
                } else {
                    const key = node.data.label.props.children[0].props.children;
                    const value = node.data.label.props.children[1].props.children;
                    const regex = new RegExp(searchQuery, 'i');
                    if (regex.test(key) || regex.test(value)) {
                        containsSearch = true;
                    }
                }
            }
            return {
                ...node,
                style: {
                    ...node.style,
                    background: containsSearch ? '#FFD700' : 'white',
                }
            };
        });
        setNodes(filteredNodes);
    };


    const handleSearchSubmit = (searchQuery: string) => {
        searchNodes(searchQuery);
    };

    const copyToClipboard = () => {
        const jsonString = JSON.stringify(requests[selectedRow].responseData);
        navigator.clipboard.writeText(jsonString)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch((error) => console.error('Error copying to clipboard:', error));
    };

    return (
        <Box flex="1">
            <div ref={reactFlowWrapper} style={{ width: '100%', height: '100vh' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.1}
                    maxZoom={4}
                >
                    <MiniMap style={{ height: 120 }} zoomable pannable />
                    <Controls />
                    <Background />
                    <Panel position="top-left">
                        <h2>JSON Viewer</h2>
                    </Panel>
                    <Panel position="top-right">
                        <Flex gap="1">
                            <SearchInput handleSearchSubmit={handleSearchSubmit} />
                            {/* <Button
                                p="4"
                                borderRadius="md"
                                boxShadow="md"
                                onClick={copyToClipboard}
                            >
                                <Icon as={CopyIcon} />
                                Copy JSON
                            </Button> */}
                            <DownloadButton />
                            <Button
                                p="4"
                                borderRadius="md"
                                boxShadow="md"
                                onClick={() => toggleDrawer(false)}
                            >
                                <Icon as={CloseIcon} />
                            </Button>
                        </Flex>
                    </Panel>
                </ReactFlow>
            </div>
        </Box >
    )
}