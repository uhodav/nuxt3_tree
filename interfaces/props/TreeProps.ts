import type { RowObject } from "../RowObject";
import type { ColumnObject } from "../ColumnObject";

export interface TreeProps {
  /**
   * выбранные эллементв. Для инициализации достаточно объектов с id
   *
   * [{id}, ...]
   */
  value: Array<RowObject>
  items: Array<RowObject>
  columns?: Array<ColumnObject>
  useChecked?: boolean
  useSearch?: boolean
  useTags?: boolean
  multiSelect?: boolean
  loading?: boolean
  parentToChild?: boolean,
  openAfterSelect?: boolean,
}
