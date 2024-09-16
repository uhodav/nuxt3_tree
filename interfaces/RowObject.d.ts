interface ColumnItemProps {
  value: string;
  url: string;
}

interface StateItemProps {
  expanded: string;
  checked: string;
  finded: string;
  disabled: string;
}

export interface RowObject {
  id: number;
  columns: Array<ColumnItemProps>;
  children: Array<RowObject>;
  state: StateItemProps;
  iconType: string;
}
