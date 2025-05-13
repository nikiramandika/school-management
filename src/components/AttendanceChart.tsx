"use client";

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
import { IoIosMore } from "react-icons/io";

const data = [
  {
    name: "Mon",
    present: 40,
    absent: 24,
  },
  {
    name: "Tue",
    present: 40,
    absent: 24,
  },
  {
    name: "Wed",
    present: 40,
    absent: 24,
  },
  {
    name: "Thu",
    present: 30,
    absent: 14,
  },
  {
    name: "Fri",
    present: 20,
    absent: 24,
  },
  {
    name: "Sat",
    present: 50,
    absent: 14,
  },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-lg w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <IoIosMore />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", border: "lightgray" }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          />
          <Bar
            dataKey="present"
            fill="#fae27c"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="absent"
            fill="#c3ebfa"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
