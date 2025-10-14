export function paginateArray<T>(items: T[], page: number, perPage: number = 9) {
  const total = items.length
  const totalPages = Math.ceil(total / perPage)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage

  return {
    slice: items.slice(startIndex, endIndex),
    page: currentPage,
    perPage,
    total,
    totalPages,
  }
}