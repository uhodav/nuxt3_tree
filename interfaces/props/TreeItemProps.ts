import type { ColumnObject } from "../ColumnObject";
import type { RowObject } from "../RowObject";

export interface TreeItemProps {
  item: RowObject
  columns?: Array<ColumnObject>
  useChecked: Boolean
  level?: number // Уровень вложения
}
