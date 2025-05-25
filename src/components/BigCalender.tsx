"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "next-themes";

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-[603px]">
      <style jsx global>{`
        .fc {
          --fc-border-color: ${theme === "dark" ? "#374151" : "#e5e7eb"};
          --fc-button-text-color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          --fc-button-bg-color: ${theme === "dark" ? "#1f2937" : "white"};
          --fc-button-border-color: ${theme === "dark" ? "#374151" : "#e5e7eb"};
          --fc-button-hover-bg-color: ${theme === "dark"
            ? "#374151"
            : "#f3f4f6"};
          --fc-button-hover-border-color: ${theme === "dark"
            ? "#4b5563"
            : "#d1d5db"};
          --fc-button-active-bg-color: #3b82f6;
          --fc-button-active-border-color: #3b82f6;
          --fc-event-bg-color: #3b82f6;
          --fc-event-border-color: #3b82f6;
          --fc-today-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-neutral-bg-color: ${theme === "dark" ? "#1f2937" : "white"};
          --fc-list-event-hover-bg-color: ${theme === "dark"
            ? "#374151"
            : "#f3f4f6"};
          --fc-highlight-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-page-bg-color: ${theme === "dark" ? "#1f2937" : "white"};
          --fc-neutral-text-color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          --fc-more-link-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-more-link-text-color: ${theme === "dark"
            ? "#e5e7eb"
            : "#374151"};
          --fc-event-text-color: white;
          --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);
          --fc-event-resizer-thickness: 8px;
          --fc-event-resizer-dot-total-width: 8px;
          --fc-event-resizer-dot-border-width: 1px;
          --fc-non-business-color: ${theme === "dark" ? "#111827" : "#f9fafb"};
          --fc-bg-event-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-bg-event-opacity: 0.3;
          --fc-today-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-now-indicator-color: #ef4444;
        }

        .fc .fc-toolbar {
          margin-bottom: 1.5rem;
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: ${theme === "dark" ? "#f9fafb" : "#111827"};
        }

        .fc .fc-button {
          padding: 0.5rem 1rem;
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white !important;
        }

        .fc .fc-timegrid-slot {
          height: 2.5rem !important;
        }

        .fc .fc-timegrid-slot-label {
          font-size: 0.875rem;
          color: ${theme === "dark" ? "#9ca3af" : "#6b7280"};
        }

        .fc .fc-timegrid-axis {
          padding: 0.5rem;
          color: ${theme === "dark" ? "#9ca3af" : "#6b7280"};
        }

        .fc .fc-timegrid-slot-minor {
          border-top-style: dashed;
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #ef4444;
        }

        .fc .fc-event {
          border-radius: 0.375rem;
          padding: 0.25rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .fc .fc-event:hover {
          box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.1);
        }

        .fc .fc-event-title {
          font-weight: 500;
        }

        .fc .fc-event-time {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .fc .fc-col-header-cell {
          padding: 0.75rem;
          font-weight: 500;
          color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          background-color: ${theme === "dark" ? "#111827" : "#f9fafb"};
        }

        .fc .fc-timegrid-axis-cushion,
        .fc .fc-timegrid-slot-label-cushion {
          color: ${theme === "dark" ? "#9ca3af" : "#6b7280"};
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        events={data}
        height="100%"
        slotMinTime="08:00:00"
        slotMaxTime="17:00:00"
        slotDuration="00:45:00"
        allDaySlot={false}
        nowIndicator={true}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          omitZeroMinute: false,
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          omitZeroMinute: false,
        }}
        buttonText={{
          today: "Hari Ini",
          week: "Minggu",
          day: "Hari",
        }}
        locale="id"
        eventContent={(eventInfo) => (
          <div className="p-1">
            <div className="font-medium">{eventInfo.event.title}</div>
            <div className="text-xs opacity-80">{eventInfo.timeText}</div>
          </div>
        )}
      />
    </div>
  );
};

export default BigCalendar;
