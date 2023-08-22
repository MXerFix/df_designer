import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { classNames, condition_actions, condition_intents, condition_llms, condition_variables, limitScrollFieldsModal } from "../../utils";
import { typesContext } from "../../contexts/typesContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import ToggleShadComponent from "../../components/toggleShadComponent";
import InputListComponent from "../../components/inputListComponent";
import TextAreaComponent from "../../components/textAreaComponent";
import InputComponent from "../../components/inputComponent";
import FloatComponent from "../../components/floatComponent";
import Dropdown from "../../components/dropdownComponent";
import IntComponent from "../../components/intComponent";
import InputFileComponent from "../../components/inputFileComponent";
import PromptAreaComponent from "../../components/promptComponent";
import CodeAreaComponent from "../../components/codeAreaComponent";
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
import { Badge } from "../../components/ui/badge";
import { Text, Variable } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { DragIcon } from "../../icons/DragIcon";
import { EditConditionIcon } from "../../icons/EditConditionIcon";
import { TabsContext } from "../../contexts/tabsContext";
import { HelpBtn } from "../../components/ui/helpbtn";


export default function EditConditionModal({ data, conditionID }: { data: NodeDataType, conditionID: number }) {
  const [open, setOpen] = useState(true);
  const [nodeLength, setNodeLength] = useState(
    Object.keys(data.node.template).filter(
      (t) =>
        t.charAt(0) !== "_" &&
        data.node.template[t].show &&
        (data.node.template[t].type === "str" ||
          data.node.template[t].type === "bool" ||
          data.node.template[t].type === "float" ||
          data.node.template[t].type === "code" ||
          data.node.template[t].type === "prompt" ||
          data.node.template[t].type === "file" ||
          data.node.template[t].type === "int"),
    ).length,
  );
  const [nodeValue, setNodeValue] = useState(null);
  const { closePopUp } = useContext(PopUpContext);
  const { types } = useContext(typesContext);
  const ref = useRef();
  const [enabled, setEnabled] = useState(null);
  const [custom, setCustom] = useState(true);
  const { tabId, flows, saveFlow } = useContext(TabsContext)

  if (nodeLength == 0) {
    closePopUp();
  }

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  useEffect(() => { }, [closePopUp, data.node.template]);

  const conditions = data.node.conditions.length ? data.node.conditions : null
  const condition = data.node?.conditions[conditionID] ? data.node?.conditions[conditionID] : null

  const [title, setTitle] = useState(condition?.name ? condition.name : '')
  const [intent, setIntent] = useState(condition?.intent ? condition.intent : '')
  const [action, setAction] = useState(condition?.action ? condition.action : '')
  const [variables, setVariables] = useState(condition?.variables ? condition.variables : '')
  const [llm_model, setLLM_Model] = useState(condition?.llm_model ? condition.llm_model : '')
  const [api_key, setApi_key] = useState(condition?.APIKey ? condition.APIKey : '')
  const [prompt, setPrompt] = useState(condition?.prompt ? condition.prompt : '')

  const [conditionsState, setConditionsState] = useState(conditions)

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    if (!custom) {
      condition.prompt = ''
      condition.APIKey = ''
      condition.llm_model = ''
      condition.name = title
      condition.intent = intent
      condition.action = action
      condition.variables = variables
    } else {
      condition.prompt = prompt
      condition.APIKey = api_key
      condition.llm_model = llm_model
      condition.name = title
      condition.intent = ''
      condition.action = ''
      condition.variables = ''
    }
    saveFlow(savedFlow);
    closePopUp();
  }

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px]">
        <DialogHeader className="flex flex-row justify-between">
          <DialogTitle>
            <span className="flex flex-row items-center mb-2">
              <EditConditionIcon />
              <p className="ml-1">Edit Conditions</p>
            </span>
            <Badge variant="secondary" > {data.id} | {condition.name ? condition.name : 'noname'} </Badge>
          </DialogTitle>
          <label className="flex flex-row mr-4" htmlFor="">
            <span className={`${custom && 'text-neutral-400'}`}>Custom (work in progress...)</span>
            <ToggleShadComponent
              enabled={custom}
              setEnabled={(e) => { setCustom(prev => prev) }
              }
              disabled={false}
              size="small" />
            <span className={`${!custom && 'text-neutral-400'}`}>Using llm</span>
          </label>
        </DialogHeader>
        <div>
          <DialogDescription>
            <div className="flex pt-3">
              <span className="edit-node-modal-span">
                Title
              </span>
            </div>
          </DialogDescription>
          <InputComponent onChange={e => { setTitle(e) }} password={false} value={title} />
          {!custom ? (
            <>
              <span className="flex flex-row justify-between items-center mt-4 mb-4">
                <span className="w-full mr-2">
                  <label className="text-neutral-400 text-sm" htmlFor="">Intent</label>
                  <Dropdown options={condition_intents} onSelect={e => { setIntent(e) }} value={intent} />
                </span>
                <span className="w-full mr-2">
                  <label className="text-neutral-400 text-sm" htmlFor="">Action</label>
                  <Dropdown options={condition_actions} onSelect={e => { setAction(e) }} value={action} />
                </span>
                <span className="w-full mr-2">
                  <label className="text-neutral-400 text-sm" htmlFor="">Variables</label>
                  <Dropdown options={condition_variables} onSelect={e => { setVariables(e) }} value={variables} />
                </span>
                <button
                  className={`bg-red-500 rounded-lg mt-7 p-2.5`}
                  onClick={e => { if (confirm("Вы уверены?")) { data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID); setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID)) } }}
                >
                  <DeleteIcon fill={`white`} />
                </button>
              </span>
              <DialogDescription>
                <div className="flex pt-3">
                  <span className="edit-node-modal-span">
                    Preview
                  </span>
                </div>
                <span>
                  <p className="font-semibold text-neutral-500">If</p>
                  <p className="font-semibold line"> {!intent.length && '...'} <span className="text-black"> {intent} </span> <span className="text-neutral-400"> {action} </span> <span className="text-black"> {variables} </span> </p>
                </span>
              </DialogDescription>
            </>
          ) : (
            <>
              <span className="flex flex-row items-end mt-4 mb-4 justify-between">
                <label className="flex flex-col w-full" htmlFor="">
                  <span className="text-neutral-400 text-sm">Model name</span>
                  <Dropdown onSelect={e => setLLM_Model(e)} options={condition_llms} value={llm_model} />
                </label>
                <label className="flex flex-col w-full ml-2" htmlFor="">
                  <span className="text-neutral-400 text-sm">API Key</span>
                  <InputComponent className="mt-1" onChange={e => setApi_key(e)} password={false} value={api_key} />
                </label>
              </span>
              <label htmlFor="">
                <span className="text-neutral-400 text-sm"> Prompt </span>
                <textarea defaultValue={prompt} onChange={e => setPrompt(e.target.value)} name="prompt" id="condition_prompt" className="w-full rounded-lg mt-1 cond-textarea" rows={10}></textarea>
              </label>
            </>
          )}
        </div>
        <DialogFooter>
        <HelpBtn />
          <Button
            className="mt-3"
            onClick={handleClick}
            type="submit"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
