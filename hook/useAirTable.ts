import { AirEntity } from '../base/AirEntity'
import { AirDialog } from '../helper/AirDialog'
import { ClassConstructor } from '../type/ClassConstructor'
import { AirAbstractEntityService } from '../base/AirAbstractEntityService'
import { IUseTableOption } from '../interface/IUseTableOption'
import { AirNotification } from '../feedback/AirNotification'
import { IUseTableResult } from '../interface/IUseTableResult'
import { airTableHook } from './airTableHook'
import { AirI18n } from '../helper/AirI18n'
import { AirConfirm } from '@/airpower/feedback/AirConfirm'

/**
 * # 引入表格使用的Hook
 * @param entityClass 实体类
 * @param serviceClass 表格使用的Service类
 * @param option (可选) 更多配置
 * @author Hamm
 */
export function useAirTable<E extends AirEntity, S extends AirAbstractEntityService<E>>(entityClass: ClassConstructor<E>, serviceClass: ClassConstructor<S>, option: IUseTableOption<E> = {}): IUseTableResult<E, S> {
  /**
   * # 表格Hook返回对象
   */
  const result = airTableHook(entityClass, serviceClass, option)

  /**
   * # 表格行编辑事件
   * @param row 行数据
   */
  async function onEdit(row: E) {
    if (!option.editView) {
      await AirNotification.warning('请为 useAirTableList 的 option 传入 editor')
      return
    }
    try {
      await AirDialog.show(option.editView, row)
    } finally {
      result.onReloadData()
    }
  }

  /**
   * # 表格行删除事件
   * @param row 行数据
   */
  async function onDelete(row: E) {
    await result.service.delete(row.id, AirI18n.get().DeleteSuccess || '删除成功')
    result.onReloadData()
  }

  /**
   * # 表格行禁用事件
   * @param row 行数据
   */
  async function onDisable(row: E) {
    await AirConfirm.warning('是否确认禁用当前选择的数据？', '禁用提醒')
    await result.service.disable(row.id, AirI18n.get().DisableSuccess || '禁用成功')
    result.onReloadData()
  }

  /**
   * # 表格行启用事件
   * @param row 行数据
   */
  async function onEnable(row: E) {
    await AirConfirm.warning('是否确认启用当前选择的数据？', '启用提醒')
    await result.service.enable(row.id, AirI18n.get().EnableSuccess || '启用成功')
    result.onReloadData()
  }

  return Object.assign(result, {
    onEdit,
    onDelete,
    onDisable,
    onEnable,
  }) as IUseTableResult<E, S>
}
