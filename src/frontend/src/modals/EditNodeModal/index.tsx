import { useContext, useEffect, useRef, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { NodeDataType } from "../../types/flow";
import { classNames, limitScrollFieldsModal } from "../../utils";
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
import { TabsContext } from "../../contexts/tabsContext";
import EditPreModal from "../addeditPreModal";
import { HelpBtn } from "../../components/ui/helpbtn";
import { APITemplateType } from "../../types/api";
import { DropdownMenu } from "../../components/ui/dropdown-menu";
import { EditConditionIcon } from "../../icons/EditConditionIcon";


export default function EditNodeModal({ data }: { data: NodeDataType }) {
  const { openPopUp } = useContext(PopUpContext)
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
  const { tabId, flows, saveFlow } = useContext(TabsContext)
  const { types } = useContext(typesContext);
  const ref = useRef();
  const [enabled, setEnabled] = useState(null);
  const [quote, setQuote] = useState(false);
  if (nodeLength == 0) {
    closePopUp();
  }

  function setModalOpen(x: boolean) {
    setOpen(x);
    if (x === false) {
      closePopUp();
    }
  }

  function handleClick() {
    let savedFlow = flows.find((f) => f.id === tabId);
    data.node.pre_responses = data.node.pre_responses
    data.node.pre_transitions = data.node.pre_transitions
    saveFlow(savedFlow);
    closePopUp();
  }

  useEffect(() => { }, [closePopUp, data.node.template]);

  function changeAdvanced(node): void {
    Object.keys(data.node.template).filter((n, i) => {
      if (n === node.name) {
        data.node.template[n].advanced = !data.node.template[n].advanced;
      }
      return true;
    });
    setNodeValue(!nodeValue);
  }


  const response = data.node.template?.response ? data.node.template?.response : null
  const conditions = data.node.conditions?.length ? data.node.conditions : null
  const pre_responses = data.node.pre_responses?.length ? data.node.pre_responses : null
  const pre_transitions = data.node.pre_transitions?.length ? data.node.pre_transitions : null

  // console.log(conditions);

  const [conditionsState, setConditionsState] = useState(conditions ? conditions : [])

  return (
    <Dialog open={true} onOpenChange={setModalOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px]">
        <DialogTitle className="flex items-center">
          <EditConditionIcon />
          <span className="pr-2">Edit node </span>
          <Badge variant="secondary">ID: {data.id}</Badge>
        </DialogTitle>
        <div>
          {response && (
            <>
              <label className="flex flex-row" htmlFor="">
                <span className={`${quote && 'text-neutral-400'}`}>Quote</span>
                <ToggleShadComponent
                  enabled={quote}
                  setEnabled={(e) => { setQuote(prev => !prev) }
                  }
                  disabled={false}
                  size="small" />
                <span className={`${!quote && 'text-neutral-400'}`}>Description</span>
              </label>
              {!quote ? (
                <label htmlFor="">
                  <span></span>
                  <InputComponent
                    onChange={value => response.value = value}
                    placeholder='Enter bot’s response text...'
                    password={false}
                    value={response.value ? response.value : ''}
                  />
                </label>
              ) : (
                <label htmlFor="">
                  <InputComponent
                    onChange={value => data.node.description = value}
                    placeholder='Enter node description...'
                    password={false}
                    value={data.node.description ? data.node.description : ''}
                  />
                </label>
              )}
            </>
          )}
        </div>
        {data.node.base_classes[0] == 'llm_node' && (
          <>
            <DialogHeader>
              <DialogDescription>
                <div className="flex pt-3">
                  <Variable className="edit-node-modal-variable "></Variable>
                  <span className="edit-node-modal-span">
                    Parameters
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="edit-node-modal-arrangement">
              <div
                className={classNames(
                  "edit-node-modal-box",
                  nodeLength > limitScrollFieldsModal
                    ? "overflow-scroll overflow-x-hidden custom-scroll"
                    : "overflow-hidden",
                )}
              >
                {nodeLength > 0 && (
                  <div className="edit-node-modal-table">
                    <Table className="table-fixed bg-muted outline-1">
                      <TableHeader className="edit-node-modal-table-header">
                        <TableRow className="">
                          <TableHead className="h-7 text-center">PARAM</TableHead>
                          <TableHead className="h-7 p-0 text-center">
                            VALUE
                          </TableHead>
                          <TableHead className="h-7 text-center">ACTION</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="p-0">
                        {Object.entries(data.node?.template).map(([key, value]) => {
                          if (key == 'response') return <></>
                          return (
                            <TableRow key={key} className="h-10">
                              <TableCell className="truncate p-0 text-center text-sm text-foreground sm:px-3">
                                <div className="flex flex-row items-center justify-start">
                                  <span className="ml-12">{key}</span>
                                </div>
                              </TableCell>
                              <TableCell className="w-[300px] p-0 text-center text-xs text-foreground ">
                                {value.options ? (
                                  <select
                                    className="p-1 w-[150px] text-center rounded-lg in-modal-input"
                                    onChange={e => value.value = e.target.value}
                                    value={value.value}
                                  >
                                    <option value={''}> choose model </option>
                                    {value.options.map((option) => {
                                      return (
                                        <option value={option}>
                                          {option}
                                        </option>
                                      )
                                    })}
                                  </select>
                                ) :
                                  <input
                                    onChange={v => { value.value = v.target.value }}
                                    defaultValue={value.value}
                                    type="string"
                                    className="p-1 w-[150px] text-center rounded-lg in-modal-input"
                                  />}
                              </TableCell>
                              <TableCell className="p-0 text-center" >
                                {/* <button
                                  className={`${data.node.conditions.length > 0 && 'bg-red-500'} p-1.5 rounded-lg`}
                                  onClick={e => { if (confirm("Вы уверены?")) { data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID); setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID)) } }}
                                >
                                  <DeleteIcon fill={`${data.node.conditions.length > 0 ? 'white' : 'black'}`} />
                                </button> */}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <DialogHeader>
          <DialogDescription>
            <div className="flex pt-3">
              <Variable className="edit-node-modal-variable "></Variable>
              <span className="edit-node-modal-span">
                Conditions
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="edit-node-modal-arrangement">
          <div
            className={classNames(
              "edit-node-modal-box",
              nodeLength > limitScrollFieldsModal
                ? "overflow-scroll overflow-x-hidden custom-scroll"
                : "overflow-hidden",
            )}
          >
            {nodeLength > 0 && (
              <div className="edit-node-modal-table">
                <Table className="table-fixed bg-muted outline-1">
                  <TableHeader className="edit-node-modal-table-header">
                    <TableRow className="">
                      <TableHead className="h-7 text-center">PARAM</TableHead>
                      <TableHead className="h-7 p-0 text-center">
                        PRIORITY
                      </TableHead>
                      <TableHead className="h-7 text-center">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="p-0">
                    {conditionsState.map((condition, index) => {
                      return (
                        <TableRow key={condition.conditionID} className="h-10">
                          <TableCell className="truncate p-0 text-center text-sm text-foreground sm:px-3">
                            <div className="flex flex-row items-center justify-start">
                              <DragIcon className="" />
                              <span className="ml-12">{condition.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-[300px] p-0 text-center text-xs text-foreground ">
                            <input
                              onChange={v => { condition.priority = Number(v.target.value) }}
                              defaultValue={condition.priority}
                              type="number"
                              className="p-1 text-center rounded-lg in-modal-input"
                            />
                          </TableCell>
                          <TableCell className="p-0 text-center" >
                            <button
                              className={`${data.node.conditions.length > 0 && 'bg-red-500'} p-1.5 rounded-lg`}
                              onClick={e => { if (confirm("Вы уверены?")) { data.node.conditions = data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID); setConditionsState(data.node.conditions.filter((conditionF) => conditionF.conditionID != condition.conditionID)) } }}
                            >
                              <DeleteIcon fill={`${data.node.conditions.length > 0 ? 'white' : 'black'}`} />
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        <h5 className="extra-title text-sm mt-4"> Preprocessing in progress... </h5>
        <div className="  ">
          <div className="mb-3 ">
            {/* <h5 className="extra-title text-sm mb-2 w-max rounded">Preresponse processing</h5> */}
            <span className="w-[200px] h-[20px] rounded mb-1 bg-neutral-300 block ">  </span>
            <div className="flex flex-row">
              {pre_responses?.map((res, idx) => <span key={res.name} className='text-sm bg-neutral-900 text-white px-2 py-1 rounded-md mx-0.5'> <span className="text-neutral-500">{idx}. </span>{res.name}</span>)}
              <button disabled onClick={e => openPopUp(<EditPreModal data={data} resp={true} />)} className="bg-res-trans-add bg-neutral-300 text-neutral-500 py-1 px-2 text-sm rounded-md font-medium">+ Add</button>
            </div>
          </div>
          <div className="mb-3">
            {/* <h5 className="extra-title text-sm mb-2"> Pretransition processing </h5> */}
            <span className="w-[200px] h-[20px] rounded mb-1 bg-neutral-300 block ">  </span>
            <div className="flex flex-row">
              {pre_transitions?.map((res, idx) => <span key={res.name} className='text-sm bg-neutral-900 text-white px-2 py-1 rounded-md mx-0.5'> <span className="text-neutral-500">{idx}. </span>{res.name}</span>)}
              <button disabled onClick={e => openPopUp(<EditPreModal data={data} resp={false} />)} className="bg-res-trans-add bg-neutral-300 text-neutral-500 py-1 px-2 text-sm rounded-md font-medium">+ Add</button>
            </div>
          </div>
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
