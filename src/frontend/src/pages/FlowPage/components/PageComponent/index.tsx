import _, { set } from "lodash";
import { useContext, useRef, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  OnSelectionChangeParams,
  useNodesState,
  useEdgesState,
  useReactFlow,
  EdgeChange,
  Connection,
  addEdge,
  NodeDragHandler,
  SelectionDragHandler,
  OnEdgesDelete,
  Edge,
  updateEdge,
  Background,
  Controls,
  NodeChange,
  BaseEdge,
  EdgeLabelRenderer,
} from "reactflow";
import GenericNode from "../../../../CustomNodes/GenericNode";
import Chat from "../../../../components/chatComponent";
import { alertContext } from "../../../../contexts/alertContext";
import { locationContext } from "../../../../contexts/locationContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import { typesContext } from "../../../../contexts/typesContext";
import { APIClassType } from "../../../../types/api";
import { FlowType, NodeType } from "../../../../types/flow";
import { isValidConnection } from "../../../../utils";
import ConnectionLineComponent from "../ConnectionLineComponent";
import ExtraSidebar from "../extraSidebarComponent";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import { PopUpContext } from "../../../../contexts/popUpContext";
import EditLinkModal from "../../../../modals/editLinkModal";
import ErrorAlert from "../../../../alerts/error";

const nodeTypes = {
  genericNode: GenericNode,
};

