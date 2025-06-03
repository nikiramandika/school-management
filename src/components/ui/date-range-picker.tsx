"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, parse } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateRangePickerProps {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  const [startTime, setStartTime] = React.useState<string>(
    date?.from ? format(date.from, "HH:mm") : "00:00"
  )
  const [endTime, setEndTime] = React.useState<string>(
    date?.to ? format(date.to, "HH:mm") : "23:59"
  )

  const handleDateSelect = (newDate: DateRange | undefined) => {
    if (newDate?.from) {
      const [hours, minutes] = startTime.split(":").map(Number)
      const newFromDate = new Date(newDate.from)
      newFromDate.setHours(hours, minutes, 0, 0)
      newDate.from = newFromDate
    }
    if (newDate?.to) {
      const [hours, minutes] = endTime.split(":").map(Number)
      const newToDate = new Date(newDate.to)
      newToDate.setHours(hours, minutes, 0, 0)
      newDate.to = newToDate
    }
    setDate(newDate)
  }

  const handleTimeChange = (time: string, isStart: boolean) => {
    if (isStart) {
      setStartTime(time)
      if (date?.from) {
        const [hours, minutes] = time.split(":").map(Number)
        const newDate = { ...date }
        const newFromDate = new Date(date.from)
        newFromDate.setHours(hours, minutes, 0, 0)
        newDate.from = newFromDate
        setDate(newDate)
      }
    } else {
      setEndTime(time)
      if (date?.to) {
        const [hours, minutes] = time.split(":").map(Number)
        const newDate = { ...date }
        const newToDate = new Date(date.to)
        newToDate.setHours(hours, minutes, 0, 0)
        newDate.to = newToDate
        setDate(newDate)
      }
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y HH:mm")} -{" "}
                  {format(date.to, "LLL dd, y HH:mm")}
                </>
              ) : (
                format(date.from, "LLL dd, y HH:mm")
              )
            ) : (
              <span>Pilih Rentang Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start" >
          <div className="flex flex-col gap-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
            <div className="flex gap-4 items-center">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Waktu Mulai</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value, true)}
                  className="w-[120px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Waktu Berakhir</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange(e.target.value, false)}
                  className="w-[120px]"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 