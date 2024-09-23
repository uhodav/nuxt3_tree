interface ColumnItemProps {
  value: string;
  url: string;
}

interface StateItemProps {
  expanded: boolean;
  checked: boolean;
  finded: boolean;
  disabled: boolean;
  show: boolean;
  indeterminate: boolean;
}

export interface RowObject {
  id: number;
  level? : number;
  childrens? : number;
  parentId? : number;
  columns?: Object<ColumnItemProps>;
  children?: Array<RowObject>;
  state?: StateItemProps;
  iconType?: string;
}