export default function Page({ flow }: { flow: FlowType }) {
  let {
    updateFlow,
    disableCopyPaste,
    addFlow,
    getNodeId,
    paste,
    lastCopiedSelection,
    setLastCopiedSelection,
    tabsState,
    saveFlow,
    setTabsState,
    tabId,
  } = useContext(TabsContext);
  const { types, reactFlowInstance, setReactFlowInstance, templates } =
    useContext(typesContext);
  const reactFlowWrapper = useRef(null);
  const { openPopUp } = useContext(PopUpContext)


  const { takeSnapshot, undo } = useContext(undoRedoContext);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastSelection, setLastSelection] =
    useState<OnSelectionChangeParams>(null);


  useEffect(() => {
    // console.log(flow);
  }, [])

  useEffect(() => {
    // this effect is used to attach the global event handlers

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "c" &&
        lastSelection &&
        !disableCopyPaste
      ) {
        event.preventDefault();
        setLastCopiedSelection(_.cloneDeep(lastSelection));
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "v" &&
        lastCopiedSelection &&
        !disableCopyPaste
      ) {
        event.preventDefault();
        let bounds = reactFlowWrapper.current.getBoundingClientRect();
        paste(lastCopiedSelection, {
          x: position.x - bounds.left,
          y: position.y - bounds.top,
        });
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "g" &&
        lastSelection
      ) {
        event.preventDefault();
        // addFlow(newFlow, false);
      }
    };
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [position, lastCopiedSelection, lastSelection]);

  const [selectionMenuVisible, setSelectionMenuVisible] = useState(false);

  const { setExtraComponent, setExtraNavigation } = useContext(locationContext);
  const { getIntersectingNodes } = useReactFlow();
  const { setErrorData } = useContext(alertContext);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow.data?.nodes ?? [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flow.data?.edges ?? [],
  );
  const { setViewport } = useReactFlow();
  const edgeUpdateSuccessful = useRef(true);
  useEffect(() => {
    if (reactFlowInstance && flow) {
      flow.data = reactFlowInstance.toObject();
      updateFlow(flow);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);
  //update flow when tabs change
  useEffect(() => {
    setNodes(flow?.data?.nodes ?? []);
    setEdges(flow?.data?.edges ?? []);
    if (reactFlowInstance) {
      setViewport(flow?.data?.viewport ?? { x: 1, y: 0, zoom: 0.5 });
      reactFlowInstance.fitView();
    }
  }, [flow, reactFlowInstance, setEdges, setNodes, setViewport]);
  //set extra sidebar
  useEffect(() => {
    setExtraComponent(<ExtraSidebar />);
    setExtraNavigation({ title: "Components" });
  }, [setExtraComponent, setExtraNavigation]);

  const onEdgesChangeMod = useCallback(
    (s: EdgeChange[]) => {
      onEdgesChange(s);
      setNodes((x) => {
        let newX = _.cloneDeep(x);
        return newX;
      });
      setTabsState((prev) => {
        return {
          ...prev,
          [tabId]: {
            isPending: true,
          },
        };
      });
    },
    [onEdgesChange, setNodes, setTabsState, tabId],
  );

  const onNodesChangeMod = useCallback(
    (s: NodeChange[]) => {
      onNodesChange(s);
      setTabsState((prev) => {
        return {
          ...prev,
          [tabId]: {
            isPending: true,
          },
        };
      });
    },
    [onNodesChange, setTabsState, tabId],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            style: { stroke: "inherit" },
            className:
              params.targetHandle.split("|")[0] === "Text"
                ? "stroke-foreground edge-cust mt-2"
                : "stroke-foreground edge-cust mt-2",
            animated: params.targetHandle.split("|")[0] === "Text",
          },
          eds,
        ),
      );
      setNodes((x) => {
        let newX = _.cloneDeep(x);
        return newX;
      });
    },
    [setEdges, setNodes, takeSnapshot],
  );

  // const nodeInitialPosition = useRef<any>()

  const onNodeDragStart: NodeDragHandler = useCallback((event: React.DragEvent, node: NodeType) => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  const onNodeDragStop = useCallback((event: React.DragEvent, node: NodeType) => {
    if (getIntersectingNodes(node).length) {
      undo() // undo if nodes intersect
      setErrorData({ title: "Nodes can't intersect!" })
    }
  }, [takeSnapshot])

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    // 👇 make dragging a selection undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    // 👇 make deleting edges undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      takeSnapshot();

      // Get the current bounds of the ReactFlow wrapper element
      const reactflowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Extract the data from the drag event and parse it as a JSON object
      let data: { type: string; node?: APIClassType } = JSON.parse(
        event.dataTransfer.getData("json"),
      );


      // If data type is not "chatInput" or if there are no "chatInputNode" nodes present in the ReactFlow instance, create a new node
      // Calculate the position where the node should be created
      const position = reactFlowInstance.project({
        x: event.clientX - reactflowBounds.left,
        y: event.clientY - reactflowBounds.top,
      });

      // Generate a unique node ID
      let { type } = data;
      let newId = getNodeId(type);
      let newNode: NodeType;

      if (tabId === "GLOBAL") {
        setErrorData({title: "You can't add new nodes on GLOBAL flow!"})
        return
      }

      if (data.node.nodes !== undefined) {
        const resultNodes = []
        for (let item = 0; item < data.node.nodes.length; item++) {
          const element = data.node.nodes[item]
          // console.log(element)
          let newNode: NodeType;
          newNode = {
            id: getNodeId(element.base_classes[0]),
            type: "genericNode",
            position: { x: position.x + 400 * item, y: position.y },
            data: {
              node: element,
              id: getNodeId(element.base_classes[0]),
              value: null,
              type: element.base_classes[0]
            }
          }
          // setNodes((nds) => nds.concat(newNode))
          resultNodes.push(newNode)
        }
        for (let node of resultNodes) {
          setNodes((nds) => {
            // console.log(nds)
            return nds.concat(node)
          })
        }
        // setNodes((nds) => {
        //   return [...nds, ...resultNodes]
        // })
      }
      else if (data.type !== "groupNode") {
        // Create a new node object
        newNode = {
          id: newId,
          type: "genericNode",
          position,
          data: {
            ...data,
            id: newId,
            value: null,
          },
        };
        setNodes((nds) => nds.concat(newNode));
      } else {
        // Create a new node object
        newNode = {
          id: newId,
          type: "groupNode",
          position,
          data: {
            ...data,
            id: newId,
            value: null,
          },
        };

        setNodes((nds) => nds.concat(newNode));
        // Add the new node to the list of nodes in state
      }

      if (data.node.base_classes[0] == 'links') {
        openPopUp(<EditLinkModal data={newNode.data} />)
      }

    },
    // Specify dependencies for useCallback
    [getNodeId, reactFlowInstance, setErrorData, setNodes, takeSnapshot],
  );

  useEffect(() => {
    return () => {
      if (tabsState && tabsState[flow.id]?.isPending) {
        saveFlow(flow);
      }
    };
  }, []);

  const onDelete = useCallback(
    (mynodes) => {
      takeSnapshot();
      setEdges(
        edges.filter(
          (ns) =>
            !mynodes.some((n) => ns.source === n.id || ns.target === n.id),
        ),
      );
    },
    [takeSnapshot, edges, setEdges],
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (isValidConnection(newConnection, reactFlowInstance)) {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
      }
    },
    [],
  );

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const [selectionEnded, setSelectionEnded] = useState(false);

  const onSelectionEnd = useCallback(() => {
    setSelectionEnded(true);
  }, []);
  const onSelectionStart = useCallback(() => {
    setSelectionEnded(false);
  }, []);

  // Workaround to show the menu only after the selection has ended.
  useEffect(() => {
    if (selectionEnded && lastSelection && lastSelection.nodes.length > 1) {
      setSelectionMenuVisible(true);
    } else {
      setSelectionMenuVisible(false);
    }
  }, [selectionEnded, lastSelection]);

  const onSelectionChange = useCallback((flow) => {
    setLastSelection(flow);
  }, []);

  const { setDisableCopyPaste } = useContext(TabsContext);


  return (
    <div className="flex h-full overflow-hidden">
      <ExtraSidebar />
      {/* Main area */}
      <main className="flex flex-1">
        {/* Primary column */}
        <div className="h-full w-full">
          <div className="h-full w-full" ref={reactFlowWrapper}>
            {Object.keys(templates).length > 0 &&
              Object.keys(types).length > 0 ? (
              <div className="h-full w-full">
                <ReactFlow
                  nodes={nodes}
                  onMove={() => {
                    updateFlow({
                      ...flow,
                      data: reactFlowInstance.toObject(),
                    });
                  }}
                  edges={edges}
                  onPaneClick={() => {
                    // setDisableCopyPaste(false); FIXME: was active
                  }}
                  onPaneMouseLeave={() => {
                    // setDisableCopyPaste(true); FIXME: was active
                  }}
                  onPaneMouseEnter={() => {
                    // setDisableCopyPaste(false); FIXME: was active
                  }}
                  onNodesChange={onNodesChangeMod}
                  onEdgesChange={onEdgesChangeMod}
                  onConnect={disableCopyPaste ? () => { } : onConnect}
                  disableKeyboardA11y={true}
                  onLoad={setReactFlowInstance}
                  onInit={setReactFlowInstance}
                  nodeTypes={nodeTypes}
                  onEdgeUpdate={disableCopyPaste ? () => { } : onEdgeUpdate}
                  onEdgeUpdateStart={disableCopyPaste ? () => { } : onEdgeUpdateStart}
                  onEdgeUpdateEnd={onEdgeUpdateEnd}
                  onNodeDragStart={onNodeDragStart}
                  onNodeDragStop={onNodeDragStop}
                  onSelectionDragStart={onSelectionDragStart}
                  onSelectionEnd={onSelectionEnd}
                  onSelectionStart={onSelectionStart}
                  onEdgesDelete={onEdgesDelete}
                  connectionLineComponent={ConnectionLineComponent}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onNodesDelete={onDelete}
                  onSelectionChange={onSelectionChange}
                  nodesDraggable={!disableCopyPaste}
                  panOnDrag={true} // FIXME: TEST {!disableCopyPaste} was
                  zoomOnDoubleClick={!disableCopyPaste}
                  selectNodesOnDrag={false}
                  className="theme-attribution"
                  minZoom={0.01}
                  maxZoom={8}
                >
                  <Background className="" />
                  <Controls
                    className="bg-muted fill-foreground stroke-foreground text-primary [&>button]:border-b-border hover:[&>button]:bg-border"
                  ></Controls>
                </ReactFlow>
                <Chat flow={flow} reactFlowInstance={reactFlowInstance} />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
