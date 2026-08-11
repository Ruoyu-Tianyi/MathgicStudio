// 浏览器端 PDF 文本提取（pdfjs-dist，按需动态加载，不占首屏体积）

/** 提取 PDF 全部页面的文本，按页拼接 */
export async function extractPdfText(file: File): Promise<string> {
  const [pdfjsLib, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default

  const buf = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: buf })
  const pdf = await loadingTask.promise
  const parts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) parts.push(text)
  }
  await loadingTask.destroy()
  return parts.join('\n\n')
}
