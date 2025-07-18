import React, { useState, useMemo } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para la configuración de columnas
export interface TableColumn<T = any> {
  key: string;
  header: string;
  // Función para renderizar el contenido de la celda
  cell?: (row: T, index: number) => React.ReactNode;
  // Función para obtener el valor a mostrar (para ordenamiento)
  accessor?: (row: T) => any;
  // Si la columna es ordenable
  sortable?: boolean;
  // Ancho de la columna
  width?: string | number;
  // Alineación del contenido
  align?: "left" | "center" | "right";
  // Si la columna está fija
  sticky?: "left" | "right";
  // Clase CSS personalizada para la columna
  className?: string;
  // Clase CSS para el header
  headerClassName?: string;
}

// Tipos para ordenamiento
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

// Tipos para paginación
export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

// Props del componente Table
export interface TableProps<T = any> {
  // Datos a mostrar
  data: T[];
  // Configuración de columnas
  columns: TableColumn<T>[];
  // Clave única para cada fila
  rowKey?: string | ((row: T) => string);
  // Estado de carga
  loading?: boolean;
  // Mensaje cuando no hay datos
  emptyMessage?: string;
  // Selección de filas
  selectable?: boolean;
  // Callback para cambio de selección
  onSelectionChange?: (selectedKeys: string[]) => void;
  // Paginación
  pagination?: PaginationConfig;
  // Callback para cambio de página
  onPageChange?: (page: number, pageSize: number) => void;
  // Ordenamiento
  sortConfig?: SortConfig;
  // Callback para cambio de ordenamiento
  onSortChange?: (sortConfig: SortConfig | null) => void;
  // Acciones por fila
  rowActions?: (row: T, index: number) => React.ReactNode;
  // Callback para click en fila
  onRowClick?: (row: T, index: number) => void;
  // Clase CSS del contenedor
  className?: string;
  // Altura fija con scroll
  height?: number | string;
  // Tabla responsiva
  responsive?: boolean;
  // Mostrar bordes
  bordered?: boolean;
  // Alternar colores de filas
  striped?: boolean;
  // Tamaño de la tabla
  size?: "sm" | "default" | "lg";
  // Hover effect en filas
  hoverable?: boolean;
}

// Hook para ordenamiento local
const useSorting = <T,>(
  data: T[],
  columns: TableColumn<T>[],
  initialSort?: SortConfig
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialSort || null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { key, direction } = sortConfig;
    const column = columns.find((col) => col.key === key);

    if (!column) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (column.accessor) {
        aValue = column.accessor(a);
        bValue = column.accessor(b);
      } else {
        aValue = (a as any)[key];
        bValue = (b as any)[key];
      }

      // Manejar valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === "asc" ? -1 : 1;
      if (bValue == null) return direction === "asc" ? 1 : -1;

      // Ordenamiento numérico
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Ordenamiento de strings
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return direction === "asc" ? -1 : 1;
      if (aStr > bStr) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null; // Remove sorting
    });
  };

  return { sortedData, sortConfig, handleSort };
};

