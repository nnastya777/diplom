export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Экранирование значений с запятыми или кавычками
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  downloadFile(csvContent, filename, "text/csv;charset=utf-8;")
}

export function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, "application/json")
}

export function exportToExcel(data: any[], filename: string) {
  // Для Excel используем CSV с BOM для корректного отображения кириллицы
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(";"), // Excel в русской локали использует точку с запятой
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (typeof value === "string" && (value.includes(";") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(";"),
    ),
  ].join("\n")

  // Добавляем BOM для корректного отображения кириллицы в Excel
  const BOM = "\uFEFF"
  downloadFile(BOM + csvContent, filename, "text/csv;charset=utf-8;")
}

function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

// Форматирование даты для отчетов
export function formatDateForReport(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

// Форматирование времени
export function formatTimeForReport(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Форматирование длительности (в минутах)
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}ч ${mins}м`
}
