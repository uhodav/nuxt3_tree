import type { RowObject } from "../RowObject";
import type { ColumnObject } from "../ColumnObject";

export interface TreeProps {
  value: Array<RowObject>
  items: Array<RowObject>
  columns?: Array<ColumnObject>
  useChecked?: boolean
  useSearch?: boolean
  multiSelect?: boolean
  loading?: boolean
  parentToChild?: boolean
}
