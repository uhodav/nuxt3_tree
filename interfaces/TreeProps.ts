import type { RowObject } from "./RowObject";
import type { ColumnObject } from "./ColumnObject";

export interface TreeProps {
  value: Array<any> | any;
  columns?: Array<ColumnObject>;
  items: Array<RowObject>;
}
