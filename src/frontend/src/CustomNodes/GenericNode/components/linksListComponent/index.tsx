import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PopUpContext } from '../../../../contexts/popUpContext'
import { TabsContext } from '../../../../contexts/tabsContext'
import { LinkClassType } from '../../../../types/api'
import { NodeDataType } from '../../../../types/flow'
import { classNames } from '../../../../utils'
import { LinkComponent } from '../linkComponent'

export const LinksListComponent = ({ links, data, className }: { links: LinkClassType[], data: NodeDataType, className?: string }) => {

  const [nodesDisabled, setNodesDisabled] = useState(true)
  const [conditionsDisabled, setConditionsDisabled] = useState(true)
  const { flows, tabId } = useContext(TabsContext)
  const { closePopUp } = useContext(PopUpContext)

  const flow = flows.filter((flow) => flow.id == tabId)[0]
  const flowData = flow.data
  const nodeData = flowData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0] : null

  const flowLink = flowData != null && nodeData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[0] : ''
  const nodeLink = flowData != null && nodeData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0] ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[1] : '' : ''
  // const conditionLink = flowData != null && nodeData != null ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0] ? flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[2] : '' : ''

  const [defaultFlow, setDefaultFlow] = useState(flows.find((flow) => flow.name == flowLink.to) ? flows.find((flow) => flow.name == flowLink.to).name : '')
  const [defaultNode, setDefaultNode] = useState(nodeLink.to)
  // const [defaultCondition, setDefaultCondition] = useState(conditionLink.to)

  useEffect(() => {
    setDefaultFlow(flows.find((flow) => flow.name == flowLink.to) ? flows.find((flow) => flow.name == flowLink.to).name : '')
    setDefaultNode(nodeLink.to)
    // setDefaultCondition(conditionLink.to)
  }, [flows, closePopUp])

  const flowOptions = flows.map((flow) => flow.name)

  const defNode = defaultFlow ? flows.filter((flow) => flow.name == defaultFlow)[0].data : null
  const defaultNodeOptions = defaultFlow && defNode ? flows.filter((flow) => flow.name == defaultFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => node.data.id) : []
  const defaultConditionOptions = defNode && defaultFlow && defaultNode && flows.filter((flow) => flow.name == defaultFlow)[0].data.nodes.filter((node) => node.data.id == defaultNode)[0] ? flows.filter((flow) => flow.name == defaultFlow)[0].data.nodes.filter((node) => node.data.id == defaultNode)[0].data.node.conditions.map((condition) => condition.name) : []
  // console.log(defaultConditionOptions);

  const [targetFlow, setTargetFlow] = useState<string>(defaultFlow)
  const [targetNode, setTargetNode] = useState<string>(defaultNode)
  // const [targetCondition, setTargetCondition] = useState<string>(defaultCondition)

  useEffect(() => {
    setTargetFlow(defaultFlow)
    setTargetNode(defaultNode)
    // setTargetCondition(defaultCondition)
  }, [flows, closePopUp])

  // 

  const [nodeOptions, setNodeOptions] = useState(defaultNodeOptions)
  const [conditionOptions, setConditionOptions] = useState(defaultConditionOptions)




  useEffect(() => {
    // setTargetCondition('')
    setConditionOptions([])
    setTargetNode('')
    const flowData = targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data : null
    setNodeOptions(flowData && targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => node.data.id) : [])
  }, [targetFlow])

  useEffect(() => {
    // setTargetCondition('')
    // console.log(targetFlow, targetNode);
    // console.log(flows.filter((flow) => flow.name == targetFlow)[0])
    const flowData = targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data : null
    const nodesData = flowData && targetFlow && targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0] : null
    // console.log(nodesData);
    setConditionOptions(nodesData && targetFlow && targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0].data.node.conditions.map((condition) => condition.name) : [])
  }, [targetNode])

  // useEffect(() => {
  //   console.log(flowOptions, nodeOptions, conditionOptions)
  //   console.log(targetFlow, targetNode, targetCondition)
  // }, [])
  // console.log(flowOptions, nodeOptions, conditionOptions)
  // console.log(targetFlow, targetNode, targetCondition)
  // console.log(tabId, data);

  // useEffect(() => {
  //   // setTargetNode('')
  //   setNodeOptions(targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => node.data.id) : [])
  // }, [targetFlow])

  // useEffect(() => {
  //   // setTargetCondition('')
  //   setConditionOptions(targetFlow && targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0].data.node.conditions.map((condition) => condition.name) : [])
  // }, [targetNode])

  // useEffect(() => {
  //   flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[0].to = targetFlow
  //   flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[1].to = targetNode
  //   flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[2].to = targetCondition
  // }, [targetFlow, targetNode, targetCondition])


  // const flowOptions = flows.map((flow) => flow.name)
  // const nodeOptions = targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => node.data.id) : []
  // const conditionOptions = targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0].data.node.conditions.map((condition) => condition.name) : []



  return (
    <div className={classNames('px-4 py-2', className)}>
      <label htmlFor="">
        To flow <LinkComponent data={data} defaultValue={targetFlow} setTarget={setTargetFlow} index={0} linkType={links[0].linkType} options={flowOptions} type={links[0].type} />
      </label>
      <label htmlFor="">
        Node <LinkComponent data={data} defaultValue={targetNode} setTarget={setTargetNode} index={1} linkType={links[1].linkType} options={nodeOptions.length ? nodeOptions : defaultNodeOptions} type={links[1].type} />
      </label>
      {/* <label htmlFor="">
        Condition <LinkComponent data={data} defaultValue={targetCondition} index={2} setTarget={setTargetCondition} linkType={links[2].linkType} options={conditionOptions.length ? conditionOptions : defaultConditionOptions} type={links[2].type} />
      </label> */}
    </div>
  )
}
