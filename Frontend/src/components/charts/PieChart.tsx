import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Interfaz para los datos del gráfico circular
interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
  category?: string;
  [key: string]: any;
}

// Props del componente PieChart
interface PieChartProps {
  data: PieChartDataPoint[];
  title?: string;
  subtitle?: string;
  size?: number;
  innerRadius?: number; // Para donut charts
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showPercentages?: boolean;
  className?: string;
  animationDelay?: number;
  legendPosition?: "right" | "bottom";
  // Props específicas para datos ganaderos
  dataKey?: string;
  formatTooltip?: (
    value: any,
    name: string,
    percentage: number
  ) => [string, string];
  formatLabel?: (value: any, percentage: number) => string;
}

/**
 * Componente PieChart para visualización de distribuciones ganaderas
 * Implementado con SVG nativo y animaciones Framer Motion
 */
const CustomPieChart: React.FC<PieChartProps> = ({
  data,
  title = "Gráfico Circular",
  subtitle,
  size = 300,
  innerRadius = 0, // 0 = pie chart, > 0 = donut chart
  colors = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
    "#6b7280", // gray-500
  ],
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  showPercentages = true,
  className = "",
  animationDelay = 0,
  legendPosition = "right",
  dataKey = "value",
  formatTooltip,
  formatLabel,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<{
    x: number;
    y: number;
    data: PieChartDataPoint;
    percentage: number;
  } | null>(null);

  // Configuración del gráfico
  const radius = size / 2 - 20; // Margen de 20px
  const centerX = size / 2;
  const centerY = size / 2;

  // Calcular segmentos del pie
  const { segments, total } = useMemo(() => {
    if (!data.length) {
      return { segments: [], total: 0 };
    }

    // Calcular total
    const totalValue = data.reduce(
      (sum, item) => sum + (item[dataKey] || 0),
      0
    );

    if (totalValue === 0) {
      return { segments: [], total: 0 };
    }

    // Generar segmentos
    let currentAngle = -Math.PI / 2; // Empezar desde arriba

    const segmentsData = data.map((dataPoint, index) => {
      const value = dataPoint[dataKey] || 0;
      const percentage = (value / totalValue) * 100;
      const angle = (value / totalValue) * 2 * Math.PI;
      const color = dataPoint.color || colors[index % colors.length];

      // Calcular coordenadas del arco
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // Coordenadas para el path del arco
      const startX = centerX + Math.cos(startAngle) * radius;
      const startY = centerY + Math.sin(startAngle) * radius;
      const endX = centerX + Math.cos(endAngle) * radius;
      const endY = centerY + Math.sin(endAngle) * radius;

      // Coordenadas internas (para donut)
      const innerStartX = centerX + Math.cos(startAngle) * innerRadius;
      const innerStartY = centerY + Math.sin(startAngle) * innerRadius;
      const innerEndX = centerX + Math.cos(endAngle) * innerRadius;
      const innerEndY = centerY + Math.sin(endAngle) * innerRadius;

      // Flag para arcos grandes (más de 180 grados)
      const largeArcFlag = angle > Math.PI ? 1 : 0;

      // Crear path SVG
      let pathData: string;

      if (innerRadius > 0) {
        // Donut chart
        pathData = [
          `M ${startX} ${startY}`, // Mover al punto inicial exterior
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arco exterior
          `L ${innerEndX} ${innerEndY}`, // Línea al punto final interior
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`, // Arco interior (reverso)
          "Z", // Cerrar path
        ].join(" ");
      } else {
        // Pie chart
        pathData = [
          `M ${centerX} ${centerY}`, // Mover al centro
          `L ${startX} ${startY}`, // Línea al punto inicial
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arco
          "Z", // Cerrar path
        ].join(" ");
      }

      // Calcular posición para etiquetas
      const midAngle = startAngle + angle / 2;
      const labelRadius =
        innerRadius > 0
          ? innerRadius + (radius - innerRadius) / 2
          : radius * 0.7;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;

      currentAngle = endAngle;

      return {
        dataPoint,
        value,
        percentage,
        angle,
        startAngle,
        endAngle,
        color,
        pathData,
        labelX,
        labelY,
        midAngle,
        index,
      };
    });

    return {
      segments: segmentsData,
      total: totalValue,
    };
  }, [data, dataKey, colors, radius, innerRadius, centerX, centerY]);

  // Formatear etiquetas
  const formatSegmentLabel = (segment: any) => {
    if (formatLabel) {
      return formatLabel(segment.value, segment.percentage);
    }
    return showPercentages
      ? `${segment.percentage.toFixed(1)}%`
      : segment.value.toString();
  };

  // Manejar hover sobre segmentos
  const handleSegmentHover = (event: React.MouseEvent, segment: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredSegment({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: segment.dataPoint,
      percentage: segment.percentage,
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
      <div
        className={`flex ${
          legendPosition === "bottom" ? "flex-col" : "flex-row"
        } items-center gap-6`}
      >
        {/* SVG del gráfico circular */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: animationDelay + 0.4,
            ease: "easeOut",
          }}
          className="relative"
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <svg width={size} height={size} className="overflow-visible">
            {/* Segmentos del pie */}
            {segments.map((segment, index) => (
              <motion.path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer"
                initial={{
                  pathLength: 0,
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  pathLength: 1,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 1.2,
                  delay: animationDelay + 0.8 + index * 0.15,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  filter: "brightness(1.1)",
                  transformOrigin: `${centerX}px ${centerY}px`,
                }}
                onMouseEnter={(e) =>
                  showTooltip && handleSegmentHover(e, segment)
                }
              />
            ))}

            {/* Etiquetas en los segmentos */}
            {showLabels &&
              segments.map((segment, index) => {
                // Solo mostrar etiqueta si el segmento es lo suficientemente grande
                if (segment.percentage < 5) return null;

                return (
                  <motion.text
                    key={`label-${index}`}
                    x={segment.labelX}
                    y={segment.labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-medium fill-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: animationDelay + 1.5 + index * 0.1 }}
                    style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
                  >
                    {formatSegmentLabel(segment)}
                  </motion.text>
                );
              })}

            {/* Texto central para donut charts */}
            {innerRadius > 0 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: animationDelay + 1.8 }}
              >
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-2xl font-bold fill-gray-900"
                >
                  {total}
                </text>
                <text
                  x={centerX}
                  y={centerY + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-sm fill-gray-500"
                >
                  Total
                </text>
              </motion.g>
            )}
          </svg>

          {/* Tooltip */}
          {showTooltip && hoveredSegment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bg-white p-3 border border-gray-200 rounded-lg shadow-lg pointer-events-none z-10"
              style={{
                left: hoveredSegment.x + 10,
                top: hoveredSegment.y - 10,
                transform: "translateY(-100%)",
              }}
            >
              <p className="font-medium text-gray-900 mb-1">
                {hoveredSegment.data.name}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: hoveredSegment.data.color || colors[0],
                  }}
                />
                <span className="text-gray-600">
                  {formatTooltip
                    ? formatTooltip(
                        hoveredSegment.data[dataKey],
                        hoveredSegment.data.name,
                        hoveredSegment.percentage
                      )[0]
                    : `${
                        hoveredSegment.data[dataKey]
                      } (${hoveredSegment.percentage.toFixed(1)}%)`}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Leyenda */}
        {showLegend && (
          <motion.div
            initial={{
              opacity: 0,
              x: legendPosition === "right" ? 20 : 0,
              y: legendPosition === "bottom" ? 20 : 0,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: animationDelay + 1.5 }}
            className={`${
              legendPosition === "bottom"
                ? "grid grid-cols-2 gap-2 w-full"
                : "flex flex-col gap-2"
            }`}
          >
            {segments.map((segment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: legendPosition === "right" ? 10 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: animationDelay + 1.6 + index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onMouseEnter={(e) => handleSegmentHover(e, segment)}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {segment.dataPoint.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{segment.value}</span>
                    <span>•</span>
                    <span>{segment.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CustomPieChart;

// Componentes predefinidos para casos comunes en gestión ganadera

// Distribución por tipo de ganado
export const CattleTypeDistribution: React.FC<{
  data: PieChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomPieChart
    data={data.map((item, index) => ({
      ...item,
      color:
        item.color ||
        [
          "#10b981", // Verde para vacas lecheras
          "#3b82f6", // Azul para toros
          "#f59e0b", // Amarillo para terneros
          "#8b5cf6", // Púrpura para vaquillas
          "#ef4444", // Rojo para novillos
        ][index % 5],
    }))}
    title="Distribución por Tipo"
    subtitle="Porcentaje de cada tipo de ganado"
    formatTooltip={(value, name, percentage) => [
      `${value} animales (${percentage.toFixed(1)}%)`,
      name,
    ]}
    className={className}
  />
);

// Distribución por estado de salud
export const HealthStatusDistribution: React.FC<{
  data: PieChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomPieChart
    data={data.map((item) => ({
      ...item,
      color:
        item.name === "Saludable"
          ? "#10b981"
          : item.name === "Enfermo"
          ? "#ef4444"
          : item.name === "Cuarentena"
          ? "#f59e0b"
          : item.name === "Recuperándose"
          ? "#3b82f6"
          : "#6b7280",
    }))}
    title="Estado de Salud"
    subtitle="Distribución sanitaria del ganado"
    formatTooltip={(value, name, percentage) => [
      `${value} animales (${percentage.toFixed(1)}%)`,
      name,
    ]}
    className={className}
  />
);

// Distribución por raza (donut chart)
export const BreedDistributionDonut: React.FC<{
  data: PieChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomPieChart
    data={data}
    title="Distribución por Raza"
    subtitle="Razas de ganado en el rancho"
    innerRadius={60}
    size={300}
    formatTooltip={(value, name, percentage) => [
      `${value} animales (${percentage.toFixed(1)}%)`,
      name,
    ]}
    legendPosition="bottom"
    className={className}
  />
);

// Distribución por género
export const GenderDistribution: React.FC<{
  data: PieChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomPieChart
    data={data.map((item) => ({
      ...item,
      color: item.name === "Macho" ? "#3b82f6" : "#ec4899",
    }))}
    title="Distribución por Género"
    subtitle="Proporción de machos y hembras"
    size={250}
    showLabels={true}
    formatTooltip={(value, name, percentage) => [
      `${value} animales (${percentage.toFixed(1)}%)`,
      name,
    ]}
    className={className}
  />
);

// Distribución por edad
export const AgeDistribution: React.FC<{
  data: PieChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomPieChart
    data={data}
    title="Distribución por Edad"
    subtitle="Grupos etarios del ganado"
    colors={["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]}
    formatTooltip={(value, name, percentage) => [
      `${value} animales (${percentage.toFixed(1)}%)`,
      name,
    ]}
    className={className}
  />
);

// Distribución de vacunaciones
export const VaccinationStatusDistribution: React.FC<{
  data: PieChartDataPoint[];
  className?: string;
}> = ({ data, className }) => (
  <CustomPieChart
    data={data.map((item) => ({
      ...item,
      color:
        item.name === "Al día"
          ? "#10b981"
          : item.name === "Vencidas"
          ? "#ef4444"
          : item.name === "Próximas"
          ? "#f59e0b"
          : "#6b7280",
    }))}
    title="Estado de Vacunación"
    subtitle="Situación del programa de vacunas"
    innerRadius={50}
    formatTooltip={(value, name, percentage) => [
      `${value} animales (${percentage.toFixed(1)}%)`,
      name,
    ]}
    className={className}
  />
);
