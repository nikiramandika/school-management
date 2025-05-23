"use client";

import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import { useState } from "react";

const EventCalendarContainer = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="bg-gray-50 dark:bg-card p-4 rounded-md">
      <EventCalendar onDateChange={setSelectedDate} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        <EventList date={selectedDate} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
