import DisclosureComponent from "../DisclosureComponent";
import {
  classNames,
  flow_colors,
  nodeColors,
  nodeIconsLucide,
  nodeNames,
  titleNodeColors,
} from "../../../../utils";
import { useContext, useState } from "react";
import { typesContext } from "../../../../contexts/typesContext";
import { APIClassType, APIObjectType } from "../../../../types/api";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import { Code2, FileDown, FileUp, Save, Search } from "lucide-react";
import { PopUpContext } from "../../../../contexts/popUpContext";
import ExportModal from "../../../../modals/exportModal";
import ApiModal from "../../../../modals/ApiModal";
import { TabsContext } from "../../../../contexts/tabsContext";
import { alertContext } from "../../../../contexts/alertContext";
import { Separator } from "../../../../components/ui/separator";
import { Menu } from "lucide-react";
import { FlowColorSVG } from "../../../../icons/FlowColorSVG";
import { CheckSVG } from "../../../../icons/CheckSVG";
import { Link, useNavigate } from "react-router-dom";
import { XIcon } from "../../../../icons/XIcon/XIcon";
import AddFlowModal from "../../../../modals/addFlowModal";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import { PlusIcon } from "../../../../icons/PlusIcon";
import { FileUpIcon } from "../../../../icons/FileUpIcon";
import { FileDownIcon } from "../../../../icons/FileDownIcon";
import { SaveIcon } from "../../../../icons/SaveIcon";
import { CodeIcon } from "../../../../icons/CodeIcon";

