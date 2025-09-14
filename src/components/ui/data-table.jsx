import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react'

export default function DataTable({
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  onRowClick,
  className
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({})

  // Filter and search data
  const filteredData = data.filter(row => {
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = columns.some(col => {
        const value = row[col.key]
        return value && value.toString().toLowerCase().includes(searchLower)
      })
      if (!matchesSearch) return false
    }

    // Apply filters
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true
      return row[key] === value
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = pagination 
    ? sortedData.slice(startIndex, startIndex + pageSize)
    : sortedData

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleExport = () => {
    const csv = [
      columns.map(col => col.header).join(','),
      ...filteredData.map(row => 
        columns.map(col => {
          const value = row[col.key]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          {searchable && (
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {filterable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilters({})}>
                  Clear Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex gap-2">
          {exportable && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead 
                  key={column.key}
                  className={column.sortable ? 'cursor-pointer hover:bg-slate-50' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow 
                key={row.id || index}
                className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(column => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onRowClick?.(row)}>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}