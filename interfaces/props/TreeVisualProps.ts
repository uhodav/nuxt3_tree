import type { RowObject } from "../RowObject";
import type { ColumnObject } from "../ColumnObject";

export interface TreeVisualProps {
  items: Array<RowObject>
  columns?: Array<ColumnObject>
  useChecked: boolean
  multiSelect: boolean
  loading: boolean
}
