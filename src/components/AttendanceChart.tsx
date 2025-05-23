"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

const AttendanceChart = ({
  data,
}: {
  data: { name: string; present: number; absent: number }[];
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart width={500} height={300} data={data} barSize={20}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false} 
          stroke={isDark ? "#374151" : "#ddd"} 
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tick={{ fill: isDark ? "#9CA3AF" : "#d1d5db" }}
          tickLine={false}
        />
        <YAxis 
          axisLine={false} 
          tick={{ fill: isDark ? "#9CA3AF" : "#d1d5db" }} 
          tickLine={false} 
        />
        <Tooltip
          contentStyle={{ 
            borderRadius: "10px", 
            borderColor: isDark ? "#374151" : "lightgray",
            backgroundColor: isDark ? "#1F2937" : "white",
            color: isDark ? "#E5E7EB" : "black"
          }}
        />
        <Legend
          align="left"
          verticalAlign="top"
          wrapperStyle={{ 
            paddingTop: "20px", 
            paddingBottom: "40px",
            color: isDark ? "#E5E7EB" : "black"
          }}
        />
        <Bar
          dataKey="present"
          fill="#FAE27C"
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
        <Bar
          dataKey="absent"
          fill="#C3EBFA"
          legendType="circle"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
