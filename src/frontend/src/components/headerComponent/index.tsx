import { Home, MoonIcon, SunIcon, Users2, XIcon } from "lucide-react";
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

export default function Header() {
  const { flows, addFlow, tabId, setTabId, removeFlow } = useContext(TabsContext);
  const { openPopUp } = useContext(PopUpContext);
  const { templates } = useContext(typesContext);
  const { id } = useParams();
  const AlertWidth = 384;
  const { dark, setDark } = useContext(darkContext);
  const { notificationCenter, setNotificationCenter, setErrorData } =
    useContext(alertContext);
  const location = useLocation();

  const [stars, setStars] = useState(null);
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


  const indexOfCurrFlow = flows.indexOf(flows.find(({ id }) => id == tabId))
  // console.log(indexOfCurrFlow);
  const currRefToDelete = (indexOfCurrFlow >= 0) ? (indexOfCurrFlow == 0 ? (flows.length > 1 ? `/flow/${flows[1].id}` : `/`) : `/flow/${flows[indexOfCurrFlow - 1].id}`) : `/`
  // console.log(currRefToDelete)
  // const currRefToDelete = indexOfPrevFlow == 0 ? '/flow/' : `/flow/${flows[indexOfPrevFlow].id}`


  function deleteFlowOnTabHandler(flow: FlowType) {
    removeFlow(flow.id)
  }

  useEffect(() => {
    async function fetchStars() {
      const starsCount = await getRepoStars("logspace-ai", "langflow");
      setStars(starsCount);
    }
    fetchStars();
  }, []);
  return (
    <div className="header-arrangement">
      <div className="header-start-display">
        <Link to="/">
          <NewLogo />
        </Link>
        {flows.findIndex((f) => tabId === f.id) !== -1 && tabId !== "" && (
          <MenuBar flows={flows} tabId={tabId} />
        )}
        {/* <div className="flex flex-row items-end justify-end tabs-menu w-max">
          {flows.map((flow) => {
            const active = flow.id == tabId
            return (
              <>
                <Link
                  key={flow.id}
                  to={"/flow/" + flow.id}
                  onClick={e => setTabId(flow.id)}
                  className={` flex flex-row items-center whitespace-nowrap text-sm border-tab ml-1 border-slate-300 ${!active ? "bg-node-back" : " bg-white border-b-white"} py-2 px-4 pr-2 `}>
                  {flow.name}
                  <Link
                    to={active && currRefToDelete}
                    onClick={e => { deleteFlowOnTabHandler(flow) }}
                    className="ml-2 text-sm hover:bg-slate-200 rounded-full p-1">
                    <XIcon className="w-3 h-3" />
                  </Link>
                </Link>
              </>
            )
          })}
          <button onClick={e => handleAddFlow()} className="text-sm py-2 px-3 ml-1 hover:bg-slate-200 rounded-t-md">
            +
          </button>
        </div> */}
      </div>
      {/* <div className="round-button-div">
        <Link to="/">
          <Button
            className="gap-2"
            variant={location.pathname === "/" ? "primary" : "secondary"}
            size="sm"
          >
            <Home className="h-4 w-4" />
            <div className="flex-1">{USER_PROJECTS_HEADER}</div>
          </Button>
        </Link>
        <Link to="/community">
          <Button
            className="gap-2"
            variant={
              location.pathname === "/community" ? "primary" : "secondary"
            }
            size="sm"
          >
            <Users2 className="h-4 w-4" />
            <div className="flex-1">Community Examples</div>
          </Button>
        </Link>
      </div> */}
      <div className="header-end-division">
        <div className="header-end-display">
          {/* <a
            href="https://github.com/logspace-ai/langflow"
            target="_blank"
            rel="noreferrer"
            className="header-github-link"
          >
            <FaGithub className="mr-2 h-5 w-5" />
            Star
            <div className="header-github-display">
              {stars}
            </div>
          </a>
          <a
            href="https://twitter.com/logspace_ai"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground"
          >
            <FaTwitter className="side-bar-button-size" />
          </a>
          <a
            href="https://discord.gg/EqksyE2EX9"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground"
          >
            <FaDiscord className="side-bar-button-size" />
          </a> */}

          {/* <Separator orientation="vertical" /> */}
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
          {/* <Separator orientation="vertical" /> */}
          <button className={`chat-btn bg-transparent text-sm flex flex-row py-1 px-3 rounded-md items-center justify-center w-max ${!dark ? 'text-black' : 'text-neutral-50'} hover:bg-blue-700 hover:text-neutral-50 chat-btn-fix `}>
            Chat with Skill
            <ChatIcon pathClassName={`chat-path`} className={`inline-block ml-2`} fill={dark ? 'white' : 'black'} />
          </button>
        </div>
      </div>
    </div>
  );
}
