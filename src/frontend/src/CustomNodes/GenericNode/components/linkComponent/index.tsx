import React, { useContext, useEffect, useState } from 'react'
import { TabsContext } from '../../../../contexts/tabsContext'

type LinkComponentType = {
  defaultValue: string
  options: any[]
  type: string
  linkType: string
  setTarget: Function
}

export const LinkComponent = ({options, type, linkType, setTarget, defaultValue}: LinkComponentType) => {

  const [option, setOption] = useState<string>(defaultValue)
  const { flows } = useContext(TabsContext)

  useEffect(() => {
    console.log(option);
  }, [option])

  // if (disabled) {
  //   return (
  //     <select onChange={(e) => setOption(e.target.value)} name="" id="">
  //       <option disabled value="">Choose previous option</option>
  //     </select>
  //   )
  // }


  return (
    <div>
      <select className='bg-node-back rounded-xl px-4 py-1' value={option} onChange={(e) => {setOption(e.target.value); setTarget(e.target.value)}}>
        <option value="">Choose option...</option>
        {options.map((option) => {
          return (
            <option key={option} value={option}> {option} </option>
          )
        })}
      </select>
    </div>
  )
}
