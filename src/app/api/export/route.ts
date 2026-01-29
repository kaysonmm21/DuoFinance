import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { createClient } from '@/lib/supabase/server'
import { format, parse, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const monthParam = searchParams.get('month') || format(new Date(), 'yyyy-MM')
  const monthDate = parse(monthParam, 'yyyy-MM', new Date())
  const monthLabel = format(monthDate, 'MMMM yyyy')
  const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd')

  // Fetch transactions for the month
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 })
  }

  // Fetch expense categories (sorted by name)
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .order('name')

  if (catError) {
    return NextResponse.json({ error: catError.message }, { status: 500 })
  }

  // Fetch budgets for this month (with fallback to previous months)
  const { data: monthBudgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('budget_month', monthParam)

  const budgetMap = new Map<string, number>()
  for (const b of (monthBudgets || [])) {
    budgetMap.set(b.category_id, b.amount)
  }

  // Fallback: for categories without a budget this month, check previous months
  const missingBudgetCats = (categories || [])
    .filter(c => !budgetMap.has(c.id))
    .map(c => c.id)

  if (missingBudgetCats.length > 0) {
    const { data: fallbackBudgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .in('category_id', missingBudgetCats)
      .lt('budget_month', monthParam)
      .order('budget_month', { ascending: false })

    if (fallbackBudgets) {
      for (const b of fallbackBudgets) {
        if (!budgetMap.has(b.category_id)) {
          budgetMap.set(b.category_id, b.amount)
        }
      }
    }
  }

  // Separate expense and income transactions
  const expenseTransactions = (transactions || []).filter((t: any) => t.type === 'expense')
  const incomeTransactions = (transactions || []).filter((t: any) => t.type === 'income')

  // Group expense transactions by category
  const expenseByCategory = new Map<string, any[]>()
  for (const cat of (categories || [])) {
    expenseByCategory.set(cat.id, [])
  }
  for (const tx of expenseTransactions) {
    const catId = tx.category_id || 'uncategorized'
    if (!expenseByCategory.has(catId)) {
      expenseByCategory.set(catId, [])
    }
    expenseByCategory.get(catId)!.push(tx)
  }

  // Build column order: [label col] + [expense categories] + [Notes, Total Spent, Revenues]
  const expenseCats = categories || []
  const maxTransactions = Math.max(
    1,
    ...expenseCats.map(c => expenseByCategory.get(c.id)?.length || 0),
    incomeTransactions.length
  )

  // Create workbook
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(`Spending ${monthLabel}`)

  // Define column positions
  // Col 1: Row label
  // Col 2..N: expense categories
  // Col N+1: Notes
  // Col N+2: Total Spent
  // Col N+3: Revenues
  const catStartCol = 2
  const notesCol = catStartCol + expenseCats.length
  const totalSpentCol = notesCol + 1
  const revenuesCol = totalSpentCol + 1

  // Styles
  const magentaFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  }
  const headerFont: Partial<ExcelJS.Font> = { bold: true, size: 11 }
  const defaultFont: Partial<ExcelJS.Font> = { size: 11 }
  const whiteFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, size: 11 }
  const whiteBoldFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }

  // Row 1: Title
  const titleRow = sheet.getRow(1)
  sheet.getCell(1, 1).value = `Spending ${monthLabel}`
  sheet.getCell(1, 1).font = { bold: true, size: 13 }

  // Row 2: Column headers
  const headerRow = sheet.getRow(2)
  sheet.getCell(2, 1).value = ''
  expenseCats.forEach((cat, i) => {
    const cell = sheet.getCell(2, catStartCol + i)
    cell.value = cat.name
    cell.font = headerFont
    cell.alignment = { horizontal: 'center' }
  })
  sheet.getCell(2, notesCol).value = 'Notes'
  sheet.getCell(2, notesCol).font = headerFont
  sheet.getCell(2, totalSpentCol).value = 'Total Spent'
  sheet.getCell(2, totalSpentCol).font = headerFont
  sheet.getCell(2, revenuesCol).value = 'Revenues'
  sheet.getCell(2, revenuesCol).font = headerFont

  // Row 3: Target Value (budget amounts as negative)
  sheet.getCell(3, 1).value = 'Target Value'
  sheet.getCell(3, 1).font = whiteBoldFont
  sheet.getCell(3, 1).fill = magentaFill

  let totalTarget = 0
  expenseCats.forEach((cat, i) => {
    const cell = sheet.getCell(3, catStartCol + i)
    const budget = budgetMap.get(cat.id)
    if (budget) {
      cell.value = -budget
      totalTarget += budget
    }
    cell.font = whiteFont
    cell.fill = magentaFill
    cell.numFmt = '#,##0.00'
  })
  // Notes + Total Spent + Revenues cells in target row
  sheet.getCell(3, notesCol).fill = magentaFill
  sheet.getCell(3, totalSpentCol).value = -totalTarget
  sheet.getCell(3, totalSpentCol).font = whiteFont
  sheet.getCell(3, totalSpentCol).fill = magentaFill
  sheet.getCell(3, totalSpentCol).numFmt = '#,##0.00'

  // Total revenues
  const totalRevenue = incomeTransactions.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
  sheet.getCell(3, revenuesCol).value = totalRevenue
  sheet.getCell(3, revenuesCol).font = whiteFont
  sheet.getCell(3, revenuesCol).fill = magentaFill
  sheet.getCell(3, revenuesCol).numFmt = '#,##0.00'

  // Calculate totals per category for Difference row
  const categoryTotals = new Map<string, number>()
  for (const cat of expenseCats) {
    const txs = expenseByCategory.get(cat.id) || []
    const total = txs.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
    categoryTotals.set(cat.id, total)
  }

  // Row 4: Difference (target - spent)
  sheet.getCell(4, 1).value = 'Difference'
  sheet.getCell(4, 1).font = whiteBoldFont
  sheet.getCell(4, 1).fill = magentaFill

  let totalSpent = 0
  expenseCats.forEach((cat, i) => {
    const cell = sheet.getCell(4, catStartCol + i)
    const budget = budgetMap.get(cat.id) || 0
    const spent = categoryTotals.get(cat.id) || 0
    totalSpent += spent
    cell.value = budget > 0 ? budget - spent : -spent
    cell.font = whiteFont
    cell.fill = magentaFill
    cell.numFmt = '#,##0.00'
  })
  sheet.getCell(4, notesCol).fill = magentaFill
  sheet.getCell(4, totalSpentCol).value = totalTarget - totalSpent
  sheet.getCell(4, totalSpentCol).font = whiteFont
  sheet.getCell(4, totalSpentCol).fill = magentaFill
  sheet.getCell(4, totalSpentCol).numFmt = '#,##0.00'
  sheet.getCell(4, revenuesCol).fill = magentaFill

  // Rows 5+: Transaction data
  // Each category column lists its transactions top-to-bottom
  const dataStartRow = 5

  // Build a running balance starting from total revenue
  let runningBalance = totalRevenue

  for (let rowIdx = 0; rowIdx < maxTransactions; rowIdx++) {
    const excelRow = dataStartRow + rowIdx
    let rowExpenseTotal = 0
    let rowDescription = ''

    expenseCats.forEach((cat, colIdx) => {
      const txs = expenseByCategory.get(cat.id) || []
      if (rowIdx < txs.length) {
        const tx = txs[rowIdx]
        const cell = sheet.getCell(excelRow, catStartCol + colIdx)
        cell.value = -Number(tx.amount)
        cell.numFmt = '#,##0.00'
        cell.font = defaultFont
        rowExpenseTotal += Number(tx.amount)

        // Use the description/notes for the Notes column
        if (!rowDescription && (tx.description || tx.notes)) {
          rowDescription = tx.notes || tx.description
        }
      }
    })

    // Notes column
    if (rowDescription) {
      const notesCell = sheet.getCell(excelRow, notesCol)
      notesCell.value = rowDescription
      notesCell.font = defaultFont
    }

    // Total Spent for this row
    if (rowExpenseTotal > 0) {
      const totalCell = sheet.getCell(excelRow, totalSpentCol)
      totalCell.value = -rowExpenseTotal
      totalCell.numFmt = '#,##0.00'
      totalCell.font = defaultFont
    }

    // Revenues column — list income transactions
    if (rowIdx < incomeTransactions.length) {
      const revCell = sheet.getCell(excelRow, revenuesCol)
      revCell.value = Number(incomeTransactions[rowIdx].amount)
      revCell.numFmt = '#,##0.00'
      revCell.font = defaultFont
    }
  }

  // Total row
  const totalRowNum = dataStartRow + maxTransactions
  sheet.getCell(totalRowNum, 1).value = 'Total'
  sheet.getCell(totalRowNum, 1).font = whiteBoldFont
  sheet.getCell(totalRowNum, 1).fill = magentaFill

  expenseCats.forEach((cat, i) => {
    const cell = sheet.getCell(totalRowNum, catStartCol + i)
    const total = categoryTotals.get(cat.id) || 0
    cell.value = total > 0 ? -total : 0
    cell.numFmt = '#,##0.00'
    cell.font = whiteFont
    cell.fill = magentaFill
  })

  sheet.getCell(totalRowNum, notesCol).fill = magentaFill
  sheet.getCell(totalRowNum, totalSpentCol).value = -totalSpent
  sheet.getCell(totalRowNum, totalSpentCol).numFmt = '#,##0.00'
  sheet.getCell(totalRowNum, totalSpentCol).font = whiteFont
  sheet.getCell(totalRowNum, totalSpentCol).fill = magentaFill
  sheet.getCell(totalRowNum, revenuesCol).value = totalRevenue
  sheet.getCell(totalRowNum, revenuesCol).numFmt = '#,##0.00'
  sheet.getCell(totalRowNum, revenuesCol).font = whiteFont
  sheet.getCell(totalRowNum, revenuesCol).fill = magentaFill

  // Set column widths
  sheet.getColumn(1).width = 14
  expenseCats.forEach((_, i) => {
    sheet.getColumn(catStartCol + i).width = 16
  })
  sheet.getColumn(notesCol).width = 28
  sheet.getColumn(totalSpentCol).width = 14
  sheet.getColumn(revenuesCol).width = 14

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()

  const filename = `Spending_${monthLabel.replace(' ', '_')}.xlsx`

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
