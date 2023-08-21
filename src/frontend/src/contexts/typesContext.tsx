import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Node } from "reactflow";
import { typesContextType } from "../types/typesContext";
import { getAll } from "../controllers/API";
import { APIClassType, APIKindType, DefaultLinkClassType } from "../types/api";
import { cond } from "lodash";
import { TabsContext } from "./tabsContext";

//context to share types adn functions from nodes to flow

const initialValue: typesContextType = {
  reactFlowInstance: null,
  setReactFlowInstance: () => { },
  deleteNode: () => { },
  types: {},
  setTypes: () => { },
  templates: {},
  setTemplates: () => { },
  data: {},
  setData: () => { },
};

export const typesContext = createContext<typesContextType>(initialValue);

export function TypesProvider({ children }: { children: ReactNode }) {

  const [types, setTypes] = useState({});
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [templates, setTemplates] = useState({});
  const [data, setData] = useState({});
  const { flows } = useContext(TabsContext)

  const extConditions = {}
  for (let i = 1; i <= 99; i++) {
    const newCondition = {
      placeholder: `condition${i}`,
      name: `condition${i}`,
      list: false,
      required: true,
      show: false,
      type: "condition",
      multiline: false,
      value: "",
      display_name: `condition${i}`,
    }
    extConditions[`condition${i}`] = newCondition
  }
  // console.log(extConditions)

  // useEffect(() => {
  //   console.log(templates)
  // }, [templates])

  const generateConditions = (count: number) => {
    const result: any[] = []
    for (let i = 0; i <= count; i++) {
      result.push({
        placeholder: `Condition ${i}`,
        name: `Condition ${i}`,
        list: false,
        required: false,
        show: true,
        type: "str",
        multiline: false,
        value: "",
        display_name: `Condition ${i}`
      })
    }
    return result
  }

  useEffect(() => {
    let delay = 1000; // Start delay of 1 second
    let intervalId = null;
    let retryCount = 0; // Count of retry attempts
    const maxRetryCount = 5; // Max retry attempts

    // We will keep a flag to handle the case where the component is unmounted before the API call resolves.
    let isMounted = true;

    async function getTypes(): Promise<void> {
      const default_node: APIClassType = {
        base_classes: ["default_node"],
        description: "test default node",
        display_name: "default_node",
        documentation: "test field",
        pre_responses: [],
        pre_transitions: [],
        name: "default_node",
        conditions: [
          {
            conditionID: 0,
            left: false,
            name: 'condition0',
            priority: 1,
            required: true,
            type: `condition`,
            transitionType: 'default',
            intent: '',
            action: '',
            variables: ''
          },
        ],
        template: {
          response: {
            placeholder: "response",
            name: "response",
            list: false,
            required: true,
            show: true,
            type: "str",
            multiline: false,
            value: "",
            display_name: "Some response"
          },

        }
      }
      const start_node: APIClassType = {
        base_classes: ["start_node"],
        description: "test start node",
        display_name: "start_node",
        documentation: "test field",
        conditions: [
          {
            conditionID: 0,
            left: false,
            name: "Start condition",
            priority: 1,
            required: true,
            type: 'start_condition',
            transitionType: 'default',
            intent: '',
            action: '',
            variables: ''
          }
        ],
        template: {
          response: {
            placeholder: "response",
            name: "response",
            list: false,
            required: true,
            show: true,
            type: "str",
            multiline: false,
            value: "",
            display_name: "Some response"
          },
        }
      }
      const fallback_node: APIClassType = {
        base_classes: ["fallback_node"],
        description: "test fallback_node",
        display_name: "fallback_node",
        documentation: "test field",
        template: {
          response: {
            placeholder: "response",
            name: "response",
            list: false,
            required: true,
            show: true,
            type: "str",
            multiline: false,
            value: "",
            display_name: "Some response"
          },
        }
      }
      const llm_node: APIClassType = {
        base_classes: ["llm_node"],
        description: "test llm_node",
        display_name: "llm_node",
        documentation: "test field",
        template: {
          model_name: {
            placeholder: "Model name",
            name: "model_name",
            list: false,
            required: true,
            show: true,
            type: "str",
            multiline: false,
            value: "",
            display_name: "Model name"
          },
          prompt: {
            placeholder: "Prompt",
            name: "prompt",
            list: false,
            required: true,
            show: true,
            type: "str",
            multiline: false,
            value: "",
            display_name: "Prompt"
          },
          exit: {
            placeholder: "Exit",
            name: "exit",
            list: false,
            required: true,
            show: true,
            type: "str",
            multiline: false,
            value: "",
            display_name: "Exit"
          },
        }
      }
      const default_nodes = {
        default_node: default_node,
        start_node: start_node,
        fallback_node: fallback_node,
        llm_node: llm_node,
      }
      

      const default_link: APIClassType = {
        display_name: "default_link",
        base_classes: ["links"],
        template: {},
        links: [
          {
            name: "To Flow",
            type: "to_flow_link",
            required: true,
            options: [],
            placeholder: "To flow",
            linkType: "flow",
            to: ""
          },
          {
            name: "To Node",
            type: "to_node_link",
            required: true,
            options: [],
            placeholder: "To node",
            linkType: "node",
            to: ""
          },
          {
            name: "To Condition",
            type: "to_condition_link",
            required: true,
            options: [],
            placeholder: "To condition",
            linkType: "condition",
            to: ""
          },
        ],
        fromFlow: '',
        fromNode: '',
        fromCondition: '',
      }

      const links = {
        default_link: default_link
      }

      // const samples = {
      //   sample_1: {
      //     display_name: "samples",
      //     base_classes: ["samples"],
      //     description: "sample 1",
      //     nodes: [
      //       start_node, default_node, default_node, end_node
      //     ]
      //   }
      // }
      try {
        const result = { data: {} }
        const ournode = result.data
        ournode['default_nodes'] = default_nodes
        ournode['links'] = links
        // FIXME: FIX SAMPLES
        // ournode['samples'] = samples
        // Make sure to only update the state if the component is still mounted.
        if (isMounted) {
          setData(result.data);
          // console.log(result.data)
          setTemplates(
            Object.keys(result.data).reduce((acc, curr) => {
              Object.keys(result.data[curr]).forEach((c: keyof APIKindType) => {
                acc[c] = result.data[curr][c];
              });
              return acc;
            }, {}),
          );
          // Set the types by reducing over the keys of the result data and updating the accumulator.
          setTypes(
            // Reverse the keys so the tool world does not overlap
            Object.keys(result.data)
              .reverse()
              .reduce((acc, curr) => {
                Object.keys(result.data[curr]).forEach(
                  (c: keyof APIKindType) => {
                    acc[c] = curr;
                    // Add the base classes to the accumulator as well.
                    result.data[curr][c].base_classes?.forEach((b) => {
                      acc[b] = curr;
                    });
                  },
                );
                return acc;
              }, {}),
          );
        }
        // Clear the interval if successful.
        clearInterval(intervalId);
      } catch (error) {
        retryCount++;
        // On error, double the delay for the next attempt up to a maximum.
        delay = Math.min(30000, delay * 2);
        // Log errors but don't do anything else - the function will try again on the next interval.
        console.error(error);
        // Clear the old interval and start a new one with the new delay.
        if (retryCount <= maxRetryCount) {
          clearInterval(intervalId);
          intervalId = setInterval(getTypes, delay);
        } else {
          console.error("Max retry attempts reached. Stopping retries.");
        }
      }
    }

    // Start the initial interval.
    intervalId = setInterval(getTypes, delay);

    return () => {
      // This will clear the interval when the component unmounts, or when the dependencies of the useEffect hook change.
      clearInterval(intervalId);
      // Indicate that the component has been unmounted.
      isMounted = false;
    };
  }, []);

  function deleteNode(idx: string) {
    reactFlowInstance.setNodes(
      reactFlowInstance.getNodes().filter((n: Node) => n.id !== idx),
    );
    reactFlowInstance.setEdges(
      reactFlowInstance
        .getEdges()
        .filter((ns) => ns.source !== idx && ns.target !== idx),
    );
  }

  // console.log(data)

  return (
    <typesContext.Provider
      value={{
        types,
        setTypes,
        reactFlowInstance,
        setReactFlowInstance,
        deleteNode,
        setTemplates,
        templates,
        data,
        setData,
      }}
    >
      {children}
    </typesContext.Provider>
  );
}
