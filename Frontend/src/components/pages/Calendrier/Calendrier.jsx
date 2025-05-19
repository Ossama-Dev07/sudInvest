import React, { useState, useEffect } from "react";
import { formatDate } from "@fullcalendar/core";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const DateTimePicker = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="datetime-local"
        value={value ? value.toISOString().slice(0, 16) : ""}
        onChange={(e) => {
          const date = new Date(e.target.value);
          onChange(date);
        }}
        className="border border-gray-200 p-2 rounded-md"
      />
    </div>
  );
};

const Calendrier = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Load events from local storage when the component mounts
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever they change
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    
    // Initialize the start and end dates based on the selected date
    const start = new Date(selected.start);
    const end = new Date(selected.end);
    
    // If it's an all-day event, adjust the end time to be later in the day
    if (selected.allDay) {
      end.setHours(start.getHours() + 1);
    }
    
    setStartDate(start);
    setEndDate(end);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected) => {
    // Show event details or confirm deletion
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      selected.event.remove();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewEventTitle("");
    setDescription("");
    setLocation("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEventTitle && startDate && endDate) {
      const calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();

      const newEvent = {
        id: `${startDate.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: startDate,
        end: endDate,
        allDay: false,
        extendedProps: {
          description: description,
          location: location
        }
      };

      calendarApi.addEvent(newEvent);
      handleCloseDialog();
    }
  };

  const formatEventTime = (event) => {
    if (event.allDay) {
      return 'All day';
    }
    
    const startTime = formatDate(event.start, {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    });
    
    const endTime = formatDate(event.end, {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    });
    
    return `${startTime} - ${endTime}`;
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">
            Calendar Events
          </div>
          <ul className="space-y-4">
            {currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                No Events Present
              </div>
            )}

            {currentEvents.length > 0 &&
              currentEvents.map((event) => (
                <li
                  className="border border-gray-200 shadow px-4 py-3 rounded-md"
                  key={event.id}
                >
                  <h3 className="text-blue-800 font-medium text-lg">{event.title}</h3>
                  <div className="text-sm text-gray-600">
                    {formatDate(event.start, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {!event.allDay && (
                      <span> • {formatEventTime(event)}</span>
                    )}
                  </div>
                  
                  {event.extendedProps?.location && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Location:</span> {event.extendedProps.location}
                    </div>
                  )}
                  
                  {event.extendedProps?.description && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Description:</span> {event.extendedProps.description}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>

        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => setCurrentEvents(events)}
            initialEvents={
              typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("events") || "[]")
                : []
            }
          />
        </div>
      </div>

      {/* Enhanced Dialog for adding new events with more details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="grid w-full gap-4">
              <div>
                <label className="text-sm font-medium">Event Title*</label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                  className="w-full border border-gray-200 p-2 rounded-md mt-1"
                />
              </div>
              
              <DateTimePicker 
                label="Start Date & Time*" 
                value={startDate} 
                onChange={setStartDate} 
              />
              
              <DateTimePicker 
                label="End Date & Time*" 
                value={endDate} 
                onChange={setEndDate} 
              />
              
              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded-md mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded-md mt-1 min-h-20"
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
              >
                Add Event
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendrier;