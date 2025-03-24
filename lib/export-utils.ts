import type React from "react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

type ExportFormat = "png" | "svg" | "pdf"

export async function exportChart(chartRef: React.RefObject<HTMLElement>, format: ExportFormat, filename: string) {
  if (!chartRef.current) return

  const chartContainer = chartRef.current

  try {
    switch (format) {
      case "png":
        exportAsPNG(chartContainer, filename)
        break
      case "svg":
        exportAsSVG(chartContainer, filename)
        break
      case "pdf":
        exportAsPDF(chartContainer, filename)
        break
    }
  } catch (error) {
    console.error("Error exporting chart:", error)
    alert("Erro ao exportar o gráfico. Por favor, tente novamente.")
  }
}

async function exportAsPNG(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2, // Higher scale for better quality
  })

  const dataUrl = canvas.toDataURL("image/png")
  downloadFile(dataUrl, `${filename}.png`)
}

function exportAsSVG(element: HTMLElement, filename: string) {
  const svgElement = element.querySelector("svg")
  if (!svgElement) {
    throw new Error("SVG element not found")
  }

  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGElement

  // Set width and height attributes
  svgClone.setAttribute("width", svgElement.clientWidth.toString())
  svgClone.setAttribute("height", svgElement.clientHeight.toString())

  // Convert to string
  const svgString = new XMLSerializer().serializeToString(svgClone)
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
  const svgUrl = URL.createObjectURL(svgBlob)

  downloadFile(svgUrl, `${filename}.svg`)

  // Clean up
  setTimeout(() => URL.revokeObjectURL(svgUrl), 100)
}

async function exportAsPDF(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2, // Higher scale for better quality
  })

  const imgData = canvas.toDataURL("image/png", 1.0)
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
  })

  // Calculate dimensions to fit the chart properly
  const imgWidth = 280 // mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight)
  pdf.save(`${filename}.pdf`)
}

function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  link.click()
}

