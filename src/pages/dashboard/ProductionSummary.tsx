import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Milk,
  Scale,
  Baby,
  Target,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Tipos para métricas de producción
type ProductionMetric =
  | "milk"
  | "weight_gain"
  | "reproduction"
  | "feed_efficiency"
  | "mortality";
type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

// Interfaz para datos de producción láctea
interface MilkProduction {
  date: string;
  total_milk_liters: number;
  average_per_cow: number;
  quality_score: number;
  fat_percentage: number;
  protein_percentage: number;
  somatic_cell_count: number;
  producing_cows: number;
}

// Interfaz para datos de crecimiento/peso
interface WeightGainData {
  date: string;
  total_weight_gain_kg: number;
  average_daily_gain_kg: number;
  feed_conversion_ratio: number;
  animals_monitored: number;
}

// Interfaz para datos reproductivos
interface ReproductionData {
  date: string;
  conception_rate: number;
  calving_rate: number;
  calving_interval_days: number;
  new_pregnancies: number;
  births: number;
  breeding_efficiency: number;
}

// Interfaz para resumen de producción general
interface ProductionSummary {
  current_period: {
    milk_production: MilkProduction;
    weight_gain: WeightGainData;
    reproduction: ReproductionData;
  };
  previous_period: {
    milk_production: MilkProduction;
    weight_gain: WeightGainData;
    reproduction: ReproductionData;
  };
  targets: {
    daily_milk_target: number;
    monthly_weight_gain_target: number;
    conception_rate_target: number;
    feed_efficiency_target: number;
  };
  performance_indicators: {
    milk_production_trend: number;
    weight_gain_trend: number;
    reproduction_trend: number;
    overall_efficiency: number;
  };
}

// Interfaz para datos de eficiencia alimentaria
interface FeedEfficiency {
  date: string;
  feed_intake_kg: number;
  milk_output_liters: number;
  weight_gain_kg: number;
  efficiency_ratio: number;
  cost_per_liter: number;
}

