import { Handle, Position, useReactFlow, useUpdateNodeInternals } from "reactflow";
import {
  classNames,
  getRandomKeyByssmm,
  groupByFamily,
  isValidConnection,
  nodeIconsLucide,
} from "../../../../utils";
import { useContext, useEffect, useRef, useState } from "react";
import InputComponent from "../../../../components/inputComponent";
import InputListComponent from "../../../../components/inputListComponent";
import TextAreaComponent from "../../../../components/textAreaComponent";
import { typesContext } from "../../../../contexts/typesContext";
import { ParameterComponentType } from "../../../../types/components";
import FloatComponent from "../../../../components/floatComponent";
import Dropdown from "../../../../components/dropdownComponent";
import CodeAreaComponent from "../../../../components/codeAreaComponent";
import InputFileComponent from "../../../../components/inputFileComponent";
import { TabsContext } from "../../../../contexts/tabsContext";
import IntComponent from "../../../../components/intComponent";
import PromptAreaComponent from "../../../../components/promptComponent";
import { nodeNames } from "../../../../utils";
import React from "react";
import { nodeColors } from "../../../../utils";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import { PopUpContext } from "../../../../contexts/popUpContext";
import ToggleShadComponent from "../../../../components/toggleShadComponent";
import { Info } from "lucide-react";
import { BotIcon } from "../../../../icons/BotIcon";
import { PersonIcon } from "../../../../icons/PersonIcon";
import { ChangeConditionIcon } from "../../../../icons/ChangeConditionIcon";
import * as TransitionIcons from '../../../../icons/TransitionIcons/index'
import { ConditionClassType } from "../../../../types/api";

