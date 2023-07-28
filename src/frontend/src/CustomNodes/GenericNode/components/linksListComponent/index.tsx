import React, { useContext, useEffect, useState } from 'react'
import { TabsContext } from '../../../../contexts/tabsContext'
import { LinkClassType } from '../../../../types/api'
import { NodeDataType } from '../../../../types/flow'
import { LinkComponent } from '../linkComponent'

export const LinksListComponent = ({ links, data }: { links: LinkClassType[], data: NodeDataType }) => {

  const [nodesDisabled, setNodesDisabled] = useState(true)
  const [conditionsDisabled, setConditionsDisabled] = useState(true)
  const { flows, tabId } = useContext(TabsContext)

  const flowLink = flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[0]
  const nodeLink = flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[1]
  const conditionLink = flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[2]

  const [targetFlow, setTargetFlow] = useState<string>(flowLink.to)
  const [targetNode, setTargetNode] = useState<string>(nodeLink.to)
  const [targetCondition, setTargetCondition] = useState<string>(conditionLink.to)
  // console.log(tabId, data);
  

  useEffect(() => {
    flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[0].to = targetFlow
    flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[1].to = targetNode
    flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[2].to = targetCondition
  }, [targetFlow, targetNode, targetCondition])

  const flowOptions = flows.map((flow) => flow.name)
  const nodeOptions = targetFlow ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.type == 'default_node').map((node) => node.data.id) : []
  const conditionOptions = targetFlow && targetNode ? flows.filter((flow) => flow.name == targetFlow)[0].data.nodes.filter((node) => node.data.id == targetNode)[0].data.node.conditions.map((condition) => condition.name) : []

  return (
    <div className='px-4 py-2'>
      <label htmlFor="">
        To flow <LinkComponent defaultValue={targetFlow} setTarget={setTargetFlow} linkType={links[0].linkType} options={flowOptions} type={links[0].type} />
      </label>
      <label htmlFor="">
        Node <LinkComponent defaultValue={targetNode} setTarget={setTargetNode} linkType={links[1].linkType} options={nodeOptions} type={links[1].type} />
      </label>
      <label htmlFor="">
        Condition <LinkComponent defaultValue={targetCondition} setTarget={setTargetCondition} linkType={links[2].linkType} options={conditionOptions} type={links[2].type} />
      </label>
    </div>
  )
}
