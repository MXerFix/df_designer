import { useContext } from "react";
import { TabsContext } from "../../../../contexts/tabsContext";
import { PopUpContext } from "../../../../contexts/popUpContext";
import {
  Plus,
  ChevronDown,
  ChevronLeft,
  Undo,
  Redo,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../../ui/dropdown-menu";

import { alertContext } from "../../../../contexts/alertContext";
import { Link, useNavigate } from "react-router-dom";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import { Button } from "../../../ui/button";
import { XIcon } from "../../../../icons/XIcon/XIcon";

export const MenuBar = ({ flows, tabId }) => {
  const { updateFlow, setTabId, addFlow, removeFlow } = useContext(TabsContext);
  const { setErrorData } = useContext(alertContext);
  const { openPopUp } = useContext(PopUpContext);
  const { undo, redo } = useContext(undoRedoContext);


  const navigate = useNavigate();

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
  let current_flow = flows.find((flow) => flow.id === tabId);

  return (
    <div className="round-button-div">
      <Link to="/">
        <ChevronLeft className="w-4" />
      </Link>
      <div className="header-menu-bar">
        <span className="w-max header-menu-bar-fix">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="header-menu-bar-display border-0"
                variant="primary"
                size="sm"
              >
                <div className="header-menu-flow-name">{current_flow.name}</div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  handleAddFlow();
                }}
                className="cursor-pointer"
              >
                <Plus className="header-menu-options" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  openPopUp(<FlowSettingsModal />);
                }}
                className="cursor-pointer"
              >
                <Settings2 className="header-menu-options " />
                Settings
              </DropdownMenuItem>
              {/* <DropdownMenuItem
              onClick={() => {
                undo();
              }}
              className="cursor-pointer"
            >
              <Undo className="header-menu-options " />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                redo();
              }}
              className="cursor-pointer"
            >
              <Redo className="header-menu-options " />
              Redo
            </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={e => { navigate(`/flow/${flows[0].id}`); removeFlow(current_flow.id); }}
                className={`cursor-pointer `}
              >
                <XIcon className="mr-3 ml-0.5" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Flows</DropdownMenuLabel>
              <DropdownMenuRadioGroup className="max-h-full overflow-scroll"
                value={tabId}
                onValueChange={(value) => {
                  setTabId(value);
                }}
              >
                {flows.map((flow, idx) => {
                  return (
                    <Link
                      key={flow.id}
                      to={"/flow/" + flow.id}
                      className="flex w-full items-center"
                    >
                      <DropdownMenuRadioItem
                        value={flow.id}
                        className="flex-1 w-full inline-block truncate break-words mr-2"
                      >
                        {flow.name}
                      </DropdownMenuRadioItem>
                    </Link>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>
    </div>
  );
};

export default MenuBar;