export default function ExtraSidebar() {
  const { data } = useContext(typesContext);
  const { openPopUp } = useContext(PopUpContext);
  const { flows, tabId, uploadFlow, tabsState, saveFlow, save, setTabId, addFlow, removeFlow } =
    useContext(TabsContext);

  // console.log(flows)

  const { setSuccessData, setErrorData } = useContext(alertContext);
  const [dataFilter, setFilterData] = useState(data);
  const [search, setSearch] = useState("");
  const [activeFlow, setActiveFlow] = useState(tabId)
  const isPending = tabsState[tabId]?.isPending;

  const navigate = useNavigate()

  function onDragStart(
    event: React.DragEvent<any>,
    data: { type: string; node?: APIClassType }
  ) {
    //start drag event
    var crt = event.currentTarget.cloneNode(true);
    crt.style.position = "absolute";
    crt.style.top = "-500px";
    crt.style.right = "-500px";
    crt.classList.add("cursor-grabbing");
    document.body.appendChild(crt);
    event.dataTransfer.setDragImage(crt, 0, 0);
    event.dataTransfer.setData("json", JSON.stringify(data));
  }

  function handleSearchInput(e: string) {
    setFilterData((_) => {
      let ret = {};
      Object.keys(data).forEach((d: keyof APIObjectType, i) => {
        ret[d] = {};
        let keys = Object.keys(data[d]).filter((nd) =>
          nd.toLowerCase().includes(e.toLowerCase())
        );
        keys.forEach((element) => {
          ret[d][element] = data[d][element];
        });
      });
      return ret;
    });
  }

  function handleAddFlow() {
    try {
      addFlow(null, true).then((id) => {
        navigate("/flow/" + id);
      });
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    }
  }

  return (
    <div className="side-bar-arrangement">
      <div className="side-bar-buttons-arrangement">
        <ShadTooltip content="Import" side="top">
          <button
            className="extra-side-bar-buttons"
            onClick={() => {
              // openPopUp(<ImportModal />);
              uploadFlow();
            }}
          >
            <FileUpIcon />
          </button>
        </ShadTooltip>

        <ShadTooltip content="Export" side="top">
          <button
            className={classNames("extra-side-bar-buttons")}
            onClick={(event) => {
              openPopUp(<ExportModal />);
            }}
          >
            <FileDownIcon />
          </button>
        </ShadTooltip>
        <ShadTooltip content="Code" side="top">
          <button
            className={classNames("extra-side-bar-buttons")}
            onClick={(event) => {
              openPopUp(<ApiModal flow={flows.find((f) => f.id === tabId)} />);
            }}
          >
            <CodeIcon />
          </button>
        </ShadTooltip>

        <ShadTooltip content="Save" side="top">
          <button
            className="extra-side-bar-buttons"
            onClick={(event) => {
              saveFlow(flows.find((f) => f.id === tabId));
              setSuccessData({ title: "Changes saved successfully" });
            }}
            disabled={!isPending}
          >
            <SaveIcon
              stroke={!isPending ? '#777' : '#000'}
            ></SaveIcon>
          </button>
        </ShadTooltip>
      </div>
      <Separator />
      <div className="mt-3 mb-8">
        <div className="mb-2 ml-2 mr-3.5 flex flex-row items-center justify-between">
          <h5 className="extra-title">Flows</h5>
          <button
            onClick={e => openPopUp(<AddFlowModal />)}
            className={`flex flex-row items-center w-max justify-between text-sm bg-white`}>
            <PlusIcon />
            {/* {active && <CheckSVG />} */}
          </button>
        </div>
        {flows.map((flow, i) => {
          const active = (flow.id == tabId)
          return (
            <Link
              to={`/flow/${flow.id}`}
              key={flow.id}
              onClick={e => setTabId(flow.id)}
              className={` ${flow.id == tabId && 'bg-slate-50'} py-1.5 px-3 flex flex-row items-center w-full justify-between text-sm bg-white`}>
              <div className="flex flex-row">
                <FlowColorSVG fill={flow.color} />
                <span className="ml-3"> {flow.name} </span>
              </div>
              <div className="flex flex-row gap-2">
                {active && <CheckSVG />}
              </div>
            </Link>
          )
        })}
      </div>
      <Separator />
      <div className="side-bar-components-div-arrangement">
        <div className="side-bar-search-div-placement">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search"
            className="input-search"
            onChange={(e) => {
              handleSearchInput(e.target.value);
              setSearch(e.target.value);
            }}
          />
          <div className="search-icon">
            {/* ! replace hash color here */}
            <Search size={20} strokeWidth={1.5} className="text-primary" />
          </div>
        </div>
        {Object.keys(dataFilter)
          .sort()
          .map((d: keyof APIObjectType, i) =>
            Object.keys(dataFilter[d]).length > 0 ? (
              <DisclosureComponent
                openDisc={search.length == 0 ? false : true}
                key={nodeNames[d]}
                button={{
                  title: nodeNames[d] ?? nodeNames.unknown,
                  Icon: nodeIconsLucide[d] ?? nodeIconsLucide.unknown,
                }}
              >
                <div className="side-bar-components-gap">
                  {Object.keys(dataFilter[d])
                    .sort()
                    .map((t: string, k) => {
                      // console.log(d, t)
                      return (
                        <ShadTooltip
                          content={data[d][t].display_name}
                          side="right"
                          key={data[d][t].display_name}
                        >
                          <div key={k} data-tooltip-id={t}>
                            <div
                              draggable
                              className={"side-bar-components-border"}
                              style={{
                                borderLeftColor:
                                  titleNodeColors[t] ?? nodeColors.unknown,
                              }}
                              onDragStart={(event) => {
                                onDragStart(event, {
                                  type: t,
                                  node: data[d][t],
                                })
                              }
                              }
                              onDragEnd={() => {
                                document.body.removeChild(
                                  document.getElementsByClassName(
                                    "cursor-grabbing"
                                  )[0]
                                );
                              }}
                            >
                              <div className="side-bar-components-div-form">
                                <span className="side-bar-components-text">
                                  {data[d][t].display_name}
                                </span>
                                <Menu className="side-bar-components-icon " />
                              </div>
                            </div>
                          </div>
                        </ShadTooltip>
                      )
                    })}
                </div>
              </DisclosureComponent>
            ) : (
              <div key={i}></div>
            )
          )}

      </div>
    </div>
  );
}
