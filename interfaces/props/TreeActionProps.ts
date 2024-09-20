
interface TreeActionShowProps {
  checked: {
    type: Boolean
    defualt: 0
  },
  expanded: Boolean
}


export interface TreeActionProps {
  options: TreeActionShowProps
  disabled?: TreeActionShowProps
  checked?: Boolean
  expanded?: Boolean
}
