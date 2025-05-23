"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, onChange] = useState<Value>(() => {
    const dateParam = searchParams.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  });

  useEffect(() => {
    if (value instanceof Date) {
      const newDate = value.toISOString().split('T')[0];
      const currentDate = searchParams.get('date');
      
      // Only update if the date has actually changed
      if (newDate !== currentDate) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', newDate);
        router.push(`?${params.toString()}`);
      }
    }
  }, [value, router, searchParams]);

  return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendar;
