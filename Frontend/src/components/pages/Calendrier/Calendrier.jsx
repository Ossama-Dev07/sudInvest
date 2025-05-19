import React, { useState, useEffect } from "react";
import { formatDate } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";

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
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        className="border border-gray-200 p-2 rounded-md dark:bg-transparent"
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
  const [calendarRef, setCalendarRef] = useState(null);

  useEffect(() => {
    // Charger les événements du stockage local au montage du composant
    if (typeof window !== "undefined") {
      const savedEvents = localStorage.getItem("events");
      if (savedEvents) {
        setCurrentEvents(JSON.parse(savedEvents));
      }
    }
  }, []);

  useEffect(() => {
    // Sauvegarder les événements dans le stockage local à chaque modification
    if (typeof window !== "undefined") {
      localStorage.setItem("events", JSON.stringify(currentEvents));
    }
  }, [currentEvents]);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);

    // Initialiser les dates de début et de fin basées sur la date sélectionnée
    const start = new Date(selected.start);
    const end = new Date(selected.end);

    // Si c'est un événement toute la journée, ajuster l'heure de fin
    if (selected.allDay) {
      end.setHours(start.getHours() + 1);
    }

    setStartDate(start);
    setEndDate(end);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected) => {
    // Afficher les détails de l'événement ou confirmer la suppression
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'événement "${selected.event.title}" ?`
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
      // Si l'événement a été déclenché par le bouton "Ajouter un événement" plutôt que par la sélection de date
      if (!selectedDate || !selectedDate.view) {
        const now = new Date();
        const later = new Date(now);
        later.setHours(now.getHours() + 1);

        const newEvent = {
          id: `${startDate.toISOString()}-${newEventTitle}`,
          title: newEventTitle,
          start: startDate,
          end: endDate,
          allDay: true,
          extendedProps: {
            description: description,
            location: location,
          },
        };

        setCurrentEvents([...currentEvents, newEvent]);
      } else {
        // Si l'événement a été déclenché par la sélection de date
        const calendarApi = selectedDate.view.calendar;
        calendarApi.unselect();

        const newEvent = {
          id: `${startDate.toISOString()}-${newEventTitle}`,
          title: newEventTitle,
          start: startDate,
          end: endDate,
          allDay: true,
          extendedProps: {
            description: description,
            location: location,
          },
        };

        calendarApi.addEvent(newEvent);
      }
      handleCloseDialog();
    }
  };

  const openNewEventDialog = () => {
    // Définir les dates par défaut lors de l'ouverture à partir du bouton
    const now = new Date();
    const later = new Date(now);
    later.setHours(now.getHours() + 1);

    setStartDate(now);
    setEndDate(later);
    setSelectedDate(null); // Aucune date spécifique sélectionnée dans le calendrier
    setIsDialogOpen(true);
  };

  const formatEventTime = (event) => {
    if (event.allDay) {
      return "Toute la journée";
    }

    const startTime = formatDate(event.start, {
      hour: "numeric",
      minute: "2-digit",
      meridiem: "short",
    });

    const endTime = formatDate(event.end, {
      hour: "numeric",
      minute: "2-digit",
      meridiem: "short",
    });

    return `${startTime} - ${endTime}`;
  };

  // Navigation functions
  const handlePrev = () => {
    if (calendarRef) {
      calendarRef.getApi().prev();
    }
  };

  const handleNext = () => {
    if (calendarRef) {
      calendarRef.getApi().next();
    }
  };

  const handleToday = () => {
    if (calendarRef) {
      calendarRef.getApi().today();
    }
  };

  return (
    <div>
      <div className="flex w-full px-4 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7 flex justify-between items-center">
            <span>Événements</span>
          </div>
          <ul className="space-y-4 ">
            {currentEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                Aucun événement présent
              </div>
            )}

            {currentEvents.length > 0 &&
              currentEvents.map((event) => (
                <li
                  className="border border-gray-200 shadow px-4 py-3 rounded-md"
                  key={event.id}
                >
                  <h3 className="text-blue-800 font-medium text-lg">
                    {event.title}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {formatDate(event.start, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {!event.allDay && <span> • {formatEventTime(event)}</span>}
                  </div>

                  {event.extendedProps?.location && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Lieu:</span>{" "}
                      {event.extendedProps.location}
                    </div>
                  )}

                  {event.extendedProps?.description && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Description:</span>{" "}
                      {event.extendedProps.description}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>

        <div className="w-9/12 mt-8">
          {/* Custom navigation toolbar below header */}

          <FullCalendar
            ref={setCalendarRef}
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "addEvent",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            locales={[frLocale]}
            locale="fr"
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
            customButtons={{
              addEvent: {
                text: "Ajouter un événement",
                click: openNewEventDialog,
                backgroundColor: "#1D4ED8",
                color: "#FFFFFF",
                cssClass: "custom-add-event-button",
              },
            }}
          />
          <div className="my-2 flex justify-between items-center ">
            <Button
              variant="outline"
              onClick={handlePrev}
              className="hidden h-8 w-8 p-0 lg:flex"
              title="Précédent"
            >
              <ChevronLeft size={20} />
            </Button>

            <Button
              variant="outline"
              onClick={handleToday}
              className="px-4 py-2 h-0 w-0 p-0 hover:underline hover:decoration-blue-600 hover:text-blue-600 font-medium"
            >
              Aujourd'hui
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              className="hidden h-8 w-8 p-0 lg:flex"
              title="Suivant"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue améliorée pour ajouter de nouveaux événements avec plus de détails */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel événement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="grid w-full gap-4">
              <div>
                <label className="text-sm font-medium">
                  Titre de l'événement*
                </label>
                <input
                  type="text"
                  placeholder="Entrez le titre de l'événement"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                  className="w-full border border-gray-200 p-2 rounded-md mt-1 dark:bg-transparent"
                />
              </div>

              <DateTimePicker
                label="Date et heure de début*"
                value={startDate}
                onChange={setStartDate}
              />

              <DateTimePicker
                label="Date et heure de fin*"
                value={endDate}
                onChange={setEndDate}
              />

              <div>
                <label className="text-sm font-medium">Lieu</label>
                <input
                  type="text"
                  placeholder="Entrez le lieu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 p-2 dark:bg-transparent rounded-md mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Entrez une description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 dark:bg-transparent p-2 rounded-md mt-1 min-h-20"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                onClick={handleCloseDialog}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="py-2 px-4 rounded-md text-white"
                style={{ backgroundColor: "#1D4ED8" }}
              >
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ajouter une feuille de style personnalisée pour les boutons du calendrier */}
      <style jsx global>{`
        .fc .custom-add-event-button {
          background-color: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
          color: white !important;
        }
        .fc .custom-add-event-button:hover {
          background-color: #1e40af !important;
          border-color: #1e40af !important;
        }
        .fc .fc-button-primary {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }
        .fc .fc-button-primary:hover {
          background-color: #1e40af;
          border-color: #1e40af;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #1e3a8a;
          border-color: #1e3a8a;
        }
      `}</style>
    </div>
  );
};

export default Calendrier;
