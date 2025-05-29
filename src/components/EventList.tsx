"use client";

import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
}

interface EventListProps {
  date: Date;
}

const EventList = ({ date }: EventListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/events?date=${date.toISOString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
          console.error('Invalid response format:', data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [date]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Silakan coba lagi dalam beberapa saat</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-indigo-400 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Tidak Ada Acara</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm leading-relaxed">
          Belum ada acara yang dijadwalkan untuk tanggal
          <br />
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {date.toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={event.id}
          className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
        >
          {/* Colorful left border */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
            index % 4 === 0 ? 'bg-gradient-to-b from-blue-500 to-indigo-600' :
            index % 4 === 1 ? 'bg-gradient-to-b from-purple-500 to-pink-600' :
            index % 4 === 2 ? 'bg-gradient-to-b from-emerald-500 to-teal-600' :
            'bg-gradient-to-b from-orange-500 to-red-600'
          }`}></div>
          
          <div className="p-6 pl-8">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {event.description}
            </p>
            
            {/* Subtle bottom accent */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(event.startTime).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                    {event.endTime && 
                      new Date(event.startTime).toDateString() !== new Date(event.endTime).toDateString() &&
                      ` - ${new Date(event.endTime).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;