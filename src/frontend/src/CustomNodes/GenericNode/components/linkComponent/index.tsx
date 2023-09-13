import React, { useContext, useEffect, useState } from 'react'
import Dropdown from '../../../../components/dropdownComponent'
import { TabsContext } from '../../../../contexts/tabsContext'
import { NodeDataType, NodeType } from '../../../../types/flow'

type LinkComponentType = {
  defaultValue: string
  options: any[]
  type: string
  linkType: string
  data: NodeDataType
  index: number
  setTarget: Function
}

export const LinkComponent = ({ options, type, linkType, setTarget, defaultValue, data, index }: LinkComponentType) => {

  const [option, setOption] = useState<string>(defaultValue)
  const { flows, tabId } = useContext(TabsContext)
  const flowData = flows.filter((flow) => flow.id == tabId)[0].data

  const link = flowData != null ?
    flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0]
      ?
      flows.filter((flow) => flow.id == tabId)[0].data.nodes.filter((node) => node.data.id == data.id)[0].data.node.links[index]
      :
      ''
      : ''

      console.log(options)
  

  // useEffect(() => {
  //   console.log(option);
  // }, [option])

  // if (disabled) {
  //   return (
  //     <select onChange={(e) => setOption(e.target.value)} name="" id="">
  //       <option disabled value="">Choose previous option</option>
  //     </select>
  //   )
  // }


  return (
    <div className='mb-3'>
      <select className='bg-node-back rounded-xl px-4 py-1' value={option} onChange={(e) => { console.log(e.target.value) ;setOption(e.target.value); setTarget(e.target.value); link.to = e.target.value;}}>
        <option value="">Choose option...</option>
        {options.map((option) => {
          return (
            <option key={option.id} value={option.id}> {option.name} </option>
          )
        })}
      </select>
      {/* <Dropdown options={['Choose an option', ...options]} value={option} onSelect={e => {setOption(e === 'Choose an option' ? '' : e); setTarget(e === 'Choose an option' ? '' : e); link.to = e === 'Choose an option' ? '' : e}} /> */}
    </div>
  )
}
