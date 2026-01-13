"use client"

import { toast } from "sonner"
type ToasterConfirmProps = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}
export function ToasterConfirm({
  title = "Xác nhận hành động",
  description = "Bạn có chắc muốn thực hiện thao tác này không?",
  confirmText = "Đồng ý",
  cancelText = "Huỷ",
  onConfirm,
}: ToasterConfirmProps) {
  toast.custom((t) => (
    <div className="flex flex-col gap-3 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg shadow-lg p-4 min-w-[320px] border">
      <div className="font-semibold text-base">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => toast.dismiss(t)}
          className="text-sm border px-3 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          {cancelText}
        </button>
        <button
          onClick={async () => {
            await onConfirm()
            toast.dismiss(t)
          }}
          className="text-sm px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 cursor-pointer"
        >
          {confirmText}
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
    dismissible: false
  })
}
