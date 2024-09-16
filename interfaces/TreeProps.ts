import type { RowObject } from "./RowObject";
import type { ColumnObject } from "../interfaces/ColumnObject";

export interface TreeProps {
  columns: Array<ColumnObject>
  items: Array<RowObject>,
}
