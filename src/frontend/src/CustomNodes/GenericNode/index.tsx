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
import { NodeDataType } from "../../types/flow";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import NodeModal from "../../modals/NodeModal";
import Tooltip from "../../components/TooltipComponent";
import { Handle, NodeToolbar, Position } from "reactflow";
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
    // console.log(activePreRes, activePreTrans)
  }, [activePreRes, activePreTrans])

  const { setErrorData } = useContext(alertContext);
  const showError = useRef(true);
  const { types, deleteNode } = useContext(typesContext);
  const { flows } = useContext(TabsContext)

  const [links, setLinks] = useState<any>(data.node.links ? (
    <LinksListComponent data={data} links={data.node.links} />
  ) : <></>)
  const [conditions, setConditions] = useState<any[]>(data.node.conditions ? data.node.conditions.map((condition, idx) => {
    return <ParameterComponent
      data={data}
      color={
        nodeColors[types[data.node.template["response"].type]] ??
        nodeColors.unknown
      }
      title={
        `Condition ${idx}`
      }
      info={''}
      name={condition.name}
      tooltipTitle={data.node.template["response"].type}
      required={data.node.template["response"].required}
      id={data.node.template["response"].type + "|" + `condition${idx}` + "|" + data.id}
      left={condition.left}
      type={`condition`}
      key={data.node.template["response"].display_name + `${idx}`}
      priority={condition.priority}
      conditionID={condition.conditionID}
      transitionType={condition.transitionType}
    />
  }) : [])
  const [conditionCounter, setConditionCounter] = useState(conditions.length)

  const { closePopUp, openPopUp } = useContext(PopUpContext);
  const [name, setName] = useState(data.node.display_name)
  const [nameInput, setNameInput] = useState(false)
  // any to avoid type conflict
  const Icon: any =
    nodeIconsLucide[data.type] || nodeIconsLucide[types[data.type]];
  const [validationStatus, setValidationStatus] = useState(null);
  // State for outline color
  const { sseData, isBuilding } = useSSE();
  const refHtml = useRef(null);

  useOnClickOutside(refHtml, () => {
    setNameInput(false)
  })




  // useEffect(() => {
  //   if (reactFlowInstance) {
  //     setParams(Object.values(reactFlowInstance.toObject()));
  //   }
  // }, [save]);

  // New useEffect to watch for changes in sseData and update validation status
  useEffect(() => {
    const relevantData = sseData[data.id];
    if (relevantData) {
      // Extract validation information from relevantData and update the validationStatus state
      setValidationStatus(relevantData);
    } else {
      setValidationStatus(null);
    }
  }, [sseData, data.id]);

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

  const tempNodeParamsList = Object.keys(data.node.template)
    .filter((t) => t.charAt(0) !== "_")
    .map((t: string, idx) => (
      <div key={idx}>
        {/* {idx === 0 ? (
                    <div
                        className={classNames(
                            "px-5 py-2 mt-2 text-center",
                            Object.keys(data.node.template).filter(
                                (key) =>
                                    !key.startsWith("_") &&
                                    data.node.template[key].show &&
                                    !data.node.template[key].advanced
                            ).length === 0
                                ? "hidden"
                                : ""
                        )}
                    >
                        Inputs
                    </div>
                ) : (
                    <></>
                )} */}
        {data.node.template[t].show &&
          !data.node.template[t].advanced && data.node.template[t].name == 'response' ? (
          <>

            <div className="flex flex-row flex-nowrap px-4 items-center ">
              {data.node.display_name == 'default_node' &&
                <div className="flex flex-row flex-nowrap h-full w-max items-center">
                  <Info_Small_Icon />
                  <PreArrowIcon className="h-full" width="9" height="13" viewbox="24 24" />
                </div>
              }
              <div className="flex flex-wrap flex-row items-center">
                {data.node.pre_responses && data.node.template[t].name == 'response' ? data.node.pre_responses.map((pre, idx) => <span onClick={(e) => {
                  if (!activePreRes.includes(pre)) {
                    setActivePreRes((prev) => [...prev, pre])
                  } else if (activePreRes.includes(pre)) {
                    setActivePreRes((prev) => prev.filter((item) => item !== pre))
                  }
                }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreRes.includes(pre) ? 'bg-black' : '')}> {pre} </span>) : <></>}
              </div>
            </div>
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
              left={data.node.display_name === "start_node" && data.node.template[t].name !== "response" ? false : true}
              type={data.node.template[t].type}
            />
            <div className="flex flex-row flex-nowrap px-4 items-center ">
              {data.node.display_name == 'default_node' &&
                <div className="flex flex-row flex-nowrap h-full w-max items-center">
                  <Info_Small_Icon />
                  <PreArrowIcon className="h-full" width="9" height="13" viewbox="24 24" />
                </div>
              }
              <div className="flex flex-wrap flex-row items-center">
                {data.node.pre_transitions && data.node.template[t].name == 'response' ? data.node.pre_transitions.map((pre: string, idx) => <span onClick={(e) => {
                  if (!activePreTrans.includes(pre)) {
                    setActivePreTrans((prev) => [...prev, pre])
                    // console.log(activePreRes)
                  } else if (activePreTrans.includes(pre)) {
                    setActivePreTrans(activePreTrans.filter((item) => { return item != pre }))
                  }
                }} className={"px-1 rounded-md bg-res-trans-color mx-1 mb-1" + ' ' + (activePreTrans.includes(pre) ? 'bg-slate-500' : '')}> {pre} </span>) : <></>}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    ))
  const [nodeParamsList, setNodeParamsList] = useState(tempNodeParamsList)


  useEffect(() => {
    // console.log(nameInput)
  }, [name])




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
          "generic-node-div"
        )}
      >
        <div className="generic-node-div-title relative">
          <Handle type="target" position={Position.Left} id={data.id} className={classNames("-ml-0.5 ", "h-3 w-3 rounded-full border-2 bg-background border-blue-condition")} />
          <div className="generic-node-title-arrangement">
            {/* <Icon
              strokeWidth={1.5}
              className="generic-node-icon"
              style={{
                color: nodeColors[types[data.type]] ?? nodeColors.unknown,
              }}
            /> */}
            <div className="generic-node-tooltip-div">
              <ShadTooltip
                delayDuration={1500}
                content={data.node.display_name}
              >
                <div ref={refHtml} onClick={(e) => { setNameInput(true); e.stopPropagation() }} className="generic-node-tooltip-div text-primary">
                  <span style={{ backgroundColor: titleNodeColors[data.node.display_name], borderRadius: "6px", padding: "2px 4px", color: titleTextNodeColors[data.node.display_name] }}>{nameInput ? '' : (name == '' ? data.node.display_name : name)}</span>
                  {nameInput ?
                    <div className="relative">
                      <InputComponent placeholder="Enter new node name" value="" password={false} onChange={(e) => setName(e)} />
                      <button className="absolute top-1 right-1 p-1 hover:bg-slate-200 rounded-md " onClick={(e) => { setNameInput(false); e.stopPropagation(); e.preventDefault() }} > OK </button>
                    </div>
                    : <></>}
                </div>
              </ShadTooltip>
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
                      {validationStatus.params ||
                        ""
                          .split("\n")
                          .map((line, index) => <div key={index}>{line}</div>)}
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
        <div className="generic-node-desc m-0 pt-2">
          {/* <div className="generic-node-desc-text">
            {data.node.description}
          </div> */}

          <>
            {nodeParamsList}
            {conditions}
            {links}
            <div
              className={classNames(
                Object.keys(data.node.template).length < 1 ? "hidden" : "",
                "flex-max-width justify-center"
              )}
            >
              {" "}
            </div>
            {/* <div className="px-5 py-2 mt-2 text-center">
                  Output
              </div> */}
            {data.node.base_classes.map((base_class, idx) => {


              // return (
              //   <ParameterComponent
              //     key={idx + [data.type, data.id, ...data.node.base_classes].join("|")}
              //     data={data}
              //     color={nodeColors[types[data.type]] ?? nodeColors.unknown}
              //     title={data.type}
              //     tooltipTitle={`${data.node.base_classes.join("\n")}`}
              //     id={[data.type, data.id, ...data.node.base_classes].join("|")}
              //     type={data.node.base_classes.join("|")}
              //     left={false}
              //   />
              // )
            })}
            {data.node.display_name === "default_node" && (
              <div className="flex w-full items-center justify-center mt-5">
                <button className=" text-center bg-slate-100 py-1 px-6 hover:bg-slate-300 transition-all rounded-xl " onClick={(e) => {
                  // console.log(conditionCounter)
                  const newCondition: ConditionClassType = {
                    conditionID: conditionCounter,
                    left: false,
                    name: `condition${conditionCounter}`,
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
                      title={
                        `Condition ${conditionCounter}`
                      }
                      info={''}
                      name={newCondition.name}
                      tooltipTitle={data.node.template["response"].type}
                      required={data.node.template["response"].required}
                      id={data.node.template["response"].type + "|" + `condition${conditionCounter}` + "|" + data.id}
                      left={false}
                      type={`condition`}
                      key={data.node.template["response"].display_name + `${conditionCounter}`}
                      priority={1}
                      conditionID={conditionCounter}
                      transitionType={newCondition.transitionType}
                    />
                  data.node.conditions.push(newCondition)
                  setConditions(prev => [...prev, newConditionJSX])
                  setConditionCounter(prev => prev + 1)
                  // console.log(data.node.conditions)
                  // console.log(conditions);

                  // console.log(nodeParamsList.length)
                  // data.node.template[`condition${nodeParamsList.length}`] = {
                  //   name: `condition`,
                  //   id: data.node.template["response"].type + "|" + `condition${nodeParamsList.length}` + "|" + data.id,
                  //   list: data.node.template["response"].list,
                  //   required: data.node.template["response"].required,
                  //   show: data.node.template["response"].show,
                  //   type: `condition`,
                  //   placeholder: data.node.template["response"].placeholder,
                  //   multiline: data.node.template["response"].multiline,
                  //   priority: 1,
                  //   value: "",
                  // }
                  // console.log(data.node.template);
                  // setNodeParamsList(prev => [...prev, <ParameterComponent
                  //   data={data}
                  //   color={
                  //     nodeColors[types[data.node.template["response"].type]] ??
                  //     nodeColors.unknown
                  //   }
                  //   title={
                  //     `Condition ${nodeParamsList.length}`
                  //     // ? data.node.template["condition"].display_name + `${nodeParamsList.length}`
                  //     // : data.node.template["condition"].name + `${nodeParamsList.length}`
                  //     //   ? toTitleCase(data.node.template["condition"].name) + `${nodeParamsList.length}`
                  //     //   : toTitleCase("condition") + `${nodeParamsList.length}`
                  //   }
                  //   info={''}
                  //   name={`condition`}
                  //   tooltipTitle={data.node.template["response"].type}
                  //   required={data.node.template["response"].required}
                  //   id={data.node.template["response"].type + "|" + `condition${nodeParamsList.length}` + "|" + data.id}
                  //   left={false}
                  //   type={`condition`}
                  //   key={data.node.template["response"].display_name + `${nodeParamsList.length}`}
                  //   priority={1}
                  // />])
                }} ><strong> + Conditions </strong></button>
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
}
