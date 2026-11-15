import { DocumentPackBadge, type DocumentFile } from "./components/DocumentPackBadge"
const coverStandard = new URL("../../public/images/document-cover-svg/cover-itinerary-standard.svg", import.meta.url).href
const coverSeasonal = new URL("../../public/images/document-cover-svg/cover-itinerary-spring.svg", import.meta.url).href
const coverForm = new URL("../../public/images/document-cover-svg/cover-profile-form.svg", import.meta.url).href
const coverVisa = new URL("../../public/images/document-cover-svg/cover-visa-guide.svg", import.meta.url).href
const showFallback = new URLSearchParams(window.location.search).has("fallback")
const firstCover = showFallback ? "/missing-document-cover.svg" : coverStandard

const files: DocumentFile[] = [
  { id: "route", title: "经典线路行程", detail: "示例 PDF · 9 页", href: "/sample-files/route-summary.txt", downloadName: "route-summary.txt", type: "PDF", cover: firstCover },
  { id: "seasonal", title: "节日版行程", detail: "示例 PDF · 9 页", href: "/sample-files/seasonal-route.txt", downloadName: "seasonal-route.txt", type: "PDF", cover: coverSeasonal },
  { id: "form", title: "旅客资料表", detail: "示例表单 · DOCX", href: "/sample-files/traveller-form.txt", downloadName: "traveller-form.txt", type: "DOCX", cover: coverForm },
  { id: "visa", title: "签证材料清单", detail: "示例 PDF · 14 页", href: "/sample-files/visa-checklist.txt", downloadName: "visa-checklist.txt", type: "PDF", cover: coverVisa },
]

function App() {
  return (
    <main className="demo-shell">
      <section className="demo-card" aria-labelledby="demo-title">
        <div className="demo-inner">
          <p className="demo-kicker">TRAVEL DOCUMENTS</p>
          <h1 id="demo-title">出行资料，收在一个入口里</h1>
          <p className="demo-copy">点击查看并下载全部出行资料。</p>
          <DocumentPackBadge
            label={`${files.length} 份出行资料`}
            files={files}
            previewImages={[firstCover, coverForm, coverVisa]}
            badgeClassName="md:gap-8"
            imageMotion={{
              folderSize: { width: 48, height: 36 },
              teaserImageSize: { width: 28, height: 36 },
              hoverImageSize: { width: 90, height: 120 },
              hoverTranslateY: -108,
              hoverSpread: 38,
              hoverRotation: 7,
            }}
          />
        </div>
      </section>
    </main>
  )
}

export default App;