export default function ParameterComponent({
  left,
  id,
  data,
  tooltipTitle,
  title,
  color,
  type,
  name = "",
  required = false,
  info = "",
  priority,
  conditionID,
  transitionType,
}: ParameterComponentType) {
  const ref = useRef(null);
  const refHtml = useRef(null);
  const infoHtml = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [position, setPosition] = useState(0);
  const { closePopUp } = useContext(PopUpContext);
  const { setTabsState, tabId, save, saveFlow, updateFlow } = useContext(TabsContext);
  let { flows } = useContext(TabsContext)
  const { setEdges } = useReactFlow()
  const [actualTitle, setActualTitle] = useState(title)
  const [forwardsMenu, setForwardsMenu] = useState(false)
  const [wait, setWait] = useState(false)


  useEffect(() => {
    if (ref.current && ref.current.offsetTop && ref.current.clientHeight) {
      setPosition(ref.current.offsetTop + ref.current.clientHeight / 2);
      updateNodeInternals(data.id);
    }
  }, [data.id, ref, ref.current, ref.current?.offsetTop, updateNodeInternals]);

  useEffect(() => {
    updateNodeInternals(data.id);
  }, [data.id, position, updateNodeInternals]);

  const [enabled, setEnabled] = useState(
    data.node.template[name]?.value ?? false
  );

  useEffect(() => { }, [closePopUp, data.node.template]);

  const { reactFlowInstance } = useContext(typesContext);
  let disabled =
    reactFlowInstance?.getEdges().some((e) => e.targetHandle === id) ?? false;
  const [myData, setMyData] = useState(useContext(typesContext).data);

  const handleOnNewValue = (newValue: any) => {
    // data.node.template[name].value = newValue;
    const _flows = flows
    const flow = _flows.filter((flow) => flow.id === tabId)[0]
    const node = flow.data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node
    node.template[name].value = newValue
    // Set state to pending
    // console.log('value was changed')
    // console.log(node.template[name]);
    setTabsState((prev) => {
      return {
        ...prev,
        [tabId]: {
          isPending: true,
        },
      };
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setForwardsMenu(true)
  };

  const HandleTypeIcon = (transitionType) => {
    switch (transitionType) {
      case "default": return ''; break;
      case "forward": return <TransitionIcons.forward />; break;
      case "backward": return <TransitionIcons.backward />; break;
      case "repeat": return <TransitionIcons.repeat />; break;
      case "previous": return <TransitionIcons.previous />; break;
      case "to start": return <TransitionIcons.to_start />; break;
      case "to fallback": return <TransitionIcons.to_fallback />; break;
    }
  }

  useEffect(() => {
    infoHtml.current = (
      <div className="h-full w-full break-words">
        {info.split("\n").map((line, i) => (
          <p key={i} className="block">
            {line}
          </p>
        ))}
      </div>
    );
  }, [info]);

  useEffect(() => {
    const groupedObj = groupByFamily(myData, tooltipTitle);

    refHtml.current = groupedObj.map((item, i) => (
      <span
        key={getRandomKeyByssmm()}
        className={classNames(
          i > 0 ? "mt-3 flex items-center" : "flex items-center"
        )}
      >
        <div
          className="h-6 w-6"
          style={{
            color: nodeColors[item.family],
          }}
        >
          {React.createElement(nodeIconsLucide[item.family])}
        </div>
        <span className="ps-2 text-foreground">
          {nodeNames[item.family] ?? ""}{" "}
          <span className={classNames(left ? "hidden" : "")}>
            {" "}
            -&nbsp;
            {item.type.split(", ").length > 2
              ? item.type.split(", ").map((el, i) => (
                <React.Fragment key={el + i}>
                  <span>
                    {i === item.type.split(", ").length - 1
                      ? el
                      : (el += `, `)}
                  </span>
                  {i % 2 === 0 && i > 0 && <br />}
                </React.Fragment>
              ))
              : item.type}
          </span>
        </span>
      </span>
    ));
  }, [tooltipTitle]);

  const [forwardsItem, setForwardsItem] = useState(transitionType ? transitionType : '')
  const forwardsItemRef = useRef(transitionType ? transitionType : '')

  // console.log(transitionType, forwardsItem);
  const ourCondition = (data.node.conditions ? data.node.conditions.find((condition) => condition.name == name) : null)
  // console.log(ourCondition ? ourCondition.transitionType : 'no type');

  // console.log(id.split('|').slice(2).join())

  const flow = flows.find((flow) => flow.id === tabId)

  const saveNewConditionTypes = () => {
    // flows.filter((flow) => flow.id === tabId)[0].data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node.conditions.filter((condition: ConditionClassType) => condition.name == name)[0]['transitionType'] = forwardsItem
    // console.log(flows.filter((flow) => flow.id === tabId)[0].data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node.conditions.filter((condition: ConditionClassType) => condition.name == name)[0].transitionType);
    // console.log(flows);
  }

  const setNewConditionType = () => {
    const _flows = flows
    const flow = _flows.filter((flow) => flow.id === tabId)[0]
    const node = flow.data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node
    node.conditions.filter((condition: ConditionClassType) => condition.name == name)[0]['transitionType'] = forwardsItemRef.current;
    flows = _flows
  }


  const handleConditionType = (changeType: string) => {
    setForwardsMenu(false);
    setForwardsItem(prev => changeType);
    forwardsItemRef.current = changeType
    setNewConditionType()
  }

  // useEffect(() => {
  //   if (ourCondition) {
  //     // transitionType = forwardsItem
  //     // data.node.conditions.find((condition) => condition.name == name).transitionType = forwardsItem
  //     // flows = saveNewConditionTypes()
  //     // console.log(data.node.conditions.find((condition) => condition.name == name).transitionType)
  //     // setNewConditionType()
  //     // console.log(flows.filter((flow) => flow.id === tabId)[0].data.nodes.filter((node) => node.id == id.split('|').slice(2).join())[0].data.node.conditions.filter((condition: ConditionClassType) => condition.name == name)[0].transitionType);
  //   }
  // }, [forwardsItem])

  const flowsOptions = flows.map((flow) => flow.name)


  return (
    <div
      ref={ref}
      className={"my-1 flex w-full flex-wrap items-center justify-between bg-node-back px-5" + ' ' + (name == 'response' ? "mb-2" : 'mb-1') + ' ' + (type == 'condition' ? 'py-3' : 'py-2') + ' ' + (name == 'pre-transition' ? 'mb-5' : 'mb-1')}
    >
      <>
        {name == 'response' ? <div></div> :
          <div
            className={
              "w-full justify-between ml-1 flex flex-row truncate text-sm " +
              (left ? "" : "") +
              (info !== "" ? " flex items-center" : "")
            }
          >
            <div className="flex flex-row items-center">
              {type == `condition` ? <PersonIcon className="mr-2" /> : <></>}
              {actualTitle}
              {/* <span className="text-destructive">{required ? " *" : ""}</span> */}
            </div>
            <div className="flex flex-row items-center">
              <span className="text-neutral-400"> {priority} </span>
              <button> <ChangeConditionIcon className="ml-8" /> </button>
              <div className="">
                {info !== "" && (
                  <ShadTooltip content={infoHtml.current}>
                    <Info className="relative bottom-0.5 ml-2 h-3 w-3" />
                  </ShadTooltip>
                )}
              </div>
            </div>
          </div>}
        {left &&
          (type === "str" ||
            type === "bool" ||
            type === "float" ||
            type === "code" ||
            type === "prompt" ||
            type === "file" ||
            type === "int") ? (
          <></>
        ) : (
          <div className="">
            <ShadTooltip
              delayDuration={0}
              content={refHtml.current}
              side={left ? "left" : "right"}
            >
              <Handle onContextMenu={(e) => handleClick(e)}
                type={left ? "target" : "source"}
                position={left ? Position.Left : Position.Right}
                id={id}
                // isValidConnection={(connection) =>
                //   isValidConnection(connection, reactFlowInstance)
                // }
                isConnectable={true}
                className={classNames(
                  left ? "-ml-0.5 " : "-mr-0.5 ",
                  "h-3 w-3 rounded-full border-2 bg-background",
                  forwardsItem == 'default' ? '' : 'hidden'
                )}
                style={{
                  borderColor: '#FF9500',
                  top: position,
                }}
              ></Handle>
            </ShadTooltip>
            <div className="relative">
              <div onContextMenu={(e) => handleClick(e)} style={{ borderColor: '#FF9500' }} className={classNames(forwardsItem != 'default' ? '' : 'hidden', 'absolute flex flex-row items-center justify-center w-max left-80 ml-8 bg-node-back px-2 text-xs font-semibold rounded -top-5 border-2')}>
                {forwardsItem}
                <span className="ml-1">{HandleTypeIcon(forwardsItem)}</span>
              </div>
              <div className={(forwardsMenu ? 'opacity-100 scale-100 transition-all origin-left' : 'opacity-0 scale-0 transition-all origin-left') + ' ' + 'absolute z-20 bg-node-back px-2 py-1 w-max h-max rounded-lg left-96 -bottom-20 ml-0'}>
                {/*  TODO: REFACTOR THIS  */}
                <span className="text-sm text-neutral-400" >Choose transition</span>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('default') }}>manual</div>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('forward'); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>forward <TransitionIcons.forward className="ml-2" /> </div>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('backward'); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>backward <TransitionIcons.backward className="ml-2" /></div>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('repeat'); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>repeat <TransitionIcons.repeat className="ml-2" /></div>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('previous'); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>previous <TransitionIcons.previous className="ml-2" /></div>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('to start'); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>to start <TransitionIcons.to_start className="ml-2" /></div>
                <div className="text-xs flex flex-row items-center py-1 px-2 cursor-pointer font-semibold hover:bg-slate-100 rounded" onClick={() => { handleConditionType('to fallback'); setEdges(reactFlowInstance.getEdges().filter((edge) => edge.sourceHandle != id)) }}>to fallback <TransitionIcons.to_fallback className="ml-2" /></div>
              </div>
            </div>
          </div>

        )}

        {left === true &&
          type === "str" &&
          !data.node.template[name].options ? (
          <div className="mt-0 w-full">
            {data.node.template[name].list ? (
              <InputListComponent
                disabled={disabled}
                value={
                  !data.node.template[name].value ||
                    data.node.template[name].value === ""
                    ? [""]
                    : data.node.template[name].value
                }
                onChange={handleOnNewValue}
              />
            ) : data.node.template[name].multiline ? (
              <TextAreaComponent
                disabled={disabled}
                value={data.node.template[name].value ?? ""}
                onChange={handleOnNewValue}
              />
            ) : (
              <div className="flex flex-row w-full items-center">
                <BotIcon className="mr-1" />
                <InputComponent
                  className="w-full"
                  disabled={disabled}
                  disableCopyPaste={true}
                  password={data.node.template[name].password ?? false}
                  value={data.node.template[name].value ?? ""}
                  onChange={handleOnNewValue}
                  placeholder='Enter bot’s response text...'
                />
              </div>
            )}
          </div>
        ) : left === true && type === "bool" ? (
          <div className="mt-2 w-full">
            <ToggleShadComponent
              disabled={disabled}
              enabled={enabled}
              setEnabled={(t) => {
                handleOnNewValue(t);
                setEnabled(t);
              }}
              size="large"
            />
          </div>
        ) : left === true && type === "float" ? (
          <div className="mt-2 w-full">
            <FloatComponent
              disabled={disabled}
              disableCopyPaste={true}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true &&
          type === "str" &&
          data.node.template[name].options ? (
          <div className="mt-2 w-full">
            <Dropdown
              options={data.node.display_name == "Link" ? flowsOptions : []}
              onSelect={handleOnNewValue}
              value={data.node.template[name].value ?? "Choose an option"}
            ></Dropdown>
          </div>
        ) : left === true && type === "code" ? (
          <div className="mt-2 w-full">
            <CodeAreaComponent
              disabled={disabled}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true && type === "file" ? (
          <div className="mt-2 w-full">
            <InputFileComponent
              disabled={disabled}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
              fileTypes={data.node.template[name].fileTypes}
              suffixes={data.node.template[name].suffixes}
              onFileChange={(t: string) => {
                data.node.template[name].file_path = t;
                save();
              }}
            ></InputFileComponent>
          </div>
        ) : left === true && type === "int" ? (
          <div className="mt-2 w-full">
            <IntComponent
              disabled={disabled}
              disableCopyPaste={true}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true && type === "prompt" ? (
          <div className="mt-2 w-full">
            <PromptAreaComponent
              disabled={disabled}
              value={data.node.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : (
          <></>
        )}
      </>
    </div>
  );
}
