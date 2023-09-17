import {
  classNames,
  nodeColors,
  nodeIconsLucide,
  titleNodeColors,
  titleTextNodeColors,
  toTitleCase,
} from "../../utils";
import ParameterComponent from "./components/parameterComponent";
import { typesContext } from "../../contexts/typesContext";
import React, { useContext, useState, useEffect, useRef, useId } from "react";
import { FlowType, NodeDataType, NodeType } from "../../types/flow";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import NodeModal from "../../modals/NodeModal";
import Tooltip from "../../components/TooltipComponent";
import { Handle, NodeToolbar, Position, useReactFlow } from "reactflow";
import NodeToolbarComponent from "../../pages/FlowPage/components/nodeToolbarComponent";
import ShadTooltip from "../../components/ShadTooltipComponent";
import { useSSE } from "../../contexts/SSEContext";
import { Input } from "../../components/ui/input";
import InputComponent from "../../components/inputComponent";
import { InputBase } from "@mui/material";
import { useOnClickOutside } from "../../alerts/hooks/useOnClickOutside";
import { CheckedIcon } from "../../icons/CheckedIcon";
import { Info_Small_Icon } from "../../icons/InfoSmall_Icon";
import { PreArrowIcon } from "../../icons/PreArrowIcon";
import { ConditionClassType } from "../../types/api";
import { LinkComponent } from "./components/linkComponent";
import { TabsContext } from "../../contexts/tabsContext";
import { LinksListComponent } from "./components/linksListComponent";
import EditConditionModal from "../../modals/editConditionModal";
import { Badge, BadgeProps } from "../../components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { ConditionPlusIcon } from "../../icons/ConditionPlus";
import InputConditionsModal from "../../modals/inputConditionsModal";
import { EditLinkIcon } from "../../icons/EditLinkIcon";
import { Links_ } from "../../icons/Links";
import { darkContext } from "../../contexts/darkContext";