const ProductionSummary: React.FC = () => {
  // Estados principales
  const [productionData, setProductionData] =
    useState<ProductionSummary | null>(null);
  const [feedEfficiencyData, setFeedEfficiencyData] = useState<
    FeedEfficiency[]
  >([]);
  const [] = useState<ProductionMetric>("milk");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "overview" | "detailed" | "trends"
  >("overview");

  // Cargar datos simulados
  useEffect(() => {
    const loadProductionData = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockProductionSummary: ProductionSummary = {
        current_period: {
          milk_production: {
            date: "2025-07-11T00:00:00Z",
            total_milk_liters: 8450,
            average_per_cow: 28.2,
            quality_score: 94.5,
            fat_percentage: 3.8,
            protein_percentage: 3.2,
            somatic_cell_count: 125000,
            producing_cows: 142,
          },
          weight_gain: {
            date: "2025-07-11T00:00:00Z",
            total_weight_gain_kg: 1250,
            average_daily_gain_kg: 1.2,
            feed_conversion_ratio: 6.8,
            animals_monitored: 195,
          },
          reproduction: {
            date: "2025-07-11T00:00:00Z",
            conception_rate: 89.5,
            calving_rate: 92.3,
            calving_interval_days: 395,
            new_pregnancies: 12,
            births: 8,
            breeding_efficiency: 87.2,
          },
        },
        previous_period: {
          milk_production: {
            date: "2025-06-11T00:00:00Z",
            total_milk_liters: 8120,
            average_per_cow: 27.1,
            quality_score: 92.8,
            fat_percentage: 3.7,
            protein_percentage: 3.1,
            somatic_cell_count: 135000,
            producing_cows: 138,
          },
          weight_gain: {
            date: "2025-06-11T00:00:00Z",
            total_weight_gain_kg: 1180,
            average_daily_gain_kg: 1.1,
            feed_conversion_ratio: 7.2,
            animals_monitored: 190,
          },
          reproduction: {
            date: "2025-06-11T00:00:00Z",
            conception_rate: 85.2,
            calving_rate: 90.1,
            calving_interval_days: 402,
            new_pregnancies: 9,
            births: 6,
            breeding_efficiency: 84.5,
          },
        },
        targets: {
          daily_milk_target: 8500,
          monthly_weight_gain_target: 1300,
          conception_rate_target: 90.0,
          feed_efficiency_target: 6.5,
        },
        performance_indicators: {
          milk_production_trend: 4.1,
          weight_gain_trend: 5.9,
          reproduction_trend: 5.0,
          overall_efficiency: 92.8,
        },
      };

      const mockFeedEfficiency: FeedEfficiency[] = [
        {
          date: "2025-07-01T00:00:00Z",
          feed_intake_kg: 15500,
          milk_output_liters: 8200,
          weight_gain_kg: 980,
          efficiency_ratio: 6.9,
          cost_per_liter: 0.42,
        },
        {
          date: "2025-07-05T00:00:00Z",
          feed_intake_kg: 15800,
          milk_output_liters: 8350,
          weight_gain_kg: 1050,
          efficiency_ratio: 6.7,
          cost_per_liter: 0.41,
        },
        {
          date: "2025-07-10T00:00:00Z",
          feed_intake_kg: 16100,
          milk_output_liters: 8450,
          weight_gain_kg: 1120,
          efficiency_ratio: 6.5,
          cost_per_liter: 0.4,
        },
      ];

      setProductionData(mockProductionSummary);
      setFeedEfficiencyData(mockFeedEfficiency);
      setIsLoading(false);
    };

    loadProductionData();
  }, []);

  // Función para calcular el cambio porcentual
  const calculatePercentageChange = (
    current: number,
    previous: number
  ): number => {
    return ((current - previous) / previous) * 100;
  };

  // Función para obtener el color del trend
  const getTrendColor = (value: number, isPositive: boolean = true): string => {
    const positive = isPositive ? value > 0 : value < 0;
    return positive ? "text-green-400" : "text-red-400";
  };

  // Componente para tarjetas de métricas principales
  const MetricCard: React.FC<{
    title: string;
    current: number;
    previous: number;
    target?: number;
    unit: string;
    icon: React.ReactNode;
    color: string;
    index: number;
    isPercentage?: boolean;
    reversePositive?: boolean;
  }> = ({
    title,
    current,
    previous,
    target,
    unit,
    icon,
    color,
    index,
    isPercentage = false,
    reversePositive = false,
  }) => {
    const percentageChange = calculatePercentageChange(current, previous);
    const targetAchievement = target ? (current / target) * 100 : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                   hover:bg-white/10 transition-all duration-300 shadow-lg overflow-hidden"
      >
        {/* Efecto de brillo */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 2.5,
            delay: index * 0.3,
            repeat: Infinity,
            repeatDelay: 8,
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-white/10`}>{icon}</div>
            <div className="text-right">
              <div
                className={`flex items-center text-sm font-medium ${getTrendColor(
                  percentageChange,
                  !reversePositive
                )}`}
              >
                {percentageChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(percentageChange).toFixed(1)}%
              </div>
              <div className="text-xs text-white/60">vs last period</div>
            </div>
          </div>

          {/* Valor principal */}
          <motion.div
            className="text-3xl font-bold text-white mb-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5 + index * 0.1,
              type: "spring" as const,
              stiffness: 200,
              damping: 15,
            }}
          >
            {isPercentage ? `${current.toFixed(1)}%` : current.toLocaleString()}
            <span className="text-lg text-white/70 ml-1">
              {!isPercentage && unit}
            </span>
          </motion.div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-white/90 mb-2">{title}</h3>

          {/* Target achievement */}
          {target && targetAchievement && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Target Achievement</span>
                <span
                  className={`font-medium ${
                    targetAchievement >= 100
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {targetAchievement.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(targetAchievement, 100)}%` }}
                  transition={{ delay: index * 0.2 + 1, duration: 1 }}
                  className={`h-full rounded-full ${
                    targetAchievement >= 100
                      ? "bg-green-500"
                      : targetAchievement >= 80
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Componente para gráfico de barras simple
  const SimpleBarChart: React.FC<{
    data: { label: string; value: number; color: string }[];
    title: string;
  }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">{item.label}</span>
                <span className="text-white font-medium">
                  {item.value.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.2, duration: 1 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente para eficiencia alimentaria
  const FeedEfficiencyChart: React.FC = () => {
    return (
      <div className="bg-white/5 rounded-xl p-6 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">
          Feed Efficiency Trends
        </h3>
        <div className="space-y-4">
          {feedEfficiencyData.map((data, index) => (
            <motion.div
              key={data.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">
                  {new Date(data.date).toLocaleDateString()}
                </span>
                <span
                  className={`font-medium ${
                    data.efficiency_ratio <= 6.5
                      ? "text-green-400"
                      : data.efficiency_ratio <= 7.0
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  Ratio: {data.efficiency_ratio}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Feed Intake:</span>
                  <span className="text-white font-medium ml-2">
                    {data.feed_intake_kg.toLocaleString()} kg
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Cost/Liter:</span>
                  <span className="text-white font-medium ml-2">
                    ${data.cost_per_liter.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!productionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="text-center text-white">
          Error loading production data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Production Summary
            </h1>
            <p className="text-white/70">
              Comprehensive production metrics and performance indicators
            </p>
          </div>

          {/* Controles de vista */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                       focus:outline-none focus:border-purple-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            <div className="flex space-x-2">
              {["overview", "detailed", "trends"].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view as typeof selectedView)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedView === view
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Vista Overview */}
        {selectedView === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Milk Production"
                current={
                  productionData.current_period.milk_production
                    .total_milk_liters
                }
                previous={
                  productionData.previous_period.milk_production
                    .total_milk_liters
                }
                target={productionData.targets.daily_milk_target}
                unit="L"
                icon={<Milk className="w-6 h-6" />}
                color="text-blue-500"
                index={0}
              />
              <MetricCard
                title="Weight Gain"
                current={
                  productionData.current_period.weight_gain.total_weight_gain_kg
                }
                previous={
                  productionData.previous_period.weight_gain
                    .total_weight_gain_kg
                }
                target={productionData.targets.monthly_weight_gain_target}
                unit="kg"
                icon={<Scale className="w-6 h-6" />}
                color="text-green-500"
                index={1}
              />
              <MetricCard
                title="Conception Rate"
                current={
                  productionData.current_period.reproduction.conception_rate
                }
                previous={
                  productionData.previous_period.reproduction.conception_rate
                }
                target={productionData.targets.conception_rate_target}
                unit=""
                icon={<Baby className="w-6 h-6" />}
                color="text-pink-500"
                index={2}
                isPercentage={true}
              />
              <MetricCard
                title="Feed Efficiency"
                current={
                  productionData.current_period.weight_gain
                    .feed_conversion_ratio
                }
                previous={
                  productionData.previous_period.weight_gain
                    .feed_conversion_ratio
                }
                target={productionData.targets.feed_efficiency_target}
                unit="FCR"
                icon={<Target className="w-6 h-6" />}
                color="text-orange-500"
                index={3}
                reversePositive={true}
              />
            </div>

            {/* Indicadores de rendimiento */}
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Performance Indicators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="text-4xl font-bold text-green-400 mb-2"
                  >
                    {productionData.performance_indicators.overall_efficiency.toFixed(
                      1
                    )}
                    %
                  </motion.div>
                  <p className="text-white/70">Overall Efficiency</p>
                  <div className="mt-2 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">Excellent</span>
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    className={`text-4xl font-bold mb-2 ${getTrendColor(
                      productionData.performance_indicators
                        .milk_production_trend
                    )}`}
                  >
                    +
                    {productionData.performance_indicators.milk_production_trend.toFixed(
                      1
                    )}
                    %
                  </motion.div>
                  <p className="text-white/70">Milk Trend</p>
                  <div className="mt-2 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">Improving</span>
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    className={`text-4xl font-bold mb-2 ${getTrendColor(
                      productionData.performance_indicators.weight_gain_trend
                    )}`}
                  >
                    +
                    {productionData.performance_indicators.weight_gain_trend.toFixed(
                      1
                    )}
                    %
                  </motion.div>
                  <p className="text-white/70">Growth Trend</p>
                  <div className="mt-2 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">Strong</span>
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    className={`text-4xl font-bold mb-2 ${getTrendColor(
                      productionData.performance_indicators.reproduction_trend
                    )}`}
                  >
                    +
                    {productionData.performance_indicators.reproduction_trend.toFixed(
                      1
                    )}
                    %
                  </motion.div>
                  <p className="text-white/70">Reproduction Trend</p>
                  <div className="mt-2 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">Optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos de barras */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleBarChart
                title="Milk Quality Metrics"
                data={[
                  {
                    label: "Quality Score",
                    value:
                      productionData.current_period.milk_production
                        .quality_score,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Fat %",
                    value:
                      productionData.current_period.milk_production
                        .fat_percentage,
                    color: "bg-yellow-500",
                  },
                  {
                    label: "Protein %",
                    value:
                      productionData.current_period.milk_production
                        .protein_percentage,
                    color: "bg-green-500",
                  },
                ]}
              />
              <FeedEfficiencyChart />
            </div>
          </motion.div>
        )}

        {/* Vista Detailed */}
        {selectedView === "detailed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Producción láctea detallada */}
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Detailed Milk Production
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Production:</span>
                    <span className="text-white font-bold">
                      {productionData.current_period.milk_production.total_milk_liters.toLocaleString()}
                      L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Average per Cow:</span>
                    <span className="text-white font-bold">
                      {
                        productionData.current_period.milk_production
                          .average_per_cow
                      }
                      L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Producing Cows:</span>
                    <span className="text-white font-bold">
                      {
                        productionData.current_period.milk_production
                          .producing_cows
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Quality Score:</span>
                    <span
                      className={`font-bold ${
                        productionData.current_period.milk_production
                          .quality_score >= 95
                          ? "text-green-400"
                          : productionData.current_period.milk_production
                              .quality_score >= 85
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {
                        productionData.current_period.milk_production
                          .quality_score
                      }
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Fat Content:</span>
                    <span className="text-white font-bold">
                      {
                        productionData.current_period.milk_production
                          .fat_percentage
                      }
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Protein Content:</span>
                    <span className="text-white font-bold">
                      {
                        productionData.current_period.milk_production
                          .protein_percentage
                      }
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Somatic Cell Count:</span>
                    <span
                      className={`font-bold ${
                        productionData.current_period.milk_production
                          .somatic_cell_count <= 150000
                          ? "text-green-400"
                          : productionData.current_period.milk_production
                              .somatic_cell_count <= 300000
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {productionData.current_period.milk_production.somatic_cell_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos reproductivos detallados */}
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Reproduction Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Conception Rate:</span>
                    <span
                      className={`font-bold ${
                        productionData.current_period.reproduction
                          .conception_rate >= 90
                          ? "text-green-400"
                          : productionData.current_period.reproduction
                              .conception_rate >= 80
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {
                        productionData.current_period.reproduction
                          .conception_rate
                      }
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Calving Rate:</span>
                    <span className="text-white font-bold">
                      {productionData.current_period.reproduction.calving_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">New Pregnancies:</span>
                    <span className="text-white font-bold">
                      {
                        productionData.current_period.reproduction
                          .new_pregnancies
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Recent Births:</span>
                    <span className="text-white font-bold">
                      {productionData.current_period.reproduction.births}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Calving Interval:</span>
                    <span
                      className={`font-bold ${
                        productionData.current_period.reproduction
                          .calving_interval_days <= 365
                          ? "text-green-400"
                          : productionData.current_period.reproduction
                              .calving_interval_days <= 400
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {
                        productionData.current_period.reproduction
                          .calving_interval_days
                      }{" "}
                      days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Breeding Efficiency:</span>
                    <span className="text-white font-bold">
                      {
                        productionData.current_period.reproduction
                          .breeding_efficiency
                      }
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista Trends */}
        {selectedView === "trends" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Tendencias generales */}
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Production Trends Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Comparación período actual vs anterior */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Period Comparison
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Milk Production</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {productionData.current_period.milk_production.total_milk_liters.toLocaleString()}
                            L
                          </span>
                          <span
                            className={`text-sm ${getTrendColor(
                              calculatePercentageChange(
                                productionData.current_period.milk_production
                                  .total_milk_liters,
                                productionData.previous_period.milk_production
                                  .total_milk_liters
                              )
                            )}`}
                          >
                            (
                            {calculatePercentageChange(
                              productionData.current_period.milk_production
                                .total_milk_liters,
                              productionData.previous_period.milk_production
                                .total_milk_liters
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-white/60">
                        Previous:{" "}
                        {productionData.previous_period.milk_production.total_milk_liters.toLocaleString()}
                        L
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Weight Gain</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {productionData.current_period.weight_gain.total_weight_gain_kg.toLocaleString()}
                            kg
                          </span>
                          <span
                            className={`text-sm ${getTrendColor(
                              calculatePercentageChange(
                                productionData.current_period.weight_gain
                                  .total_weight_gain_kg,
                                productionData.previous_period.weight_gain
                                  .total_weight_gain_kg
                              )
                            )}`}
                          >
                            (
                            {calculatePercentageChange(
                              productionData.current_period.weight_gain
                                .total_weight_gain_kg,
                              productionData.previous_period.weight_gain
                                .total_weight_gain_kg
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-white/60">
                        Previous:{" "}
                        {productionData.previous_period.weight_gain.total_weight_gain_kg.toLocaleString()}
                        kg
                      </div>
                    </div>
                  </div>
                </div>

                {/* Análisis de eficiencia */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Efficiency Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">
                          Feed Conversion Ratio
                        </span>
                        <span
                          className={`font-medium ${
                            productionData.current_period.weight_gain
                              .feed_conversion_ratio <= 6.5
                              ? "text-green-400"
                              : productionData.current_period.weight_gain
                                  .feed_conversion_ratio <= 7.0
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {
                            productionData.current_period.weight_gain
                              .feed_conversion_ratio
                          }
                        </span>
                      </div>
                      <div className="text-sm text-white/60">
                        Target: ≤{" "}
                        {productionData.targets.feed_efficiency_target}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">
                          Overall Efficiency
                        </span>
                        <span className="text-green-400 font-medium">
                          {productionData.performance_indicators.overall_efficiency.toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                      <div className="text-sm text-white/60">
                        Excellent performance
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eficiencia alimentaria extendida */}
            <FeedEfficiencyChart />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductionSummary;
