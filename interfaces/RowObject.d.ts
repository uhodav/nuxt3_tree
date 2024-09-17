interface ColumnItemProps {
  value: string;
  url: string;
}

interface StateItemProps {
  [expanded?: string]: boolean;
  [checked?: string]: boolean;
  [finded?: string]: boolean;
  [disabled?: string]: boolean;
}

export interface RowObject {
  id: number;
  columns: Array<ColumnItemProps>;
  children?: Array<RowObject>;
  state?: StateItemProps;
  iconType: string;
}
