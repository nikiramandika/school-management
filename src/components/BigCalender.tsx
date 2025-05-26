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
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nowIndicator = document.querySelector('.fc-timegrid-now-indicator-line');
      if (nowIndicator) {
        const rect = nowIndicator.getBoundingClientRect();
        if (
          e.clientY >= rect.top - 5 &&
          e.clientY <= rect.bottom + 5 &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right
        ) {
          setShowTooltip(true);
          setTooltipPosition({
            top: rect.top - 30,
            left: rect.right - 100
          });
        } else {
          setShowTooltip(false);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-[603px] relative">
      <style jsx global>{`
        .fc {
          --fc-border-color: ${theme === "dark" ? "#374151" : "#e5e7eb"};
          --fc-button-text-color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          --fc-button-bg-color: ${theme === "dark" ? "#1f2937" : "white"};
          --fc-button-border-color: ${theme === "dark" ? "#374151" : "#e5e7eb"};
          --fc-button-hover-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-button-hover-border-color: ${theme === "dark" ? "#4b5563" : "#d1d5db"};
          --fc-button-active-bg-color: #3b82f6;
          --fc-button-active-border-color: #3b82f6;
          --fc-event-bg-color: #3b82f6;
          --fc-event-border-color: #3b82f6;
          --fc-today-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-neutral-bg-color: ${theme === "dark" ? "#1f2937" : "white"};
          --fc-list-event-hover-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-highlight-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-page-bg-color: ${theme === "dark" ? "#1f2937" : "white"};
          --fc-neutral-text-color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          --fc-more-link-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-more-link-text-color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          --fc-event-text-color: white;
          --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);
          --fc-event-resizer-thickness: 8px;
          --fc-event-resizer-dot-total-width: 8px;
          --fc-event-resizer-dot-border-width: 1px;
          --fc-non-business-color: ${theme === "dark" ? "#111827" : "#f9fafb"};
          --fc-bg-event-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-bg-event-opacity: 0.3;
          --fc-today-bg-color: ${theme === "dark" ? "#374151" : "#f3f4f6"};
          --fc-now-indicator-color: #008000;
        }

        .fc .fc-toolbar {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .fc .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${theme === "dark" ? "#f9fafb" : "#111827"};
          letter-spacing: -0.025em;
        }

        .fc .fc-button {
          padding: 0.375rem 0.75rem;
          font-weight: 500;
          font-size: 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease-in-out;
          text-transform: capitalize;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .fc .fc-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white !important;
          transform: translateY(0);
        }

        .fc .fc-timegrid-slot {
          height: 2.5rem !important;
        }

        .fc .fc-timegrid-slot-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: ${theme === "dark" ? "#9ca3af" : "#6b7280"};
          padding: 0.5rem;
        }

        .fc .fc-timegrid-axis {
          padding: 0.75rem;
          font-weight: 500;
          font-size: 0.75rem;
          color: ${theme === "dark" ? "#9ca3af" : "#6b7280"};
          width: 4rem !important;
        }

        .fc .fc-timegrid-slot-minor {
          border-top-style: dashed;
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: #008000;
          border-width: 2px;
          position: relative;
          z-index: 5;
          cursor: pointer;
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #008000;
          border-width: 6px;
          position: relative;
          z-index: 5;
          cursor: pointer;
        }

        .fc .fc-event {
          border-radius: 0.375rem;
          padding: 0.25rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          border: none;
          transition: all 0.2s ease-in-out;
        }

        .fc .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);
        }

        .fc .fc-event-title {
          font-weight: 500;
          font-size: 0.75rem;
          line-height: 1rem;
        }

        .fc .fc-event-time {
          font-size: 0.625rem;
          font-weight: 500;
          opacity: 0.9;
          margin-bottom: 0.125rem;
        }

        .fc .fc-col-header-cell {
          padding: 0.5rem;
          font-weight: 500;
          font-size: 0.75rem;
          color: ${theme === "dark" ? "#e5e7eb" : "#374151"};
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
          border-bottom: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-axis-cushion,
        .fc .fc-timegrid-slot-label-cushion {
          color: ${theme === "dark" ? "#9ca3af" : "#6b7280"};
          font-weight: 500;
          font-size: 0.75rem;
        }

        .fc .fc-timegrid-slot-lane {
          border-right: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-slot-minor {
          border-top: 1px dashed ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-scrollgrid {
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .fc .fc-timegrid-slot {
          min-height: 2.5rem !important;
        }

        .fc .fc-timegrid-slot-label-frame {
          padding: 0.5rem;
        }

        .fc .fc-timegrid-slot-minor {
          border-top: 1px dashed ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-slot-lane {
          border-right: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-slot-label {
          padding: 0.5rem;
        }

        .fc .fc-scroller {
          overflow-x: hidden !important;
        }

        .fc .fc-scroller-liquid-absolute {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
        }

        .fc .fc-scroller-liquid {
          position: relative;
          min-height: 100%;
        }

        .fc .fc-scrollgrid-section > * {
          border-left-width: 0;
          border-top-width: 0;
        }

        .fc .fc-scrollgrid-section-header {
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
        }

        .fc .fc-scrollgrid-section-body {
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
        }

        .fc .fc-scrollgrid-section-footer {
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
        }

        .fc .fc-scrollgrid-section {
          border: none;
        }

        .fc .fc-scrollgrid-section-header > * {
          border-bottom-width: 1px;
        }

        .fc .fc-scrollgrid-section-body > * {
          border-bottom-width: 1px;
        }

        .fc .fc-scrollgrid-section-footer > * {
          border-bottom-width: 1px;
        }

        .fc .fc-scrollgrid-section > * {
          border-right-width: 1px;
        }

        .fc .fc-scrollgrid-section > *:last-child {
          border-right-width: 0;
        }

        .fc .fc-timegrid-axis {
          position: sticky;
          left: 0;
          z-index: 3;
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
        }

        .fc .fc-timegrid-slot-label {
          position: sticky;
          left: 0;
          z-index: 2;
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
        }

        .fc .fc-timegrid-axis-frame {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .fc .fc-timegrid-slot-label-frame {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .fc .fc-timegrid-axis {
          width: 4rem !important;
          min-width: 4rem !important;
        }

        .fc .fc-timegrid-slot-label {
          width: 4rem !important;
          min-width: 4rem !important;
        }

        .fc .fc-timegrid-axis-frame {
          width: 100% !important;
        }

        .fc .fc-timegrid-slot-label-frame {
          width: 100% !important;
        }

        .fc .fc-timegrid-axis-cushion {
          width: 100% !important;
          text-align: center !important;
        }

        .fc .fc-timegrid-slot-label-cushion {
          width: 100% !important;
          text-align: center !important;
        }

        .fc .fc-timegrid-axis {
          border-right: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-slot-label {
          border-right: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-axis-frame {
          padding: 0.5rem;
        }

        .fc .fc-timegrid-slot-label-frame {
          padding: 0.5rem;
        }

        .fc .fc-day-header-bottom {
          position: sticky;
          bottom: 0;
          background-color: ${theme === "dark" ? "#1f2937" : "white"};
          border-top: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
          z-index: 3;
        }

        .fc .fc-col-header {
          position: sticky;
          bottom: 0;
          z-index: 2;
        }

        .fc .fc-scrollgrid-section-header {
          position: sticky;
          bottom: 0;
          z-index: 2;
        }

        .fc .fc-scrollgrid-section-header > * {
          border-top: 1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"};
        }

        .fc .fc-timegrid-now-indicator {
          z-index: 5;
        }

        .now-indicator-tooltip {
          position: fixed;
          background-color: #008000;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .now-indicator-tooltip.show {
          opacity: 1;
          transform: translateY(-2px);
        }
      `}</style>
      <div 
        className={`now-indicator-tooltip ${showTooltip ? 'show' : ''}`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`
        }}
      >
        Waktu Sekarang
      </div>
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
        views={{
          timeGridWeek: {
            dayHeaderFormat: { weekday: 'long', day: 'numeric' },
            dayHeaderClassNames: 'fc-day-header-bottom'
          },
          timeGridDay: {
            dayHeaderFormat: { weekday: 'long', day: 'numeric' },
            dayHeaderClassNames: 'fc-day-header-bottom'
          }
        }}
      />
    </div>
  );
};

export default BigCalendar;
