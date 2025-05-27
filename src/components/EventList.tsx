"use client";

import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
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
    return <div className="text-center py-4 text-gray-500">Memuat acara...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return <div className="text-center py-4 text-gray-500">Tidak ada acara untuk tanggal ini</div>;
  }

  return events.map((event) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600 dark:text-gray-300">{event.title}</h1>
        <span className="text-gray-300 text-xs">
          {new Date(event.startTime).toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
    </div>
  ));
};

export default EventList;
