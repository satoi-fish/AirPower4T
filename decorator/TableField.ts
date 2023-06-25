/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * # 表格字段的注解
 * @author Hamm
 */
import { AirModel } from '../base/AirModel'
import { AirTableFieldConfig } from '../config/AirTableFieldConfig'
import { ITableFieldConfig } from '../interface/ITableFieldConfig'
import { getFieldName } from './Custom'

/**
 * # 表格字段key
 */
const tableFieldMetaKey = '__table_field_'

/**
 * # 表格字段列表key
 */
const tableFieldListMetaKey = '__table_field_list__'

/**
 * # 为属性标记是表格字段
 * @param tableFieldConfig [可选]表格列的配置
 */
export const TableField = (tableFieldConfig?: ITableFieldConfig) => (target: any, key: string) => {
  if (!tableFieldConfig) {
    tableFieldConfig = new AirTableFieldConfig()
  }
  tableFieldConfig.key = key
  const list: string[] = target[tableFieldListMetaKey] || []
  list.push(key)
  Object.defineProperty(target, tableFieldListMetaKey, {
    enumerable: false,
    value: list,
    writable: false,
    configurable: false,
  })
  Object.defineProperty(target, `${tableFieldMetaKey + key}`, {
    enumerable: false,
    value: tableFieldConfig,
    writable: false,
    configurable: false,
  })
}

/**
 * # 获取对象的属性表格的配置
 * @param target 目标对象
 * @param fieldKey 属性名
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTableFieldConfig(target: any, fieldKey: string): AirTableFieldConfig | null {
  let tableFieldConfig = target[tableFieldMetaKey + fieldKey]
  if (!tableFieldConfig) {
    // 没有查询到配置
    const superClass = Object.getPrototypeOf(target)
    if (superClass.constructor.name === AirModel.name) {
      return null
    }
    tableFieldConfig = getTableFieldConfig(superClass, fieldKey)
  }
  if (!tableFieldConfig) {
    // 一直遍历到AirModel都没找到
    return null
  }
  if (!tableFieldConfig.label || tableFieldConfig.label === tableFieldConfig.key) {
    tableFieldConfig.label = getFieldName(target, fieldKey)
  }

  return Object.assign(new AirTableFieldConfig(), tableFieldConfig)
}

/**
 * # 获取标记了表格配置的字段列表
 * @param target 目标对象
 */
export function getCustomTableFieldNameList(target: any): string[] {
  let list: string[] = target[tableFieldListMetaKey] || []
  const superClass = Object.getPrototypeOf(target)
  if (superClass.constructor.name !== AirModel.name) {
    list = list.concat(getCustomTableFieldNameList(superClass))
  }
  return list
}

/**
 * # 获取字段标记的表格字段配置列表
 * @param fieldNameList 字段列表
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCustomTableFieldList(target: any, fieldNameList: string[]) {
  const tableFieldConfigList: AirTableFieldConfig[] = []
  const keyList = []
  if (fieldNameList.length === 0) {
    fieldNameList = getCustomTableFieldNameList(target)
  }
  for (const fieldName of fieldNameList) {
    if (keyList.indexOf(fieldName) < 0) {
      const config = getTableFieldConfig(target, fieldName)
      if (config) {
        keyList.push(config.key)
        tableFieldConfigList.push(config)
      }
    }
  }
  return tableFieldConfigList
}
