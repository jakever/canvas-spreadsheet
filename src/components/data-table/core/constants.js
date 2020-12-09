export const CSS_PREFIX = "xs-grid-table";

export const HEADER_HEIGHT = 44; // 表头行高

export const ROW_INDEX_WIDTH = 0; // 索引列宽
export const CHECK_BOX_WIDTH = 36; // 勾选框列宽

export const CELL_HEIGHT = 44; // 表格body部分的行高
export const MIN_CELL_WIDTH = 100; // 表格body部分的最小列宽
export const MIN_CELL_HEIGHT = 44; // 表格body部分的最小行高

export const SCROLLER_TRACK_SIZE = 16; // 滚动条轨道尺寸
export const SCROLLER_SIZE = 8; // 滚动条滑块尺寸
export const SCROLLER_COLOR = "#dee0e3"; // 滚动条滑块颜色
export const SCROLLER_FOCUS_COLOR = "#bbbec4"; // 滚动条滑块聚焦时的颜色

export const HEADER_BG_COLOR = "#f5f8fa"; // 表头颜色
export const ROW_FOCUS_COLOR = "#f0f5ff";

export const SELECT_BORDER_COLOR = "rgb(82,146,247)"; // 选中区域边框颜色
export const SELECT_AREA_COLOR = "rgba(82,146,247,0.1)"; // 选中区域背景颜色
export const SELECT_BG_COLOR = "rgba(82,146,247,0.1)"; // 当前焦点单元格所在行、列的背景色

export const READONLY_COLOR = "#f8f8f9"; // 单元格只读背景色
export const READONLY_TEXT_COLOR = "#80848f"; // 单元格只读文本颜色
export const ERROR_TIP_COLOR = "#ED3F14"; // 单元格错误提示文本颜色

export const SIZE_MAP = { // 尺寸枚举映射
  mini: 100,
  small: 140,
  medium: 200,
  large: 300
};

export const VALIDATOR_TYPES = [ // 校验类型枚举映射
  'month',
  'date',
  'datetime',
  'number',
  'phone',
  'email',
  'select'
]