import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Interfaz para los datos del gráfico de líneas
interface LineChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  date?: string;
  timestamp?: number;
  [key: string]: any;
}

// Props del componente LineChart
interface LineChartProps {
  data: LineChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  width?: string;
  primaryColor?: string;
  secondaryColor?: string;
  strokeWidth?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showPoints?: boolean;
  showArea?: boolean;
  className?: string;
  animationDelay?: number;
  smooth?: boolean; // Curvas suaves vs líneas rectas
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
 * Componente LineChart para visualización de tendencias ganaderas
 * Implementado con SVG nativo y animaciones Framer Motion
 */
const CustomLineChart: React.FC<LineChartProps> = ({
  data,
  title = "Gráfico de Líneas",
  subtitle,
  height = 300,
  width = "100%",
  primaryColor = "#10b981", // emerald-500
  secondaryColor = "#f59e0b", // amber-500
  strokeWidth = 2,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showPoints = true,
  showArea = false,
  className = "",
  animationDelay = 0,
  smooth = true,
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
    data: LineChartDataPoint;
    index: number;
    type: "primary" | "secondary";
  } | null>(null);

  // Configuración del SVG
  const svgWidth = 600;
  const svgHeight = height;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Calcular escalas, paths y puntos
  const {
    primaryPath,
    secondaryPath,
    primaryAreaPath,
    secondaryAreaPath,
    primaryPoints,
    secondaryPoints,
    gridLines,
    xPositions,
  } = useMemo(() => {
    if (!data.length) {
      return {
        primaryPath: "",
        secondaryPath: "",
        primaryAreaPath: "",
        secondaryAreaPath: "",
        primaryPoints: [],
        secondaryPoints: [],
        gridLines: [],
        xPositions: [],
        yScaleFunc: (val: number) => val,
      };
    }

    // Encontrar valor máximo y mínimo
    const values = data.map((d) => d[dataKey] || 0);
    const secondaryValues = data.map((d) => d[secondaryDataKey] || 0);
    const allValues = [...values, ...secondaryValues].filter(
      (v) => v !== undefined
    );
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const valueRange = maxVal - minVal;
    const adjustedMin = minVal - valueRange * 0.1;
    const adjustedMax = maxVal + valueRange * 0.1;

    // Función de escala Y
    const yScale = (value: number) => {
      if (adjustedMax === adjustedMin) return padding.top + chartHeight / 2;
      return (
        padding.top +
        chartHeight -
        ((value - adjustedMin) / (adjustedMax - adjustedMin)) * chartHeight
      );
    };

    // Posiciones X (distribución uniforme)
    const xPositions = data.map(
      (_, index) => padding.left + (index * chartWidth) / (data.length - 1)
    );

    // Generar puntos para línea principal
    const primaryPointsData = data.map((dataPoint, index) => ({
      x: xPositions[index],
      y: yScale(dataPoint[dataKey] || 0),
      value: dataPoint[dataKey] || 0,
      dataPoint,
      index,
    }));

    // Generar puntos para línea secundaria
    const secondaryPointsData =
      secondaryDataKey && data.some((d) => d[secondaryDataKey] !== undefined)
        ? data.map((dataPoint, index) => ({
            x: xPositions[index],
            y: yScale(dataPoint[secondaryDataKey] || 0),
            value: dataPoint[secondaryDataKey] || 0,
            dataPoint,
            index,
          }))
        : [];

    // Generar path SVG para línea principal
    const createPath = (points: typeof primaryPointsData, smooth: boolean) => {
      if (points.length === 0) return "";

      if (!smooth || points.length < 2) {
        // Línea recta
        const pathCommands = points.map((point, index) =>
          index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
        );
        return pathCommands.join(" ");
      } else {
        // Curva suave usando curvas Bézier
        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
          const prevPoint = points[i - 1];
          const currentPoint = points[i];
          const nextPoint = points[i + 1];

          if (i === 1) {
            // Primera curva
            const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
            path += ` Q ${controlX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
          } else if (i === points.length - 1) {
            // Última curva
            const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.5;
            path += ` Q ${controlX} ${currentPoint.y} ${currentPoint.x} ${currentPoint.y}`;
          } else {
            // Curvas intermedias
            const controlX1 =
              prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3;
            const controlX2 =
              currentPoint.x - (nextPoint.x - currentPoint.x) * 0.3;
            path += ` C ${controlX1} ${prevPoint.y} ${controlX2} ${currentPoint.y} ${currentPoint.x} ${currentPoint.y}`;
          }
        }

        return path;
      }
    };

    const primaryPathString = createPath(primaryPointsData, smooth);
    const secondaryPathString =
      secondaryPointsData.length > 0
        ? createPath(secondaryPointsData, smooth)
        : "";

    // Crear path para área (si está habilitada)
    const createAreaPath = (
      pathString: string,
      points: typeof primaryPointsData
    ) => {
      if (!pathString || points.length === 0) return "";
      const baseY = padding.top + chartHeight;
      return `${pathString} L ${points[points.length - 1].x} ${baseY} L ${
        points[0].x
      } ${baseY} Z`;
    };

    const primaryAreaPathString = showArea
      ? createAreaPath(primaryPathString, primaryPointsData)
      : "";
    const secondaryAreaPathString =
      showArea && secondaryPathString
        ? createAreaPath(secondaryPathString, secondaryPointsData)
        : "";

    // Generar líneas de grid
    const gridLineCount = 5;
    const gridLinesData = Array.from({ length: gridLineCount }, (_, i) => {
      const value =
        adjustedMin + (adjustedMax - adjustedMin) * (i / (gridLineCount - 1));
      return {
        value,
        y: yScale(value),
      };
    });

    return {
      primaryPath: primaryPathString,
      secondaryPath: secondaryPathString,
      primaryAreaPath: primaryAreaPathString,
      secondaryAreaPath: secondaryAreaPathString,
      primaryPoints: primaryPointsData,
      secondaryPoints: secondaryPointsData,
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
    smooth,
    showArea,
  ]);

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
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(1);
  };

  // Manejar hover sobre puntos
  const handlePointHover = (
    event: React.MouseEvent,
    point: any,
    type: "primary" | "secondary"
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredPoint({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: point.dataPoint,
      index: point.index,
      type,
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
          {/* Definir gradientes para áreas */}
          <defs>
            <linearGradient
              id="primaryAreaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient
              id="secondaryAreaGradient"
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

          {/* Ejes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#d1d5db"
          />
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

          {/* Áreas (si están habilitadas) */}
          {showArea && secondaryAreaPath && (
            <motion.path
              d={secondaryAreaPath}
              fill="url(#secondaryAreaGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: animationDelay + 0.6 }}
            />
          )}

          {showArea && primaryAreaPath && (
            <motion.path
              d={primaryAreaPath}
              fill="url(#primaryAreaGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: animationDelay + 0.8 }}
            />
          )}

          {/* Línea secundaria */}
          {secondaryPath && (
            <motion.path
              d={secondaryPath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: animationDelay + 0.8 }}
            />
          )}

          {/* Línea principal */}
          <motion.path
            d={primaryPath}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: animationDelay + 1.0 }}
          />

          {/* Puntos de la línea secundaria */}
          {showPoints &&
            secondaryPoints.map((point, index) => (
              <motion.circle
                key={`secondary-${index}`}
                cx={point.x}
                cy={point.y}
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
                  showTooltip && handlePointHover(e, point, "secondary")
                }
              />
            ))}

          {/* Puntos de la línea principal */}
          {showPoints &&
            primaryPoints.map((point, index) => (
              <motion.circle
                key={`primary-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={primaryColor}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: animationDelay + 1.4 + index * 0.1,
                }}
                whileHover={{ scale: 1.5 }}
                onMouseEnter={(e) =>
                  showTooltip && handlePointHover(e, point, "primary")
                }
              />
            ))}

          {/* Etiquetas del eje X */}
          {data.map((dataPoint, index) => (
            <text
              key={index}
              x={xPositions[index]}
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
                style={{
                  backgroundColor:
                    hoveredPoint.type === "primary"
                      ? primaryColor
                      : secondaryColor,
                }}
              />
              <span className="text-gray-600">
                {hoveredPoint.type === "primary" ? "Principal:" : "Secundario:"}
              </span>
              <span className="font-semibold text-gray-900">
                {formatTooltip
                  ? formatTooltip(
                      hoveredPoint.data[
                        hoveredPoint.type === "primary"
                          ? dataKey
                          : secondaryDataKey
                      ],
                      hoveredPoint.type === "primary"
                        ? "Principal"
                        : "Secundario"
                    )[0]
                  : hoveredPoint.data[
                      hoveredPoint.type === "primary"
                        ? dataKey
                        : secondaryDataKey
                    ]}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Leyenda */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 1.8 }}
          className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div
                className="w-4 h-0.5"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="w-2 h-2 rounded-full -ml-1"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <span className="text-sm text-gray-600">Principal</span>
          </div>
          {secondaryDataKey &&
            data.some((d) => d[secondaryDataKey] !== undefined) && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div
                    className="w-4 h-0.5"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <div
                    className="w-2 h-2 rounded-full -ml-1"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
                <span className="text-sm text-gray-600">Secundario</span>
              </div>
            )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomLineChart;

// Componentes predefinidos para casos comunes en gestión ganadera

// Gráfico de peso a lo largo del tiempo
export const WeightProgressChart: React.FC<{
  data: LineChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomLineChart
    data={data}
    title="Evolución del Peso"
    subtitle="Peso promedio del ganado a lo largo del tiempo"
    primaryColor="#8b5cf6" // púrpura
    dataKey="averageWeight"
    yAxisLabel="Peso (kg)"
    formatTooltip={(value) => [`${value} kg`, "Peso Promedio"]}
    formatYAxisLabel={(value) => `${value}kg`}
    smooth={true}
    showArea={true}
    className={className}
  />
);

// Gráfico de producción de leche
export const MilkProductionChart: React.FC<{
  data: LineChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomLineChart
    data={data}
    title="Producción de Leche"
    subtitle="Litros de leche producidos diariamente"
    primaryColor="#3b82f6" // azul
    dataKey="milkProduction"
    yAxisLabel="Litros por día"
    formatTooltip={(value) => [`${value} L`, "Producción"]}
    formatYAxisLabel={(value) => `${value}L`}
    smooth={true}
    className={className}
  />
);

// Gráfico de temperatura corporal
export const TemperatureChart: React.FC<{
  data: LineChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomLineChart
    data={data}
    title="Temperatura Corporal"
    subtitle="Temperatura promedio del ganado"
    primaryColor="#ef4444" // rojo
    dataKey="temperature"
    yAxisLabel="Temperatura (°C)"
    formatTooltip={(value) => [`${value}°C`, "Temperatura"]}
    formatYAxisLabel={(value) => `${value}°C`}
    smooth={true}
    showPoints={true}
    className={className}
  />
);

// Gráfico de población del ganado
export const PopulationTrendChart: React.FC<{
  data: LineChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomLineChart
    data={data}
    title="Evolución de la Población"
    subtitle="Número total de animales a lo largo del tiempo"
    primaryColor="#10b981" // verde
    secondaryColor="#f59e0b" // amarillo para comparación
    dataKey="totalAnimals"
    secondaryDataKey="newBirths"
    yAxisLabel="Número de Animales"
    formatTooltip={(value, name) => [
      `${value} animales`,
      name === "totalAnimals" ? "Total" : "Nacimientos",
    ]}
    smooth={true}
    showArea={true}
    className={className}
  />
);

// Gráfico de mortalidad
export const MortalityTrendChart: React.FC<{
  data: LineChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomLineChart
    data={data}
    title="Tendencia de Mortalidad"
    subtitle="Índice de mortalidad mensual"
    primaryColor="#ef4444" // rojo
    dataKey="mortalityRate"
    yAxisLabel="Tasa de Mortalidad (%)"
    formatTooltip={(value) => [`${value}%`, "Mortalidad"]}
    formatYAxisLabel={(value) => `${value}%`}
    smooth={true}
    className={className}
  />
);
