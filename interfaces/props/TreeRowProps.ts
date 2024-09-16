
import type { RowObject } from "../RowObject";
import type { ColumnObject } from "../ColumnObject";

export interface TreeRowProps {
  item: RowObject
  columns?: Array<ColumnObject>
  useChecked: Boolean
  level: number // Уровень вложения
}
