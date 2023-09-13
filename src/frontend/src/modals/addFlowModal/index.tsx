import { useContext, useRef, useState } from "react";
import { alertContext } from "../../contexts/alertContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { TabsContext } from "../../contexts/tabsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { SETTINGS_DIALOG_SUBTITLE } from "../../constants";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import { Settings2 } from "lucide-react";
import { updateFlowInDatabase } from "../../controllers/API";
import { FlowType } from "../../types/flow";
import { useNavigate } from "react-router-dom";

export default function AddFlowModal() {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId, updateFlow, setTabsState, saveFlow, addFlow } =
    useContext(TabsContext);
  const maxLength = 50;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('')

  // const navigate = useNavigate()

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      setTimeout(() => {
        closePopUp();
      }, 300);
    }
  }
  function handleClick() {
    const flow = {
      name: name,
      description: description,
      color: color,
      data: null,
      id: ""
    }
    addFlow(null, true, flow)
    setSuccessData({ title: "New flow was successfully added" });
    closePopUp();
  }

  function handleAddFlow() {
    if (flows.find((f) => (f.name == name && f.id != tabId))) {
      setErrorData({ title: "Flow with same name already exists!" })
      return -1
    }
    const flow = {
      name: name,
      description: description,
      color: color,
    }
    try {
      addFlow(null, true, flow).then((id) => {
        // navigate("/flow/" + id);
      });
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    } finally {
      closePopUp()
    }
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="h-[390px] lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="pr-2"> Add Flow </span>
            <Settings2 className="mr-2 h-4 w-4 " />
          </DialogTitle>
          <DialogDescription>{SETTINGS_DIALOG_SUBTITLE}</DialogDescription>
        </DialogHeader>

        <EditFlowSettings
          name={name}
          description={description}
          flows={flows}
          tabId={tabId}
          setName={setName}
          setDescription={setDescription}
          setColor={setColor}
          updateFlow={updateFlow}
        />

        <DialogFooter>
          <Button onClick={handleAddFlow} type="submit">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