// Hook para selección de filas
const useRowSelection = (
  rowKey: string | ((row: any) => string),
  onSelectionChange?: (keys: string[]) => void
) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const getRowKey = (row: any, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    return row[rowKey] || String(index);
  };

  const toggleRow = (row: any, index: number) => {
    const key = getRowKey(row, index);
    const newSelected = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];

    setSelectedKeys(newSelected);
    onSelectionChange?.(newSelected);
  };

  const toggleAll = (data: any[]) => {
    const allKeys = data.map((row, index) => getRowKey(row, index));
    const newSelected = selectedKeys.length === allKeys.length ? [] : allKeys;
    setSelectedKeys(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isSelected = (row: any, index: number): boolean => {
    const key = getRowKey(row, index);
    return selectedKeys.includes(key);
  };

  return { selectedKeys, toggleRow, toggleAll, isSelected, getRowKey };
};

// Componente Table principal
const Table = <T,>({
  data,
  columns,
  rowKey = "id",
  loading = false,
  emptyMessage = "No hay datos disponibles",
  selectable = false,
  onSelectionChange,
  pagination,
  onPageChange,
  sortConfig: externalSortConfig,
  onSortChange,
  rowActions,
  onRowClick,
  className,
  height,
  responsive = true,
  bordered = false,
  striped = false,
  size = "default",
  hoverable = true,
}: TableProps<T>) => {
  // Hooks para funcionalidades
  const {
    sortedData,
    sortConfig: internalSortConfig,
    handleSort,
  } = useSorting(data, columns, externalSortConfig);

  const { selectedKeys, toggleRow, toggleAll, isSelected } = useRowSelection(
    rowKey,
    onSelectionChange
  );

  // Usar sort config externo si está disponible
  const currentSortConfig = externalSortConfig || internalSortConfig;

  // Manejar ordenamiento
  const handleSortClick = (key: string) => {
    if (onSortChange) {
      // Modo controlado
      const column = columns.find((col) => col.key === key);
      if (!column?.sortable) return;

      let newSortConfig: SortConfig | null = null;

      if (!currentSortConfig || currentSortConfig.key !== key) {
        newSortConfig = { key, direction: "asc" };
      } else if (currentSortConfig.direction === "asc") {
        newSortConfig = { key, direction: "desc" };
      }

      onSortChange(newSortConfig);
    } else {
      // Modo no controlado
      handleSort(key);
    }
  };

  // Datos finales (ordenados y/o paginados)
  const finalData = externalSortConfig ? data : sortedData;

  // Paginación local si es necesaria
  const paginatedData = useMemo(() => {
    if (!pagination) return finalData;

    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return finalData.slice(startIndex, endIndex);
  }, [finalData, pagination]);

  // Clases de la tabla
  const tableClasses = cn(
    "min-w-full divide-y divide-gray-200",
    bordered && "border border-gray-200",
    className
  );

  // Clases del contenedor
  const containerClasses = cn(
    "overflow-hidden",
    responsive ? "overflow-x-auto" : undefined,
    height ? "overflow-y-auto" : undefined,
    bordered ? "border border-gray-200 rounded-lg" : undefined
  );

  // Clases del tamaño
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  // Componente de encabezado de columna
  const ColumnHeader = ({ column }: { column: TableColumn<T> }) => {
    const isSorted = currentSortConfig?.key === column.key;
    const sortDirection = isSorted ? currentSortConfig?.direction : null;

    return (
      <th
        className={cn(
          "px-6 py-3 bg-gray-50 text-left font-medium text-gray-500 uppercase tracking-wider",
          column.sortable && "cursor-pointer hover:bg-gray-100 select-none",
          column.align === "center" && "text-center",
          column.align === "right" && "text-right",
          sizeClasses[size],
          column.headerClassName
        )}
        onClick={
          column.sortable ? () => handleSortClick(column.key) : undefined
        }
        style={{ width: column.width }}
      >
        <div className="flex items-center justify-between">
          <span>{column.header}</span>
          {column.sortable && (
            <div className="ml-2 flex flex-col">
              <svg
                className={cn(
                  "w-3 h-3 -mb-1",
                  isSorted && sortDirection === "asc"
                    ? "text-gray-900"
                    : "text-gray-400"
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                className={cn(
                  "w-3 h-3",
                  isSorted && sortDirection === "desc"
                    ? "text-gray-900"
                    : "text-gray-400"
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </th>
    );
  };

  // Renderizar contenido de celda
  const renderCellContent = (column: TableColumn<T>, row: T, index: number) => {
    if (column.cell) {
      return column.cell(row, index);
    }

    const value = column.accessor
      ? column.accessor(row)
      : (row as any)[column.key];
    return value != null ? String(value) : "";
  };

  return (
    <div className="w-full">
      {/* Contenedor de tabla */}
      <div className={containerClasses} style={{ height }}>
        <table className={tableClasses}>
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {/* Columna de selección */}
              {selectable && (
                <th className="px-6 py-3 bg-gray-50 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={
                      selectedKeys.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={() => toggleAll(paginatedData)}
                  />
                </th>
              )}

              {/* Columnas normales */}
              {columns.map((column) => (
                <ColumnHeader key={column.key} column={column} />
              ))}

              {/* Columna de acciones */}
              {rowActions && (
                <th className="px-6 py-3 bg-gray-50 text-right font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody
            className={cn(
              "bg-white divide-y divide-gray-200",
              striped ? "divide-y-0" : undefined
            )}
          >
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className="px-6 py-8 text-center"
                >
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-600 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cargando...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={
                    typeof rowKey === "function"
                      ? rowKey(row)
                      : (row as any)[rowKey] || index
                  }
                  className={cn(
                    striped && index % 2 === 0 ? "bg-gray-50" : undefined,
                    hoverable ? "hover:bg-gray-50" : undefined,
                    onRowClick ? "cursor-pointer" : undefined,
                    isSelected(row, index) ? "bg-blue-50" : undefined
                  )}
                  onClick={
                    onRowClick ? () => onRowClick(row, index) : undefined
                  }
                >
                  {/* Columna de selección */}
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={isSelected(row, index)}
                        onChange={() => toggleRow(row, index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}

                  {/* Columnas normales */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 whitespace-nowrap",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                        sizeClasses[size],
                        column.className
                      )}
                      style={{ width: column.width }}
                    >
                      {renderCellContent(column, row, index)}
                    </td>
                  ))}

                  {/* Columna de acciones */}
                  {rowActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div onClick={(e) => e.stopPropagation()}>
                        {rowActions(row, index)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && (
        <TablePagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

// Componente de paginación
interface TablePaginationProps {
  pagination: PaginationConfig;
  onPageChange?: (page: number, pageSize: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const {
    currentPage,
    pageSize,
    totalItems,
    showSizeChanger = true,
    pageSizeOptions = [10, 20, 50, 100],
  } = pagination;

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    onPageChange?.(1, newSize);
  };

  // Generar números de página
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </span>

        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="ml-4 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Botón anterior */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {/* Números de página */}
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === "number" ? handlePageChange(page) : undefined
            }
            disabled={typeof page === "string"}
            className={cn(
              "px-3 py-1 text-sm border rounded",
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50",
              typeof page === "string" ? "cursor-default" : undefined
            )}
          >
            {page}
          </button>
        ))}

        {/* Botón siguiente */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export { Table };
