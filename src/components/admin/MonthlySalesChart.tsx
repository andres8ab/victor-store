"use client";

import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";

type MonthlySalesData = {
  month: string;
  total: number;
  count: number;
};

type Props = {
  data: MonthlySalesData[];
};

export default function MonthlySalesChart({ data }: Props) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    // Sort data by month (ascending) for better visualization
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));

    const labels = sortedData.map((item) => {
      const [year, month] = item.month.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("es-CO", { month: "short", year: "numeric" });
    });

    const salesData = sortedData.map((item) => Number(item.total));

    // Use theme colors that match the design system
    const textColor = "#1f2937"; // dark-900
    const textColorSecondary = "#6b7280"; // dark-500
    const surfaceBorder = "#e5e7eb"; // light-300
    const greenColor = "#10b981"; // green

    const chartDataConfig = {
      labels,
      datasets: [
        {
          label: "Ventas Mensuales",
          data: salesData,
          fill: false,
          borderColor: greenColor,
          backgroundColor: greenColor,
          tension: 0.4,
        },
      ],
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            maxRotation: 45,
            minRotation: 45,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: function (value: any) {
              return "$" + value.toLocaleString("es-CO");
            },
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };

    setChartData(chartDataConfig);
    setChartOptions(options);
  }, [data]);

  return (
    <div className="w-full overflow-y-auto" style={{ height: "300px", maxHeight: "300px" }}>
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
  );
}
