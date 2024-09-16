import type { ColumnObject } from "./ColumnObject";
import type { RowObject } from "../interfaces/RowObject";

export interface TreeRowProps {
  item: RowObject,
  columns?: Array<ColumnObject>;
}
