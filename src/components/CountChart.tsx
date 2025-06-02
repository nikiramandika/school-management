"use client";
import Image from "next/image";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import FullCalendar from "@fullcalendar/react";

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const data = [
    {
      name: "Total",
      count: boys + girls,
      fill: isDark ? "#282a30" : "white",
    },
    {
      name: "Girls",
      count: girls,
      fill: isDark ? "#737ced" : "#737ced",
    },
    {
      name: "Boys",
      count: boys,
      fill: isDark ? "#00b8db" : "#00b8db",
    },
  ];

  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="45%"
          outerRadius="100%"
          barSize={32}
          data={data} 
        >
          <RadialBar background dataKey="count"/>
        </RadialBarChart>
      </ResponsiveContainer>
      <Image
        src="/maleFemale.png"
        alt=""
        width={50}
        height={50}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default CountChart;
