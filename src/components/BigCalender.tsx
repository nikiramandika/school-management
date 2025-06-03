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
            top: rect.top - 40,
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
          --fc-border-color: ${theme === "dark" ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.5)"};
          --fc-button-text-color: ${theme === "dark" ? "#f8fafc" : "#1e293b"};
          --fc-button-bg-color: ${theme === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.9)"};
          --fc-button-border-color: ${theme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(203, 213, 225, 0.6)"};
          --fc-button-hover-bg-color: ${theme === "dark" ? "rgba(51, 65, 85, 0.9)" : "rgba(248, 250, 252, 0.95)"};
          --fc-button-hover-border-color: ${theme === "dark" ? "rgba(75, 85, 99, 0.8)" : "rgba(148, 163, 184, 0.7)"};
          --fc-button-active-bg-color: linear-gradient(135deg, #3b82f6, #1d4ed8);
          --fc-button-active-border-color: #3b82f6;
          --fc-event-bg-color: linear-gradient(135deg, #3b82f6, #1e40af);
          --fc-event-border-color: rgba(59, 130, 246, 0.8);
          --fc-today-bg-color: ${theme === "dark" ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.03)"};
          --fc-neutral-bg-color: ${theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.98)"};
          --fc-list-event-hover-bg-color: ${theme === "dark" ? "rgba(51, 65, 85, 0.6)" : "rgba(248, 250, 252, 0.8)"};
          --fc-highlight-color: ${theme === "dark" ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)"};
          --fc-page-bg-color: ${theme === "dark" ? "#0f172a" : "#ffffff"};
          --fc-neutral-text-color: ${theme === "dark" ? "#e2e8f0" : "#334155"};
          --fc-more-link-bg-color: ${theme === "dark" ? "rgba(51, 65, 85, 0.8)" : "rgba(248, 250, 252, 0.9)"};
          --fc-more-link-text-color: ${theme === "dark" ? "#e2e8f0" : "#475569"};
          --fc-event-text-color: white;
          --fc-event-selected-overlay-color: rgba(59, 130, 246, 0.15);
          --fc-event-resizer-thickness: 8px;
          --fc-event-resizer-dot-total-width: 8px;
          --fc-event-resizer-dot-border-width: 1px;
          --fc-non-business-color: ${theme === "dark" ? "rgba(15, 23, 42, 0.8)" : "rgba(248, 250, 252, 0.6)"};
          --fc-bg-event-color: ${theme === "dark" ? "rgba(51, 65, 85, 0.4)" : "rgba(248, 250, 252, 0.7)"};
          --fc-bg-event-opacity: 0.2;
          --fc-now-indicator-color: #10b981;
        }

        .fc {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: ${theme === "dark" 
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" 
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"};
          border-radius: 16px;
          box-shadow: ${theme === "dark"
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)"};
          backdrop-filter: blur(16px);
          overflow: hidden;
        }

        .fc .fc-toolbar {
          margin-bottom: 1.5rem;
          padding: 1.25rem 1.5rem;
          background: ${theme === "dark"
            ? "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)"};
          border-radius: 12px;
          border: 1px solid ${theme === "dark" ? "rgba(71, 85, 105, 0.3)" : "rgba(203, 213, 225, 0.4)"};
          backdrop-filter: blur(12px);
          box-shadow: ${theme === "dark"
            ? "0 8px 25px -8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 8px 25px -8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)"};
        }

        .fc .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${theme === "dark" ? "#ffffff" : "#000000"};
          letter-spacing: -0.025em;
        }

        .fc .fc-button {
          padding: 0.625rem 1.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: capitalize;
          position: relative;
          overflow: hidden;
          background: ${theme === "dark"
            ? "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)"};
          border: 1px solid ${theme === "dark" ? "rgba(71, 85, 105, 0.4)" : "rgba(203, 213, 225, 0.5)"};
          box-shadow: ${theme === "dark"
            ? "0 4px 12px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 4px 12px -4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)"};
        }

        .fc .fc-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .fc .fc-button:hover::before {
          left: 100%;
        }

        .fc .fc-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: ${theme === "dark"
            ? "0 12px 24px -6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
            : "0 12px 24px -6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)"};
          border-color: ${theme === "dark" ? "rgba(96, 165, 250, 0.6)" : "rgba(59, 130, 246, 0.4)"};
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-color: #3b82f6;
          color: white !important;
          transform: translateY(0) scale(1);
          box-shadow: ${theme === "dark"
            ? "0 8px 20px -4px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
            : "0 8px 20px -4px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"};
        }

        .fc .fc-timegrid-slot {
          height: 3rem !important;
          transition: background-color 0.2s ease;
        }

        .fc .fc-timegrid-slot:hover {
          background-color: ${theme === "dark" ? "rgba(59, 130, 246, 0.03)" : "rgba(59, 130, 246, 0.02)"};
        }

        .fc .fc-timegrid-slot-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: ${theme === "dark" ? "#94a3b8" : "#64748b"};
          padding: 0.75rem;
          text-shadow: ${theme === "dark" ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(255, 255, 255, 0.8)"};
        }

        .fc .fc-timegrid-axis {
          padding: 1rem;
          font-weight: 600;
          font-size: 0.8rem;
          color: ${theme === "dark" ? "#94a3b8" : "#64748b"};
          width: 5rem !important;
          background: ${theme === "dark"
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)"};
          backdrop-filter: blur(8px);
        }

        .fc .fc-timegrid-slot-minor {
          border-top: 1px dashed ${theme === "dark" ? "rgba(71, 85, 105, 0.3)" : "rgba(203, 213, 225, 0.4)"};
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: #10b981;
          border-width: 3px;
          position: relative;
          z-index: 10;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          animation: pulse-green 2s infinite;
        }

        @keyframes pulse-green {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          }
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #10b981;
          border-width: 8px;
          position: relative;
          z-index: 10;
          cursor: pointer;
          filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
        }

        .fc .fc-event {
          border-radius: 12px;
          padding: 0.5rem;
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          box-shadow: ${theme === "dark"
            ? "0 8px 25px -8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
            : "0 8px 25px -8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"};
          position: relative;
          overflow: hidden;
        }

        .fc .fc-event::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .fc .fc-event:hover::before {
          left: 100%;
        }

        .fc .fc-event:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: ${theme === "dark"
            ? "0 20px 40px -8px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
            : "0 20px 40px -8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)"};
          z-index: 5;
        }

        .fc .fc-event-title {
          font-weight: 600;
          font-size: 0.875rem;
          line-height: 1.2;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .fc .fc-event-time {
          font-size: 0.75rem;
          font-weight: 500;
          opacity: 0.9;
          margin-bottom: 0.25rem;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .fc .fc-col-header-cell {
          padding: 1rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: ${theme === "dark" ? "#e2e8f0" : "#334155"};
          background: ${theme === "dark"
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)"};
          border-bottom: 2px solid ${theme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"};
          backdrop-filter: blur(8px);
          text-shadow: ${theme === "dark" ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(255, 255, 255, 0.8)"};
          text-align: center;
          vertical-align: middle;
        }

        .fc .fc-col-header-cell .fc-col-header-cell-cushion {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
        }

        .fc .fc-timegrid-axis-cushion,
        .fc .fc-timegrid-slot-label-cushion {
          color: ${theme === "dark" ? "#94a3b8" : "#64748b"};
          font-weight: 600;
          font-size: 0.8rem;
        }

        .fc .fc-timegrid-slot-lane {
          border-right: 1px solid ${theme === "dark" ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.5)"};
          transition: border-color 0.2s ease;
        }

        .fc .fc-scrollgrid {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: ${theme === "dark"
            ? "0 20px 40px -12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            : "0 20px 40px -12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)"};
          backdrop-filter: blur(16px);
        }

        .fc .fc-timegrid-slot {
          min-height: 3rem !important;
        }

        .fc .fc-timegrid-axis {
          width: 5rem !important;
          min-width: 5rem !important;
          border-right: 2px solid ${theme === "dark" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)"};
        }

        .fc .fc-timegrid-slot-label {
          width: 5rem !important;
          min-width: 5rem !important;
          border-right: 2px solid ${theme === "dark" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.15)"};
        }

        .fc .fc-scrollgrid-section-header {
          background: ${theme === "dark"
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)"};
          backdrop-filter: blur(12px);
        }

        .fc .fc-scrollgrid-section-body {
          background: ${theme === "dark"
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)"};
          backdrop-filter: blur(8px);
        }

        .now-indicator-tooltip {
          position: fixed;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .now-indicator-tooltip::before {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #10b981;
        }

        .now-indicator-tooltip.show {
          opacity: 1;
          transform: translateY(-8px) scale(1.05);
        }

        .fc .fc-scroller::-webkit-scrollbar {
          width: 8px;
        }

        .fc .fc-scroller::-webkit-scrollbar-track {
          background: ${theme === "dark" ? "rgba(30, 41, 59, 0.3)" : "rgba(248, 250, 252, 0.5)"};
          border-radius: 4px;
        }

        .fc .fc-scroller::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "rgba(71, 85, 105, 0.5)" : "rgba(148, 163, 184, 0.5)"};
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .fc .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "rgba(96, 165, 250, 0.6)" : "rgba(59, 130, 246, 0.4)"};
        }

        @media (prefers-reduced-motion: reduce) {
          .fc .fc-button,
          .fc .fc-event,
          .now-indicator-tooltip {
            transition: none;
          }
          
          .fc .fc-timegrid-now-indicator-line {
            animation: none;
          }
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
          <div className="p-2 relative">
            <div className="font-semibold text-white leading-tight">
              {eventInfo.event.title}
            </div>
            <div className="text-xs text-white/90 mt-1 font-medium">
              {eventInfo.timeText}
            </div>
          </div>
        )}
        views={{
          timeGridWeek: {
            dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'numeric' },
            dayHeaderClassNames: 'fc-day-header-bottom'
          },
          timeGridDay: {
            dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'numeric' },
            dayHeaderClassNames: 'fc-day-header-bottom'
          }
        }}
      />
    </div>
  );
};

export default BigCalendar;