export default function GenericNode({
  data,
  selected,
}: {
  data: NodeDataType;
  selected: boolean;
}) {

  const [activePreRes, setActivePreRes] = useState<string[]>([])
  const [activePreTrans, setActivePreTrans] = useState<string[]>([])

  useEffect(() => {
  }, [activePreRes, activePreTrans])


  const { reactFlowInstance, setReactFlowInstance } =
    useContext(typesContext);
  const { setErrorData } = useContext(alertContext);
  const { closePopUp, openPopUp } = useContext(PopUpContext);
  const showError = useRef(true);
  const { types, deleteNode } = useContext(typesContext);
  const { flows, tabId } = useContext(TabsContext)
  const { setViewport, getEdges, setEdges, setNodes } = useReactFlow();
  const navigate = useNavigate()
  const edges = getEdges()

  const goToNodeHandler = (currFlow: FlowType, nodeID: string) => {
    navigate(`/flow/${flows.find((flow) => currFlow.name == flow.name).id}`)
    const currNode: NodeType = currFlow.data.nodes.find((node) => node.data.id == nodeID)
    setTimeout(() => {
      const nodes = reactFlowInstance.getNodes()
      let node = nodes.find((node) => node.id == currNode.id)
      reactFlowInstance.fitBounds({ x: currNode.position.x, y: currNode.position.y, width: node.width, height: node.height })
      node.selected = true
    }, 50);
  }

  const [links, setLinks] = useState<any>()

  useEffect(() => {
    if (data.node.base_classes[0] == 'links') {
      data.node.from_links = edges.filter((edge) => edge.target == data.id).map((edge) => {
        return {
          node: edge.source,
          condition: flows.find((flow) => flow.data.nodes.find((node: NodeType) => node.data.id == edge.source)).data.nodes.find((node: NodeType) => node.data.id == edge.source).data.node.conditions.find((cnd) => `condition${cnd.conditionID}` == edge.sourceHandle.split('|')[1]).name
        }
      })
      // console.log(data.node.from_links)
    }
  }, [setEdges, setNodes, edges.length])


  const [conditions, setConditions] = useState<any[]>(data.node.conditions ? data.node.conditions.map((condition, idx) => {
    return <ParameterComponent
      data={data}
      color={
        nodeColors[types.default_nodes] ??
        nodeColors.unknown
      }
      title={condition.name}
      info={''}
      name={condition.name}
      tooltipTitle={data.type}
      required={true}
      id={data.id + "|" + `condition${condition.conditionID}` + '|' + data.id}
      left={condition.left}
      type={`condition`}
      key={data.id + 'condition' + `${idx}`}
      priority={condition.priority}
      conditionID={condition.conditionID}
      transitionType={condition.transitionType}
    />
  }) : [])
  useEffect(() => {
    setConditions(data.node.conditions ? data.node.conditions.map((condition, idx) => {
      return <ParameterComponent
        data={data}
        color={
          nodeColors[types.default_nodes] ??
          nodeColors.unknown
        }
        title={condition.name}
        info={''}
        name={condition.name}
        tooltipTitle={data.type == 'default_node' || data.type == 'llm_node' ? 'default_node' : data.type == 'default_link' ? 'default_node' : 'default_node'}
        required={true}
        id={data.id + "|" + `condition${condition.conditionID}` + '|' + data.id}
        left={condition.left}
        type={`condition`}
        key={data.id + 'condition' + `${idx}`}
        priority={condition.priority}
        conditionID={condition.conditionID}
        transitionType={condition.transitionType}
      />
    }) : [])
  }, [flows])
  const [conditionCounter, setConditionCounter] = useState(conditions.length)


  const [name, setName] = useState('')
  const { dark } = useContext(darkContext)
  const [nameInput, setNameInput] = useState(false)
  // any to avoid type conflict
  const Icon: any =
    nodeIconsLucide[data.type] || nodeIconsLucide[types[data.type]];
  const [validationStatus, setValidationStatus] = useState(null);
  // State for outline color
  const { sseData, isBuilding } = useSSE();
  const refHtml = useRef(null);
  const [inputLinks, setInputLinks] = useState(flows.filter((flow) => flow.data?.nodes?.find((node: NodeType) => node?.data?.node?.links?.find((link) => link.to == data.id))).map((flow) => {
    const sourceLinks = flow.data.nodes.filter((node: NodeType) => node.data.node.links?.find((link) => link.to == data.id))
    const p = sourceLinks.map((sourceLink) => flow.data.nodes.filter((node: NodeType) => node.id == edges.find((edge) => edge.target == sourceLink.id)?.source))
    const sourceNodes = sourceLinks.map((sourceLink: NodeType) => sourceLink.data.node.from_links)
    return { flow: flow.name, sourceLinks, sourceNodes }
  }))

  // console.log(inputLinks);
  const [pre_responses, setPre_responses] = useState(data.node?.pre_responses?.length ? data.node.pre_responses : [])
  const [pre_transitions, setPre_transitions] = useState(data.node?.pre_transitions?.length ? data.node.pre_transitions : [])

  useEffect(() => {
    setPre_responses(data.node?.pre_responses?.length ? data.node.pre_responses : [])
    setPre_transitions(data.node?.pre_transitions?.length ? data.node.pre_transitions : [])
  }, [data.node?.pre_responses?.length, data.node?.pre_transitions?.length])


  useOnClickOutside(refHtml, () => {
    setNameInput(false)
  })

  useEffect(() => {
    setName(data.node.display_name)
  }, [])

  useEffect(() => {
    if (data.node.base_classes[0] == 'default_node') {
      if (data.node.conditions?.filter((condition) => condition.APIKey).length && data.node.conditions?.filter((condition) => condition.llm_model).length && data.node.conditions?.filter((condition) => condition.prompt).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'links') {
      if (data.node.links?.filter((link) => link.to).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'fallback_node') {
      if (data.node.template['response']?.value.length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'llm_node') {
      if (Object.values(data.node.template).filter((template) => template.value) && data.node.conditions?.filter((condition) => condition.APIKey).length && data.node.conditions?.filter((condition) => condition.llm_model).length && data.node.conditions?.filter((condition) => condition.prompt).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'fallback_node') {
      if (data.node.template['response']?.value.length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }

    if (data.node.base_classes[0] == 'start_node') {
      if (data.node.template['response']?.value.length && data.node.conditions?.filter((condition) => condition.APIKey).length && data.node.conditions?.filter((condition) => condition.llm_model).length && data.node.conditions?.filter((condition) => condition.prompt).length) {
        setValidationStatus({ valid: true })
      } else {
        setValidationStatus(null)
      }
    }
  }, [data.node.conditions, closePopUp, data.node.template['response']?.value, data.node.links])

  const handleClassNameForNodeName = () => {
    // switch (data.node.base_classes[0]) {
    //   case "default_node": return "bg-[#198BF6] text-white border-transparent"
    //   case "links": return "bg-[#F5B85A] border-transparent"
    //   case "fallback_node": return "bg-[#FF3434] text-[white] border-transparent"
    //   case "start_node": return "bg-[#00CC99] text-[white] border-transparent"
    //   case "llm_node": return "bg-[#7000FF] text-[white] border-transparent"
    // }
    return ""
  }

  if (!Icon) {
    if (showError.current) {
      setErrorData({
        title: data.type
          ? `The ${data.type} node could not be rendered, please review your json file`
          : "There was a node that can't be rendered, please review your json file",
      });
      showError.current = false;
    }
    deleteNode(data.id);
    return;
  }

  useEffect(() => { }, [closePopUp, data.node.template]);



  const [nodeParamsList, setNodeParamsList] = useState(Object.keys(data.node.template)
    .filter((t) => t.charAt(0) !== "_")
    .map((t: string, idx) => (
      <div key={idx}>
        {data.node.template[t].show &&
          !data.node.template[t].advanced && data.node.template[t].name == 'response' ? (
          <>

            {pre_responses.length > 1 ? (
              <div className="flex flex-row flex-nowrap px-4 items-center ">
                {data.node.base_classes[0] == 'default_node' &&
                  <div className="flex flex-row flex-nowrap h-full w-max items-center">
                    <Info_Small_Icon />
                    <PreArrowIcon className="" width="9" height="13" viewbox="24 24" />
                  </div>
                }
                <div className="flex flex-wrap flex-row items-center">
                  {pre_responses.length && data.node.template[t].name == 'response' ? pre_responses.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                    // if (!activePreRes.includes(pre)) {
                    //   setActivePreRes((prev) => [...prev, pre])
                    // } else if (activePreRes.includes(pre)) {
                    //   setActivePreRes((prev) => prev.filter((item) => item !== pre))
                    // }
                  }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreRes.includes(pre.name) ? 'bg-black' : '')}> {pre.name} </span>) : <></>}
                </div>
              </div>
            ) : <></>}
            <ParameterComponent
              data={data}
              color={
                nodeColors[types[data.node.template[t].type]] ??
                nodeColors.unknown
              }
              title={
                data.node.template[t].display_name
                  ? data.node.template[t].display_name
                  : data.node.template[t].name
                    ? toTitleCase(data.node.template[t].name)
                    : toTitleCase(t)
              }
              info={data.node.template[t].info}
              name={t}
              tooltipTitle={data.node.template[t].type}
              required={data.node.template[t].required}
              id={data.node.template[t].type + "|" + t + "|" + data.id}
              left={data.node.base_classes[0] === "start_node" && data.node.template[t].name !== "response" ? false : true}
              type={data.node.template[t].type}
            />
            {pre_transitions.length > 0 && (
              <div className="flex flex-row flex-nowrap px-4 items-center ">
                {data.node.base_classes[0] == 'default_node' &&
                  <div className="flex flex-row flex-nowrap h-full w-max items-center">
                    <Info_Small_Icon />
                    <PreArrowIcon className="h-full" width="9" height="13" viewbox="24 24" />
                  </div>
                }
                <div className="flex flex-wrap flex-row items-center">
                  {pre_transitions.length && data.node.template[t].name == 'response' ? pre_transitions.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                    // if (!activePreTrans.includes(pre)) {
                    //   setActivePreTrans((prev) => [...prev, pre])
                    //   // console.log(activePreRes)
                    // } else if (activePreTrans.includes(pre)) {
                    //   setActivePreTrans(activePreTrans.filter((item) => { return item != pre }))
                    // }
                  }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreTrans.includes(pre.name) ? 'bg-slate-500' : '')}> {pre.name} </span>) : <></>}
                </div>
              </div>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    )))

  useEffect(() => {
    setNodeParamsList((Object.keys(data.node.template)
      .filter((t) => t.charAt(0) !== "_")
      .map((t: string, idx) => (
        <div className="w-full flex flex-col items-center" key={idx}>
          {data.node.template[t].show &&
            !data.node.template[t].advanced && data.node.template[t].name == 'response' || data.node.template[t].name == 'prompt' ? (
            <>
              {pre_responses.length > 0 ? (
                <div className="flex flex-row flex-nowrap px-4 items-center ">
                  {(data.node.base_classes[0] == 'default_node' || data.node.base_classes[0] == 'llm_node') &&
                    <div className="flex flex-row flex-nowrap h-full w-max items-center">
                      <Info_Small_Icon />
                      <PreArrowIcon className="" width="9" height="13" viewbox="24 24" />
                    </div>
                  }
                  <div className="flex flex-wrap flex-row items-center">
                    {pre_responses.length && data.node.template[t].name == 'response' ? pre_responses.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                      // if (!activePreRes.includes(pre)) {
                      //   setActivePreRes((prev) => [...prev, pre])
                      // } else if (activePreRes.includes(pre)) {
                      //   setActivePreRes((prev) => prev.filter((item) => item !== pre))
                      // }
                    }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreRes.includes(pre.name) ? 'bg-black' : '')}> {pre.name} </span>) : <></>}
                  </div>
                </div>
              ) : <></>}
              <ParameterComponent
                data={data}
                color={
                  nodeColors[types[data.node.template[t].type]] ??
                  nodeColors.unknown
                }
                title={
                  data.node.template[t].display_name
                    ? data.node.template[t].display_name
                    : data.node.template[t].name
                      ? toTitleCase(data.node.template[t].name)
                      : toTitleCase(t)
                }
                info={data.node.template[t].info}
                name={t}
                tooltipTitle={data.node.template[t].type}
                required={data.node.template[t].required}
                id={data.node.template[t].type + "|" + t + "|" + data.id}
                left={data.node.base_classes[0] === "start_node" && data.node.template[t].name !== "response" ? false : true}
                type={data.node.template[t].type}
              />
              {pre_transitions.length > 0 && (
                <div className="flex flex-row flex-nowrap px-4 items-center ">
                  {data.node.display_name == 'default_node' &&
                    <div className="flex flex-row flex-nowrap h-full w-max items-center">
                      <Info_Small_Icon />
                      <PreArrowIcon className="h-full" width="9" height="13" viewbox="24 24" />
                    </div>
                  }
                  <div className="flex flex-wrap flex-row items-center">
                    {pre_transitions.length && data.node.template[t].name == 'response' ? pre_transitions.map((pre: { name: string; func: string }, idx) => <span key={pre.name} onClick={(e) => {
                      // if (!activePreTrans.includes(pre)) {
                      //   setActivePreTrans((prev) => [...prev, pre])
                      //   // console.log(activePreRes)
                      // } else if (activePreTrans.includes(pre)) {
                      //   setActivePreTrans(activePreTrans.filter((item) => { return item != pre }))
                      // }
                    }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreTrans.includes(pre.name) ? 'bg-slate-500' : '')}> {pre.name} </span>) : <></>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <></>
          )}
          {data.node.template[t].name == 'model_name' && (
            <ParameterComponent
              data={data}
              color={
                nodeColors[types[data.node.template[t].type]] ??
                nodeColors.unknown
              }
              title={
                data.node.template[t].display_name
                  ? data.node.template[t].display_name
                  : data.node.template[t].name
                    ? toTitleCase(data.node.template[t].name)
                    : toTitleCase(t)
              }
              info={data.node.template[t].info}
              name={t}
              tooltipTitle={data.node.template[t].type}
              required={data.node.template[t].required}
              id={data.node.template[t].type + "|" + t + "|" + data.id}
              left={data.node.base_classes[0] === "start_node" && data.node.template[t].name !== "response" ? false : true}
              type={data.node.template[t].type}
            />
          )}
        </div>
      ))))
  }, [pre_responses, pre_transitions, closePopUp])

  const [idBadge, setIdBadge] = useState(false)


  return (
    <>
      <NodeToolbar>
        <NodeToolbarComponent
          data={data}
          openPopUp={openPopUp}
          deleteNode={deleteNode}
        ></NodeToolbarComponent>
      </NodeToolbar>

      <div
        className={classNames(
          selected ? "border border-ring" : "border",
          "generic-node-div new-node-style"
        )}
      >
        {data.node.base_classes[0] == 'links' ? (
          <div className="generic-node-div-title gap-0 relative rounded-[15px] flex flex-col justify-center items-start">
            {data.type != 'start_node' && data.type != 'llm_node' && <Handle type="target" position={Position.Left} id={data.id} className={classNames("-ml-0.5 mt-2", "h-3 w-3 rounded-full border-2 bg-background border-blue-condition")} />}
            <span className="text-[#8D96B5] font-semibold mb-2">
              {data.node.links[0].to}
            </span>
            <div className="flex flex-row items-center justify-between w-full gap-3 mb-4 ml-3">
              <div className="flex flex-row items-center">
                <EditLinkIcon />
                <h5 className="ml-1"> {flows.find((flow) => flow.name == data.node.links[0].to)?.data?.nodes?.find((node: NodeType) => node.id == data.node.links[1].to)?.data?.node?.display_name ?? ''} </h5>
              </div>
              <button onClick={e => {
                goToNodeHandler(flows.find((flow) => flow.name == data.node.links[0].to), data.node.links[1].to)
              }} className="bg-white px-2 rounded-lg curr-shadow border-[1px] mr-3 font-semibold"> go to node -&gt; </button>
            </div>
          </div>
        ) : (
          <>
            <div className="generic-node-div-title relative rounded-t-[15px]">
              {data.type != 'start_node' && data.type != 'llm_node' && <Handle type="target" position={Position.Left} id={data.id} className={classNames(`-ml-0.5 ${inputLinks.length != 0 && "mt-2"}`, "h-3 w-3 rounded-full border-2 bg-background border-blue-condition")} />}
              {data.node.base_classes[0] == 'default_node' && inputLinks.length != 0 && <button className={`absolute -left-8 top-2.5 px-1 text-[10px] border-blue-condition border-[2px] font-semibold rounded-s-lg rounded-e ${!dark ? "bg-white" : "bg-muted"}`} onClick={e => openPopUp(<InputConditionsModal goToHandler={goToNodeHandler} data={data} />)}>
                Links
              </button>}
              <div className="generic-node-title-arrangement">
                <div className="generic-node-tooltip-div">
                  <div className="flex flex-row items-center">
                    <div
                      onMouseLeave={e => setIdBadge(false)}
                      onMouseDownCapture={e => setIdBadge(true)}
                      className={handleClassNameForNodeName() + ' w-full h-full px-2 py-0.5 rounded-xl font-medium id-node-name bg-muted '}>
                      <span>
                        {data.node.display_name}
                      </span>
                    </div>
                    <Badge variant="default" className={` ${idBadge ? "id-after-node-name" : "id-after-node-name-reverse"} ml-3`}>
                      ID: {data.id}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="round-button-div">
                <button
                  className="relative"
                  onClick={(event) => {
                    event.preventDefault();
                    openPopUp(<NodeModal data={data} />);
                  }}
                ></button>
              </div>
              <div className="round-button-div">
                <div>
                  <Tooltip
                    title={
                      !validationStatus ? (
                        "Validating..."
                      ) : (
                        <div className="generic-node-validation-div">
                          <span> Ready for connection </span>
                        </div>
                      )
                    }
                  >
                    <div className="generic-node-status-position">
                      <div
                        className={classNames(
                          validationStatus && validationStatus.valid
                            ? "green-status"
                            : "status-build-animation",
                          "status-div"
                        )}
                      ></div>
                      <div
                        className={classNames(
                          validationStatus && !validationStatus.valid
                            ? "red-status"
                            : "status-build-animation",
                          "status-div"
                        )}
                      ></div>
                      <div
                        className={classNames(
                          !validationStatus || isBuilding
                            ? "yellow-status"
                            : "status-build-animation",
                          "status-div"
                        )}
                      ></div>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="generic-node-desc m-0 py-2 pt-0">
              <>
                <div className="flex flex-col items-center w-full">
                  {nodeParamsList}
                  {links}
                  {conditions}
                </div>
                <div
                  className={classNames(
                    Object.keys(data.node.template).length < 1 ? "hidden" : "",
                    "flex-max-width justify-center"
                  )}
                >
                  {" "}
                </div>
                {/* {data.node.base_classes.map((base_class, idx) => {

                })} */}
                {(data.node.base_classes[0] === "default_node" || data.node.base_classes[0] === "llm_node") && (
                  <div className="flex w-full items-center justify-center mt-1">
                    <button className={` text-center flex flex-col justify-center items-center text-xl  ${!dark ? "bg-white hover:bg-node-back" : "bg-muted hover:bg-slate-700"} py-1 px-6  text-[#3300FF] transition-all rounded-lg new-cnd-btn `} onClick={(e) => {
                      // console.log(conditionCounter)
                      const newCondition: ConditionClassType = {
                        conditionID: conditionCounter,
                        left: false,
                        name: `dft_cnd${conditionCounter}`,
                        priority: 1,
                        required: true,
                        type: `condition`,
                        transitionType: "default"
                      }
                      const newConditionJSX =
                        <ParameterComponent
                          data={data}
                          color={
                            nodeColors[types[data.node.template["response"].type]] ??
                            nodeColors.unknown
                          }
                          title={newCondition.name}
                          info={''}
                          name={newCondition.name}
                          tooltipTitle={data.node.template["response"].type}
                          required={data.node.template["response"].required}
                          id={data.id + "|" + `condition${newCondition.conditionID}` + '|' + data.id}
                          left={false}
                          type={`condition`}
                          key={data.node.template["response"].display_name + `${conditionCounter}`}
                          priority={1}
                          conditionID={conditionCounter}
                          transitionType={newCondition.transitionType}
                        />
                      openPopUp(<EditConditionModal conditionID={newCondition.conditionID} data={data} />)
                      data.node.conditions.push(newCondition)
                      setConditions(prev => [...prev, newConditionJSX])
                      setConditionCounter(prev => prev + 1)
                    }} >
                      <ConditionPlusIcon fill="#3300FF" />
                    </button>
                  </div>
                )}
              </>
            </div>
          </>
        )}
      </div>
    </>
  );
}
