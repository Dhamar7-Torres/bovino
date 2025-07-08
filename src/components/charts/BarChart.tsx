import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Interfaz para los datos del gráfico de barras
interface BarChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  category?: string;
  [key: string]: any;
}

// Props del componente BarChart
interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  width?: string;
  primaryColor?: string;
  secondaryColor?: string;
  orientation?: "horizontal" | "vertical";
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showValues?: boolean;
  className?: string;
  animationDelay?: number;
  spacing?: number; // Espacio entre barras
  // Props específicas para datos ganaderos
  dataKey?: string;
  secondaryDataKey?: string;
  xAxisKey?: string;
  yAxisLabel?: string;
  formatTooltip?: (value: any, name: string) => [string, string];
  formatXAxisLabel?: (value: any) => string;
  formatYAxisLabel?: (value: any) => string;
}

/**
 * Componente BarChart para visualización de datos ganaderos
 * Implementado con SVG nativo y animaciones Framer Motion
 */
const CustomBarChart: React.FC<BarChartProps> = ({
  data,
  title = "Gráfico de Barras",
  subtitle,
  height = 300,
  width = "100%",
  primaryColor = "#10b981", // emerald-500
  secondaryColor = "#f59e0b", // amber-500
  orientation = "vertical",
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showValues = false,
  className = "",
  animationDelay = 0,
  spacing = 0.2, // 20% del ancho de barra como espacio
  dataKey = "value",
  secondaryDataKey = "secondaryValue",
  xAxisKey = "name",
  yAxisLabel,
  formatTooltip,
  formatXAxisLabel,
  formatYAxisLabel,
}) => {
  const [hoveredBar, setHoveredBar] = useState<{
    x: number;
    y: number;
    data: BarChartDataPoint;
    index: number;
  } | null>(null);

  // Configuración del SVG
  const svgWidth = 600;
  const svgHeight = height;
  const padding = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Calcular escalas y valores para barras
  const { bars, gridLines, xPositions } = useMemo(() => {
    if (!data.length) {
      return {
        bars: [],
        gridLines: [],
        xPositions: [],
        yScaleFunc: (val: number) => val,
      };
    }

    // Encontrar valor máximo
    const values = data.map((d) => d[dataKey] || 0);
    const secondaryValues = data.map((d) => d[secondaryDataKey] || 0);
    const allValues = [...values, ...secondaryValues].filter(
      (v) => v !== undefined
    );
    const maxVal = Math.max(...allValues);
    const adjustedMax = maxVal * 1.1; // 10% de espacio extra

    // Configuración de barras
    const barCount = data.length;
    const hasSecondary =
      secondaryDataKey && data.some((d) => d[secondaryDataKey] !== undefined);
    const barsPerGroup = hasSecondary ? 2 : 1;

    const groupWidth = chartWidth / barCount;
    const barWidth = (groupWidth * (1 - spacing)) / barsPerGroup;
    const groupSpacing = groupWidth * spacing;

    // Función de escala Y (para valores)
    const yScale =
      orientation === "vertical"
        ? (value: number) =>
            padding.top + chartHeight - (value / adjustedMax) * chartHeight
        : (value: number) => padding.left + (value / adjustedMax) * chartWidth;

    // Calcular posiciones X
    const xPositions = data.map((_, index) =>
      orientation === "vertical"
        ? padding.left + index * groupWidth + groupSpacing / 2
        : padding.top + index * groupWidth + groupSpacing / 2
    );

    // Generar barras
    const barsData = data.flatMap((dataPoint, index) => {
      const baseX = xPositions[index];
      const bars: any[] = [];

      // Barra principal
      if (orientation === "vertical") {
        bars.push({
          x: baseX,
          y: yScale(dataPoint[dataKey] || 0),
          width: barWidth,
          height: Math.max(
            0,
            ((dataPoint[dataKey] || 0) / adjustedMax) * chartHeight
          ),
          value: dataPoint[dataKey] || 0,
          color: dataPoint.color || primaryColor,
          dataPoint,
          index,
          type: "primary",
        });

        // Barra secundaria
        if (hasSecondary && dataPoint[secondaryDataKey] !== undefined) {
          bars.push({
            x: baseX + barWidth,
            y: yScale(dataPoint[secondaryDataKey] || 0),
            width: barWidth,
            height: Math.max(
              0,
              ((dataPoint[secondaryDataKey] || 0) / adjustedMax) * chartHeight
            ),
            value: dataPoint[secondaryDataKey] || 0,
            color: secondaryColor,
            dataPoint,
            index,
            type: "secondary",
          });
        }
      } else {
        // Horizontal
        bars.push({
          x: padding.left,
          y: baseX,
          width: Math.max(
            0,
            ((dataPoint[dataKey] || 0) / adjustedMax) * chartWidth
          ),
          height: barWidth,
          value: dataPoint[dataKey] || 0,
          color: dataPoint.color || primaryColor,
          dataPoint,
          index,
          type: "primary",
        });

        if (hasSecondary && dataPoint[secondaryDataKey] !== undefined) {
          bars.push({
            x: padding.left,
            y: baseX + barWidth,
            width: Math.max(
              0,
              ((dataPoint[secondaryDataKey] || 0) / adjustedMax) * chartWidth
            ),
            height: barWidth,
            value: dataPoint[secondaryDataKey] || 0,
            color: secondaryColor,
            dataPoint,
            index,
            type: "secondary",
          });
        }
      }

      return bars;
    });

    // Generar líneas de grid
    const gridLineCount = 5;
    const gridLinesData = Array.from({ length: gridLineCount }, (_, i) => {
      const value = (adjustedMax / (gridLineCount - 1)) * i;
      return {
        value,
        position: orientation === "vertical" ? yScale(value) : yScale(value),
      };
    });

    return {
      bars: barsData,
      gridLines: gridLinesData,
      xPositions,
      yScaleFunc: yScale,
    };
  }, [
    data,
    dataKey,
    secondaryDataKey,
    chartWidth,
    chartHeight,
    padding,
    orientation,
    spacing,
    primaryColor,
    secondaryColor,
  ]);

  // Formatear etiquetas
  const formatXLabel = (value: any) => {
    if (formatXAxisLabel) return formatXAxisLabel(value);
    return value;
  };

  const formatYLabel = (value: number) => {
    if (formatYAxisLabel) return formatYAxisLabel(value);
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return Math.round(value).toString();
  };

  // Manejar hover sobre barras
  const handleBarHover = (event: React.MouseEvent, bar: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredBar({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: bar.dataPoint,
      index: bar.index,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: animationDelay,
        ease: "easeOut",
      }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      {/* Header del gráfico */}
      <div className="mb-6">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.2 }}
          className="text-lg font-semibold text-gray-900"
        >
          {title}
        </motion.h3>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationDelay + 0.3 }}
            className="text-sm text-gray-600 mt-1"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Contenedor del gráfico */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: animationDelay + 0.4,
          ease: "easeOut",
        }}
        className="relative"
        style={{ width, height }}
        onMouseLeave={() => setHoveredBar(null)}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          {/* Grid líneas */}
          {showGrid &&
            gridLines.map((line, index) => {
              if (orientation === "vertical") {
                return (
                  <motion.line
                    key={index}
                    x1={padding.left}
                    y1={line.position}
                    x2={padding.left + chartWidth}
                    y2={line.position}
                    stroke="#f3f4f6"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: animationDelay + 0.5 + index * 0.1,
                    }}
                  />
                );
              } else {
                return (
                  <motion.line
                    key={index}
                    x1={line.position}
                    y1={padding.top}
                    x2={line.position}
                    y2={padding.top + chartHeight}
                    stroke="#f3f4f6"
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: animationDelay + 0.5 + index * 0.1,
                    }}
                  />
                );
              }
            })}

          {/* Ejes */}
          {orientation === "vertical" ? (
            <>
              {/* Eje Y */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + chartHeight}
                stroke="#d1d5db"
              />
              {/* Eje X */}
              <line
                x1={padding.left}
                y1={padding.top + chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight}
                stroke="#d1d5db"
              />
            </>
          ) : (
            <>
              {/* Eje X */}
              <line
                x1={padding.left}
                y1={padding.top + chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight}
                stroke="#d1d5db"
              />
              {/* Eje Y */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + chartHeight}
                stroke="#d1d5db"
              />
            </>
          )}

          {/* Etiquetas de los ejes */}
          {orientation === "vertical" ? (
            <>
              {/* Etiquetas Y */}
              {gridLines.map((line, index) => (
                <text
                  key={index}
                  x={padding.left - 10}
                  y={line.position + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {formatYLabel(line.value)}
                </text>
              ))}
              {/* Etiquetas X */}
              {data.map((dataPoint, index) => (
                <text
                  key={index}
                  x={
                    xPositions[index] +
                    ((chartWidth / data.length) * (1 - spacing)) / 4
                  }
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {formatXLabel(dataPoint[xAxisKey])}
                </text>
              ))}
            </>
          ) : (
            <>
              {/* Etiquetas X */}
              {gridLines.map((line, index) => (
                <text
                  key={index}
                  x={line.position}
                  y={padding.top + chartHeight + 15}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {formatYLabel(line.value)}
                </text>
              ))}
              {/* Etiquetas Y */}
              {data.map((dataPoint, index) => (
                <text
                  key={index}
                  x={padding.left - 10}
                  y={
                    xPositions[index] +
                    ((chartHeight / data.length) * (1 - spacing)) / 4 +
                    4
                  }
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {formatXLabel(dataPoint[xAxisKey])}
                </text>
              ))}
            </>
          )}

          {/* Barras */}
          {bars.map((bar, index) => (
            <motion.rect
              key={index}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              className="cursor-pointer"
              initial={{
                [orientation === "vertical" ? "height" : "width"]: 0,
                [orientation === "vertical" ? "y" : "x"]:
                  orientation === "vertical"
                    ? padding.top + chartHeight
                    : padding.left,
              }}
              animate={{
                [orientation === "vertical" ? "height" : "width"]:
                  bar[orientation === "vertical" ? "height" : "width"],
                [orientation === "vertical" ? "y" : "x"]:
                  bar[orientation === "vertical" ? "y" : "x"],
              }}
              transition={{
                duration: 0.8,
                delay: animationDelay + 0.8 + index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                opacity: 0.8,
                filter: "brightness(1.1)",
              }}
              onMouseEnter={(e) => showTooltip && handleBarHover(e, bar)}
              rx="4" // Bordes redondeados
            />
          ))}

          {/* Valores en las barras */}
          {showValues &&
            bars.map((bar, index) => {
              const textX =
                orientation === "vertical"
                  ? bar.x + bar.width / 2
                  : bar.x + bar.width + 5;
              const textY =
                orientation === "vertical"
                  ? bar.y - 5
                  : bar.y + bar.height / 2 + 4;

              return (
                <motion.text
                  key={index}
                  x={textX}
                  y={textY}
                  textAnchor={orientation === "vertical" ? "middle" : "start"}
                  className="text-xs fill-gray-700 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animationDelay + 1.2 + index * 0.1 }}
                >
                  {formatYLabel(bar.value)}
                </motion.text>
              );
            })}

          {/* Etiqueta del eje Y */}
          {yAxisLabel && (
            <text
              x={20}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${padding.top + chartHeight / 2})`}
              className="text-xs fill-gray-600"
            >
              {yAxisLabel}
            </text>
          )}
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredBar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-white p-3 border border-gray-200 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: hoveredBar.x + 10,
              top: hoveredBar.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <p className="font-medium text-gray-900 mb-2">
              {hoveredBar.data[xAxisKey]}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-gray-600">Valor:</span>
              <span className="font-semibold text-gray-900">
                {formatTooltip
                  ? formatTooltip(hoveredBar.data[dataKey], "Principal")[0]
                  : hoveredBar.data[dataKey]}
              </span>
            </div>
            {secondaryDataKey &&
              hoveredBar.data[secondaryDataKey] !== undefined && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="text-gray-600">Secundario:</span>
                  <span className="font-semibold text-gray-900">
                    {formatTooltip
                      ? formatTooltip(
                          hoveredBar.data[secondaryDataKey],
                          "Secundario"
                        )[0]
                      : hoveredBar.data[secondaryDataKey]}
                  </span>
                </div>
              )}
          </motion.div>
        )}
      </motion.div>

      {/* Leyenda */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 1.5 }}
          className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm text-gray-600">Principal</span>
          </div>
          {secondaryDataKey &&
            data.some((d) => d[secondaryDataKey] !== undefined) && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: secondaryColor }}
                />
                <span className="text-sm text-gray-600">Secundario</span>
              </div>
            )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomBarChart;

// Componentes predefinidos para casos comunes en gestión ganadera

// Gráfico de tipos de ganado
export const CattleTypeChart: React.FC<{
  data: BarChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomBarChart
    data={data}
    title="Distribución por Tipo de Ganado"
    subtitle="Cantidad de animales por categoría"
    primaryColor="#10b981"
    dataKey="count"
    yAxisLabel="Número de Animales"
    formatTooltip={(value) => [`${value} animales`, "Total"]}
    showValues={true}
    className={className}
  />
);

// Gráfico de razas de ganado
export const BreedDistributionChart: React.FC<{
  data: BarChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomBarChart
    data={data}
    title="Distribución por Raza"
    subtitle="Cantidad de animales por raza"
    primaryColor="#3b82f6"
    dataKey="count"
    orientation="horizontal"
    yAxisLabel="Número de Animales"
    formatTooltip={(value) => [`${value} animales`, "Total"]}
    className={className}
  />
);

// Gráfico de estado de salud
export const HealthStatusChart: React.FC<{
  data: BarChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomBarChart
    data={data.map((item) => ({
      ...item,
      color:
        item.name === "Saludable"
          ? "#10b981"
          : item.name === "Enfermo"
          ? "#ef4444"
          : item.name === "Cuarentena"
          ? "#f59e0b"
          : "#6b7280",
    }))}
    title="Estado de Salud del Ganado"
    subtitle="Distribución por condición sanitaria"
    dataKey="count"
    yAxisLabel="Número de Animales"
    formatTooltip={(value) => [`${value} animales`, "Total"]}
    showValues={true}
    className={className}
  />
);

// Gráfico de vacunaciones por mes
export const MonthlyVaccinationChart: React.FC<{
  data: BarChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomBarChart
    data={data}
    title="Vacunaciones Mensuales"
    subtitle="Número de vacunas aplicadas por mes"
    primaryColor="#8b5cf6"
    dataKey="vaccinations"
    yAxisLabel="Vacunas Aplicadas"
    formatTooltip={(value) => [`${value} vacunas`, "Aplicadas"]}
    className={className}
  />
);

// Gráfico de peso por edad
export const WeightByAgeChart: React.FC<{
  data: BarChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomBarChart
    data={data}
    title="Peso Promedio por Edad"
    subtitle="Peso promedio del ganado por rango de edad"
    primaryColor="#f59e0b"
    dataKey="averageWeight"
    yAxisLabel="Peso (kg)"
    formatTooltip={(value) => [`${value} kg`, "Peso Promedio"]}
    formatYAxisLabel={(value) => `${value}kg`}
    showValues={true}
    className={className}
  />
);
