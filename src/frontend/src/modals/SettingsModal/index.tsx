import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { typesContext } from "../../contexts/typesContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { TabsContext } from "../../contexts/tabsContext";
import { SettingsIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { HelpBtn } from "../../components/ui/helpbtn";


export default function SettingsModal() {
  const [open, setOpen] = useState(true);
  const { closePopUp } = useContext(PopUpContext);
  const { types } = useContext(typesContext);
  const { tabId, flows, saveFlow } = useContext(TabsContext)


  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }
  

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    saveFlow(savedFlow);
    closePopUp();
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className=" w-[720px] ">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            <SettingsIcon />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div>
          
        </div>
        <DialogFooter className="flex flex-row items-center justify-between">
          <HelpBtn className="" />
          <Button className="mt-3" onClick={handleClick}>
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
