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
    <div className="bg-gray-50 dark:bg-card p-6 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border dark:border-gray-700 bg-white dark:bg-card"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 dark:[&:has([aria-selected])]:bg-gray-800",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors",
              day_range_end: "day-range-end",
              day_selected: "bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-100 dark:hover:text-gray-900 dark:focus:bg-gray-100 dark:focus:text-gray-900",
              day_today: "bg-black text-white dark:bg-white dark:text-black font-semibold border-2 border-gray-900 dark:border-gray-100",
              day_outside: "day-outside text-gray-500 opacity-50 dark:text-gray-400",
              day_disabled: "text-gray-500 opacity-50 dark:text-gray-400",
              day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-50",
              day_hidden: "invisible",
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Events</h2>
          </div>
          <EventList date={selectedDate} />
        </div>
      </div>
    </div>
  );
};

export default EventCalendarContainer;
