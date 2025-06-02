"use client";

import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import EventList from "./EventList";
import { useState } from "react";
import { useTheme } from "next-themes";

const EventCalendarContainer = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Calendar Header with Gradient bg-gradient-to-r from-indigo-300 to-cyan-200 dark:from-indigo-400 dark:to-cyan-500*/}
        <div className="bg-indigo-400 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Kalender</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-xl border-0 bg-transparent"
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-2 relative items-center mb-4",
                caption_label:
                  "text-lg font-semibold text-gray-900 dark:text-white",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-9 w-9 bg-indigo-400 hover:bg-indigo-500 text-white rounded-full shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                nav_button_previous: "absolute left-2",
                nav_button_next: "absolute right-2",
                table: "w-full border-collapse space-y-1 mt-2",
                head_row: "flex mb-2",
                head_cell:
                  "text-gray-500 dark:text-gray-400 rounded-lg w-10 font-semibold text-sm uppercase tracking-wider",
                row: "flex w-full mt-1",
                cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 dark:[&:has([aria-selected])]:bg-gray-800",
                day: "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-indigo-400 rounded-lg transition-all duration-200 hover:scale-105",
                day_range_end: "day-range-end",
                day_selected:
                  "text-white bg-indigo-500 focus:bg-indigo-500 hover:bg-indigo-400 shadow-lg font-bold transform scale-105",
                day_today:
                  "bg-cyan-500 text-white font-bold border-2 border-cyan-300 shadow-lg transform scale-105",
                day_outside:
                  "day-outside text-gray-400 opacity-40 dark:text-gray-500",
                day_disabled:
                  "text-gray-400 opacity-40 dark:text-gray-500 cursor-not-allowed",
                day_range_middle:
                  "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>
      </div>

      {/* Events Card */}
      <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Events Header with Gradient */}
        <div className="bg-teal-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Acara</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Events Content */}
        <div className="p-6">
          <EventList date={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default EventCalendarContainer;
