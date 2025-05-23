"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTheme } from "next-themes";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface EventCalendarProps {
  onDateChange: (date: Date) => void;
}

const EventCalendar = ({ onDateChange }: EventCalendarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [value, onChange] = useState<Value>(() => {
    const dateParam = searchParams.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  });

  useEffect(() => {
    if (value instanceof Date) {
      onDateChange(value);
    }
  }, [value, onDateChange]);

  return (
    <div className={theme === 'dark' ? 'dark-calendar' : ''}>
      <Calendar 
        onChange={onChange} 
        value={value}
        className={theme === 'dark' ? 'dark' : ''}
      />
    </div>
  );
};

export default EventCalendar;
