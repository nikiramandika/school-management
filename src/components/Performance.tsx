"use client";
import Image from "next/image";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes"; // atau sesuai theme provider yang kamu gunakan

const Performance = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = [
    {
      name: "Group A",
      value: 92,
      fill: isDark ? "#737ced" : "#737ced",
    },
    {
      name: "Group B",
      value: 8,
      fill: isDark ? "#00b8db" : "#00b8db",
    },
  ];

  return (
    <div className="bg-lamaSky dark:bg-card p-4 sm:p-6 rounded-2xl h-80 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Performa</h1>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            fill="#8884d8"
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-3xl font-bold">9.2</h1>
        <p className="text-xs text-gray-300">of 10 max LTS</p>
      </div>
      <h2 className="font-medium absolute bottom-16 left-0 right-0 m-auto text-center">
        Semester 1 - Semester 2
      </h2>
    </div>
  );
};

export default Performance;
