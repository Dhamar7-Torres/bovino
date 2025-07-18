import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Interfaz para los datos del gráfico
interface AreaChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  date?: string;
  [key: string]: any;
}

// Props del componente AreaChart
interface AreaChartProps {
  data: AreaChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  width?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  animationDelay?: number;
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
 * Componente AreaChart para visualización de datos ganaderos
 * Implementado con SVG nativo y animaciones Framer Motion
 */
const CustomAreaChart: React.FC<AreaChartProps> = ({
  data,
  title = "Gráfico de Área",
  subtitle,
  height = 300,
  width = "100%",
  primaryColor = "#10b981", // emerald-500
  secondaryColor = "#f59e0b", // amber-500
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  className = "",
  animationDelay = 0,
  dataKey = "value",
  secondaryDataKey = "secondaryValue",
  xAxisKey = "name",
  yAxisLabel,
  formatTooltip,
  formatXAxisLabel,
  formatYAxisLabel,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    data: AreaChartDataPoint;
    index: number;
  } | null>(null);

  // Configuración del SVG
  const svgWidth = 600;
  const svgHeight = height;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Calcular escalas y valores
  const { xScale, yScale, pathData, secondaryPathData, gridLines } =
    useMemo(() => {
      if (!data.length) {
        return {
          xScale: [],
          yScale: (val: number) => val,
          maxValue: 0,
          pathData: "",
          secondaryPathData: "",
          gridLines: [],
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

      // Escala X (distribución uniforme)
      const xScalePoints = data.map(
        (_, index) => padding.left + (index * chartWidth) / (data.length - 1)
      );

      // Función de escala Y
      const yScaleFunc = (value: number) =>
        padding.top + chartHeight - (value / adjustedMax) * chartHeight;

      // Generar líneas de grid
      const gridLineCount = 5;
      const gridLinesData = Array.from({ length: gridLineCount }, (_, i) => {
        const value = (adjustedMax / (gridLineCount - 1)) * i;
        const y = yScaleFunc(value);
        return { value, y };
      });

      // Generar path para área principal
      const pathPoints = data.map((d, i) => {
        const x = xScalePoints[i];
        const y = yScaleFunc(d[dataKey] || 0);
        return `${x},${y}`;
      });

      const pathString =
        pathPoints.length > 0
          ? `M ${pathPoints[0]} L ${pathPoints.slice(1).join(" L ")} L ${
              xScalePoints[xScalePoints.length - 1]
            },${padding.top + chartHeight} L ${padding.left},${
              padding.top + chartHeight
            } Z`
          : "";

      // Generar path para área secundaria
      let secondaryPathString = "";
      if (
        secondaryDataKey &&
        data.some((d) => d[secondaryDataKey] !== undefined)
      ) {
        const secondaryPoints = data.map((d, i) => {
          const x = xScalePoints[i];
          const y = yScaleFunc(d[secondaryDataKey] || 0);
          return `${x},${y}`;
        });

        secondaryPathString =
          secondaryPoints.length > 0
            ? `M ${secondaryPoints[0]} L ${secondaryPoints
                .slice(1)
                .join(" L ")} L ${xScalePoints[xScalePoints.length - 1]},${
                padding.top + chartHeight
              } L ${padding.left},${padding.top + chartHeight} Z`
            : "";
      }

      return {
        xScale: xScalePoints,
        yScale: yScaleFunc,
        maxValue: adjustedMax,
        pathData: pathString,
        secondaryPathData: secondaryPathString,
        gridLines: gridLinesData,
      };
    }, [data, dataKey, secondaryDataKey, chartWidth, chartHeight, padding]);

  // Formatear etiquetas
  const formatXLabel = (value: any) => {
    if (formatXAxisLabel) return formatXAxisLabel(value);
    if (
      typeof value === "string" &&
      (value.includes("-") || value.includes("/"))
    ) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
        });
      } catch {
        return value;
      }
    }
    return value;
  };

  const formatYLabel = (value: number) => {
    if (formatYAxisLabel) return formatYAxisLabel(value);
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return Math.round(value).toString();
  };

  // Manejar hover sobre puntos
  const handlePointHover = (
    event: React.MouseEvent,
    dataPoint: AreaChartDataPoint,
    index: number
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredPoint({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: dataPoint,
      index,
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
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          {/* Definir gradientes */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient
              id="areaGradientSecondary"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
              <stop
                offset="95%"
                stopColor={secondaryColor}
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>

          {/* Grid líneas horizontales */}
          {showGrid &&
            gridLines.map((line, index) => (
              <motion.line
                key={index}
                x1={padding.left}
                y1={line.y}
                x2={padding.left + chartWidth}
                y2={line.y}
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
            ))}

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

          {/* Etiquetas del eje Y */}
          {gridLines.map((line, index) => (
            <text
              key={index}
              x={padding.left - 10}
              y={line.y + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {formatYLabel(line.value)}
            </text>
          ))}

          {/* Área secundaria */}
          {secondaryPathData && (
            <motion.path
              d={secondaryPathData}
              fill="url(#areaGradientSecondary)"
              stroke={secondaryColor}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: animationDelay + 0.6 }}
            />
          )}

          {/* Área principal */}
          <motion.path
            d={pathData}
            fill="url(#areaGradient)"
            stroke={primaryColor}
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: animationDelay + 0.8 }}
          />

          {/* Puntos de datos principales */}
          {data.map((dataPoint, index) => (
            <motion.circle
              key={index}
              cx={xScale[index]}
              cy={yScale(dataPoint[dataKey] || 0)}
              r="4"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: animationDelay + 1 + index * 0.1,
              }}
              whileHover={{ scale: 1.5 }}
              onMouseEnter={(e) =>
                showTooltip && handlePointHover(e, dataPoint, index)
              }
            />
          ))}

          {/* Puntos de datos secundarios */}
          {secondaryDataKey &&
            data.map((dataPoint, index) => {
              if (dataPoint[secondaryDataKey] === undefined) return null;
              return (
                <motion.circle
                  key={`secondary-${index}`}
                  cx={xScale[index]}
                  cy={yScale(dataPoint[secondaryDataKey] || 0)}
                  r="4"
                  fill={secondaryColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: animationDelay + 1.2 + index * 0.1,
                  }}
                  whileHover={{ scale: 1.5 }}
                  onMouseEnter={(e) =>
                    showTooltip && handlePointHover(e, dataPoint, index)
                  }
                />
              );
            })}

          {/* Etiquetas del eje X */}
          {data.map((dataPoint, index) => (
            <text
              key={index}
              x={xScale[index]}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {formatXLabel(dataPoint[xAxisKey])}
            </text>
          ))}

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
        {showTooltip && hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-white p-3 border border-gray-200 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <p className="font-medium text-gray-900 mb-2">
              {hoveredPoint.data[xAxisKey]}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-gray-600">Principal:</span>
              <span className="font-semibold text-gray-900">
                {formatTooltip
                  ? formatTooltip(hoveredPoint.data[dataKey], "Principal")[0]
                  : hoveredPoint.data[dataKey]}
              </span>
            </div>
            {secondaryDataKey &&
              hoveredPoint.data[secondaryDataKey] !== undefined && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="text-gray-600">Secundario:</span>
                  <span className="font-semibold text-gray-900">
                    {formatTooltip
                      ? formatTooltip(
                          hoveredPoint.data[secondaryDataKey],
                          "Secundario"
                        )[0]
                      : hoveredPoint.data[secondaryDataKey]}
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
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm text-gray-600">Principal</span>
          </div>
          {secondaryDataKey &&
            data.some((d) => d[secondaryDataKey] !== undefined) && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
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

export default CustomAreaChart;

// Componentes predefinidos para casos comunes en gestión ganadera

// Gráfico de salud del ganado por mes
export const HealthTrendChart: React.FC<{
  data: AreaChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomAreaChart
    data={data}
    title="Tendencia de Salud del Ganado"
    subtitle="Animales saludables vs enfermos por mes"
    primaryColor="#10b981" // verde para saludables
    secondaryColor="#ef4444" // rojo para enfermos
    dataKey="healthy"
    secondaryDataKey="sick"
    yAxisLabel="Número de Animales"
    formatTooltip={(value, name) => [
      `${value} animales`,
      name === "healthy" ? "Saludables" : "Enfermos",
    ]}
    className={className}
  />
);

// Gráfico de vacunaciones por período
export const VaccinationChart: React.FC<{
  data: AreaChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomAreaChart
    data={data}
    title="Programa de Vacunación"
    subtitle="Vacunas aplicadas por período"
    primaryColor="#3b82f6" // azul
    dataKey="vaccinations"
    yAxisLabel="Vacunas Aplicadas"
    formatTooltip={(value) => [`${value} vacunas`, "Aplicadas"]}
    className={className}
  />
);

// Gráfico de peso promedio del ganado
export const WeightTrendChart: React.FC<{
  data: AreaChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomAreaChart
    data={data}
    title="Evolución del Peso Promedio"
    subtitle="Peso promedio del ganado por mes"
    primaryColor="#8b5cf6" // púrpura
    dataKey="averageWeight"
    yAxisLabel="Peso (kg)"
    formatTooltip={(value) => [`${value} kg`, "Peso Promedio"]}
    formatYAxisLabel={(value) => `${value}kg`}
    className={className}
  />
);

// Gráfico de nacimientos vs muertes
export const BirthDeathChart: React.FC<{
  data: AreaChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomAreaChart
    data={data}
    title="Demografía del Ganado"
    subtitle="Nacimientos vs muertes por período"
    primaryColor="#22c55e" // verde para nacimientos
    secondaryColor="#ef4444" // rojo para muertes
    dataKey="births"
    secondaryDataKey="deaths"
    yAxisLabel="Número de Animales"
    formatTooltip={(value, name) => [
      `${value} animales`,
      name === "births" ? "Nacimientos" : "Muertes",
    ]}
    className={className}
  />
);
