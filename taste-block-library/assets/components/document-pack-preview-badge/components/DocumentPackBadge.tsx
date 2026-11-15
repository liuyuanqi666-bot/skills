import { useRef } from "react"

import { ImagesBadge, type ImagesBadgeProps } from "./ImagesBadge"

export type DocumentFile = {
  id: string
  title: string
  detail: string
  href: string
  downloadName: string
  type: string
  cover?: string
}

export type DocumentPackBadgeProps = {
  label: string
  files: DocumentFile[]
  dialogTitle?: string
  previewImages?: string[]
  badgeClassName?: string
  imageMotion?: Pick<
    ImagesBadgeProps,
    "folderSize" | "teaserImageSize" | "hoverImageSize" | "hoverTranslateY" | "hoverSpread" | "hoverRotation"
  >
}

export function DocumentPackBadge({
  label,
  files,
  dialogTitle = "选择要下载的资料",
  previewImages = files.flatMap((file) => file.cover ? [file.cover] : []).slice(0, 3),
  badgeClassName,
  imageMotion,
}: DocumentPackBadgeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        className="document-pack-trigger"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <ImagesBadge text={label} images={previewImages} className={badgeClassName} {...imageMotion} />
      </button>

      <dialog
        ref={dialogRef}
        className="document-pack-dialog"
        aria-labelledby="document-pack-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
      >
        <div className="document-pack-sheet">
          <header>
            <div>
              <p>{files.length} 个文件</p>
              <h2 id="document-pack-title">{dialogTitle}</h2>
            </div>
            <button type="button" className="close-button" onClick={() => dialogRef.current?.close()} aria-label="关闭">
              ×
            </button>
          </header>

          <div className="file-list">
            {files.map((file) => (
              <a key={file.id} className="file-row" href={file.href} download={file.downloadName}>
                <span className="file-cover" aria-hidden="true">
                  <span>{file.type}</span>
                  {file.cover ? (
                    <img src={file.cover} alt="" onError={(event) => { event.currentTarget.hidden = true }} />
                  ) : null}
                </span>
                <span className="file-meta">
                  <strong>{file.title}</strong>
                  <small>{file.detail}</small>
                </span>
                <span className="download-icon" aria-hidden="true">↓</span>
              </a>
            ))}
          </div>
        </div>
      </dialog>
    </>
  )
}
