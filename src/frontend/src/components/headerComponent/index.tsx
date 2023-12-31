import { Home, MoonIcon, SettingsIcon, SunIcon, Users2, XIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { Button } from "../ui/button";
import { TabsContext } from "../../contexts/tabsContext";
import AlertDropdown from "../../alerts/alertDropDown";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { typesContext } from "../../contexts/typesContext";
import MenuBar from "./components/menuBar";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { USER_PROJECTS_HEADER } from "../../constants";
import { getRepoStars } from "../../controllers/API";
import { Separator } from "../ui/separator";
import { Bell } from "lucide-react";
import { ChatIcon } from "../../icons/ChatIcon/ChatIcon";
import { FlowType } from "../../types/flow";
import { NewLogo } from "../../icons/NewLogo";
import AddFlowModal from "../../modals/addFlowModal";
import SettingsModal from "../../modals/SettingsModal";
import { CursorIcon } from "../../icons/CursorIcon";
import { GrabberIcon } from "../../icons/GrabberIcon";
import { DoubleButton } from "../ui/double-button";
import { WorkSpaceModeIcon } from "../../icons/CanvaModeIcon";
import { NodesPlacementIcon } from "../../icons/NodesPlacementIcon";

export default function Header() {
  const { flows, addFlow, tabId, setTabId, removeFlow } = useContext(TabsContext);
  const { setDisableCopyPaste, disableCopyPaste, managerMode, setManagerMode } = useContext(TabsContext)
  const { openPopUp } = useContext(PopUpContext);
  const { templates } = useContext(typesContext);
  const { id } = useParams();
  const AlertWidth = 384;
  const { dark, setDark } = useContext(darkContext);
  const { notificationCenter, setNotificationCenter, setErrorData } =
    useContext(alertContext);
  const location = useLocation();

  const [stars, setStars] = useState(null);
  const [workSpaceMode, setWorkSpaceMode] = useState(disableCopyPaste)
  const [nodesPlacement, setNodesPlacement] = useState(false)
  const navigate = useNavigate()

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

  const workSpaceModeHandler = (bool: boolean) => {
    setWorkSpaceMode(bool)
    setManagerMode(bool)
  }

  // console.log(workSpaceMode, disableCopyPaste)

  const indexOfCurrFlow = flows.indexOf(flows.find(({ id }) => id == tabId))
  const currRefToDelete = (indexOfCurrFlow >= 0) ? (indexOfCurrFlow == 0 ? (flows.length > 1 ? `/flow/${flows[1].id}` : `/`) : `/flow/${flows[indexOfCurrFlow - 1].id}`) : `/`


  function deleteFlowOnTabHandler(flow: FlowType) {
    removeFlow(flow.id)
  }

  return (
    <div className="header-arrangement">
      <div className="header-start-display">
        <Link to="/">
          <NewLogo />
        </Link>
        {flows.findIndex((f) => tabId === f.id) !== -1 && tabId !== "" && (
          <MenuBar flows={flows} tabId={tabId} />
        )}
        {tabId !== '' && (
          <>
            <DoubleButton setFunction={workSpaceModeHandler} isActive={workSpaceMode} First={CursorIcon} Second={GrabberIcon} />
            <DoubleButton setFunction={setNodesPlacement} isActive={nodesPlacement} First={WorkSpaceModeIcon} Second={NodesPlacementIcon} />
          </>
        )}
        <div>

        </div>
      </div>

      <div className="header-end-division">
        <div className="header-end-display">
          <button onClick={e => openPopUp(<SettingsModal />)} className="extra-side-bar-save-disable">
            <SettingsIcon width={20} height={20} />
          </button>
          <button
            className="extra-side-bar-save-disable"
            onClick={() => {
              setDark(!dark);
            }}
          >
            {dark ? (
              <SunIcon className="side-bar-button-size" />
            ) : (
              <MoonIcon className="side-bar-button-size" />
            )}
          </button>
          <button
            className="extra-side-bar-save-disable relative"
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              setNotificationCenter(false);
              const { top, left } = (
                event.target as Element
              ).getBoundingClientRect();
              openPopUp(
                <>
                  <div
                    className="absolute z-10"
                    style={{ top: top + 34, left: left - AlertWidth }}
                  >
                    <AlertDropdown />
                  </div>
                  <div className="header-notifications-box"></div>
                </>
              );
            }}
          >
            {notificationCenter && (
              <div className="header-notifications"></div>
            )}
            <Bell className="side-bar-button-size" aria-hidden="true" />
          </button>
          <button className={`chat-btn bg-transparent text-sm flex flex-row py-1 px-3 rounded-md items-center justify-center w-max ${!dark ? 'text-black' : 'text-neutral-50'} hover:bg-blue-700 hover:text-neutral-50 chat-btn-fix `}>
            Chat with Skill
            <ChatIcon pathClassName={`chat-path`} className={`inline-block ml-2`} fill={dark ? 'white' : 'black'} />
          </button>
        </div>
      </div>
    </div>
  );
}
