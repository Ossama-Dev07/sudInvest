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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ChevronLeft, ChevronRight, Trash2, Clock, Calendar as CalendarIcon, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useEventStore from "@/store/useEventStore";

const DateTimePicker = ({ label, value, onChange, isAllDay, isEndDate }) => {
  const inputType = isAllDay ? "date" : "datetime-local";
  const formatValue = (val) => {
    if (!val) return "";
    if (isAllDay) {
      return val.toISOString().slice(0, 10); // YYYY-MM-DD format
    } else {
      return val.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium flex items-center gap-2">
        {isAllDay ? <CalendarIcon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        {label}
      </label>
      <input
        type={inputType}
        value={formatValue(value)}
        onChange={(e) => {
          const inputValue = e.target.value;
          if (!inputValue) {
            onChange(null);
            return;
          }
          
          let date;
          if (isAllDay) {
            date = new Date(inputValue);
            // For all-day events, set appropriate times
            if (isEndDate) {
              date.setHours(23, 59, 59, 999); // End of day
            } else {
              date.setHours(0, 0, 0, 0); // Start of day
            }
          } else {
            date = new Date(inputValue);
          }
          
          onChange(date);
        }}
        className="border border-gray-200 p-2 rounded-md dark:bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
};

const Calendrier = () => {
  // Zustand store
  const {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getCurrentMonthEvents,
    clearError
  } = useEventStore();

  // Local state for UI
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isAllDay, setIsAllDay] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarRef, setCalendarRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle all-day toggle changes
  useEffect(() => {
    if (startDate && endDate) {
      if (isAllDay) {
        // Convert to all-day event
        const newStartDate = new Date(startDate);
        newStartDate.setHours(0, 0, 0, 0);
        const newEndDate = new Date(endDate);
        newEndDate.setHours(23, 59, 59, 999);
        
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      } else {
        // Convert to timed event
        const newStartDate = new Date(startDate);
        if (newStartDate.getHours() === 0 && newStartDate.getMinutes() === 0) {
          newStartDate.setHours(9, 0, 0, 0); // Default to 9 AM
        }
        
        const newEndDate = new Date(endDate);
        if (newEndDate.getHours() === 23 && newEndDate.getMinutes() === 59) {
          newEndDate.setHours(10, 0, 0, 0); // Default to 10 AM (1 hour duration)
        }
        
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
    }
  }, [isAllDay]);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);

    // Initialize start and end dates based on selected date
    const start = new Date(selected.start);
    const end = new Date(selected.end);

    // Determine if it's an all-day selection
    const isAllDaySelection = selected.allDay;
    setIsAllDay(isAllDaySelection);

    if (isAllDaySelection) {
      // For all-day events
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1); // FullCalendar adds an extra day for all-day events
      end.setHours(23, 59, 59, 999);
    } else {
      // For timed events, set a default 1-hour duration
      if (start.getTime() === end.getTime()) {
        end.setHours(start.getHours() + 1);
      }
    }

    setStartDate(start);
    setEndDate(end);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected) => {
    // Show event details or edit dialog instead of delete
    const eventData = events.find(e => e.id === selected.event.id);
    if (eventData) {
      handleSidebarEdit(eventData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      const success = await deleteEvent(eventToDelete.id);
      if (success) {
        setEventToDelete(null);
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setEventToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  // Handle delete from sidebar
  const handleSidebarDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit from sidebar
  const handleSidebarEdit = (event) => {
    setEventToEdit(event);
    setNewEventTitle(event.title || "");
    setDescription(event.extendedProps?.description || "");
    setLocation(event.extendedProps?.location || "");
    setStartDate(new Date(event.start));
    setEndDate(new Date(event.end));
    setIsAllDay(event.allDay || false);
    setIsEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!newEventTitle.trim()) {
      return;
    }

    if (!startDate || !endDate) {
      return;
    }

    if (endDate <= startDate) {
      return;
    }

    setIsSubmitting(true);

    // Make sure all required fields are included
    const eventData = {
      title: newEventTitle.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: isAllDay,
      description: description || "",
      location: location || "",
    };


    const updatedEvent = await updateEvent(eventToEdit.id, eventData);
    
    if (updatedEvent) {
      handleEditClose();
    }

    setIsSubmitting(false);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
    setEventToEdit(null);
    resetForm();
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
    setIsAllDay(true);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) {
      return;
    }

    if (!startDate || !endDate) {
      return;
    }

    if (endDate <= startDate) {
      return;
    }

    setIsSubmitting(true);

    const eventData = {
      title: newEventTitle.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: isAllDay,
      description: description || "",
      location: location || "",
    };

    const newEvent = await createEvent(eventData);
    
    if (newEvent) {
      // Clear selection if it was triggered by date selection
      if (selectedDate && selectedDate.view && calendarRef) {
        const calendarApi = calendarRef.getApi();
        calendarApi.unselect();
      }
      handleCloseDialog();
    }

    setIsSubmitting(false);
  };

  const openNewEventDialog = () => {
    // Set default dates when opening from button
    const now = new Date();
    const later = new Date(now);
    
    // Set default based on current isAllDay state
    if (isAllDay) {
      now.setHours(0, 0, 0, 0);
      later.setHours(23, 59, 59, 999);
    } else {
      later.setHours(now.getHours() + 1);
    }

    setStartDate(now);
    setEndDate(later);
    setSelectedDate(null); // No specific date selected in calendar
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

  // Event handler for FullCalendar event drop/resize
  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo;
    
 

    let startDate = new Date(event.start);
    let endDate = event.end ? new Date(event.end) : null;

    // Simple fallback: if no end date, create a reasonable default
    if (!endDate) {
      if (event.allDay) {
        // For all-day events without end, make it same day
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // Next day (FullCalendar format)
      } else {
        // For timed events without end, add 1 hour
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
    }


    const eventData = {
      title: event.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: event.allDay,
      description: event.extendedProps?.description || "",
      location: event.extendedProps?.location || "",
    };

    const success = await updateEvent(event.id, eventData);
    
    if (!success) {
      changeInfo.revert();
    }
  };

  const currentMonthEvents = getCurrentMonthEvents();

  return (
    <div>
      <div className="flex w-full px-4 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7 flex justify-between items-center">
            <span>Événements</span>
            <span className="text-sm font-normal text-gray-500">
              ({formatDate(new Date(), { month: 'long', year: 'numeric', locale: frLocale })})
            </span>
          </div>

          {/* Loading indicator for sidebar */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement...</span>
            </div>
          )}

          <ul className="space-y-4">
            {!loading && currentMonthEvents.length <= 0 && (
              <div className="italic text-center text-gray-400">
                Aucun événement ce mois-ci
              </div>
            )}

            {!loading && currentMonthEvents.length > 0 &&
              currentMonthEvents.map((event) => (
                <li
                  className="border border-gray-200 shadow px-4 py-3 rounded-md hover:shadow-md transition-shadow relative group"
                  key={event.id}
                >
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSidebarEdit(event);
                      }}
                      title="Modifier l'événement"
                      disabled={loading}
                    >
                      <Edit className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSidebarDelete(event);
                      }}
                      title="Supprimer l'événement"
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>

                  <h3 className="text-blue-800 font-medium text-lg flex items-center gap-2 pr-16">
                    {event.allDay ? (
                      <CalendarIcon className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    {event.title}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {formatDate(event.start, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      locale: frLocale,
                    })}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      event.allDay 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {formatEventTime(event)}
                    </span>
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
          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement du calendrier...</span>
            </div>
          ) : (
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
              eventChange={handleEventChange}
              events={events}
          
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
          )}
          
          <div className="my-2 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              className="hidden h-8 w-8 p-0 lg:flex"
              title="Précédent"
              disabled={loading}
            >
              <ChevronLeft size={20} />
            </Button>

            <Button
              variant="outline"
              onClick={handleToday}
              className="px-4 py-2 h-0 w-0 p-0 hover:underline hover:decoration-blue-600 hover:text-blue-600 font-medium"
              disabled={loading}
            >
              Aujourd'hui
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              className="hidden h-8 w-8 p-0 lg:flex"
              title="Suivant"
              disabled={loading}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Ajouter un nouvel événement
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouvel événement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 p-2 rounded-md mt-1 dark:bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  {isAllDay ? (
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-green-600" />
                  )}
                  <Label htmlFor="allday-switch" className="text-sm font-medium">
                    {isAllDay ? "Toute la journée" : "Heure spécifique"}
                  </Label>
                </div>
                <Switch
                  id="allday-switch"
                  checked={isAllDay}
                  onCheckedChange={setIsAllDay}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <DateTimePicker
                label={isAllDay ? "Date de début*" : "Date et heure de début*"}
                value={startDate}
                onChange={setStartDate}
                isAllDay={isAllDay}
                isEndDate={false}
              />

              <DateTimePicker
                label={isAllDay ? "Date de fin*" : "Date et heure de fin*"}
                value={endDate}
                onChange={setEndDate}
                isAllDay={isAllDay}
                isEndDate={true}
              />

              <div>
                <label className="text-sm font-medium">Lieu</label>
                <input
                  type="text"
                  placeholder="Entrez le lieu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 p-2 dark:bg-transparent rounded-md mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Entrez une description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 dark:bg-transparent p-2 rounded-md mt-1 min-h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
                className="py-2 px-4 rounded-md"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleAddEvent}
                disabled={isSubmitting || !newEventTitle.trim()}
                className="py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  'Ajouter'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing events */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Modifier l'événement
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'événement ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 p-2 rounded-md mt-1 dark:bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  {isAllDay ? (
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-green-600" />
                  )}
                  <Label htmlFor="edit-allday-switch" className="text-sm font-medium">
                    {isAllDay ? "Toute la journée" : "Heure spécifique"}
                  </Label>
                </div>
                <Switch
                  id="edit-allday-switch"
                  checked={isAllDay}
                  onCheckedChange={setIsAllDay}
                  disabled={isSubmitting}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <DateTimePicker
                label={isAllDay ? "Date de début*" : "Date et heure de début*"}
                value={startDate}
                onChange={setStartDate}
                isAllDay={isAllDay}
                isEndDate={false}
              />

              <DateTimePicker
                label={isAllDay ? "Date de fin*" : "Date et heure de fin*"}
                value={endDate}
                onChange={setEndDate}
                isAllDay={isAllDay}
                isEndDate={true}
              />

              <div>
                <label className="text-sm font-medium">Lieu</label>
                <input
                  type="text"
                  placeholder="Entrez le lieu"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 p-2 dark:bg-transparent rounded-md mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Entrez une description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-gray-200 dark:bg-transparent p-2 rounded-md mt-1 min-h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleEditClose}
                disabled={isSubmitting}
                className="py-2 px-4 rounded-md"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleEditConfirm}
                disabled={isSubmitting || !newEventTitle.trim()}
                className="py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog for deletion confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'événement "
              <span className="font-semibold text-gray-900">
                {eventToDelete?.title}
              </span>
              " ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={loading}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Custom styles */}
      <style >{`
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
        .fc .fc-button-primary:not(:disabled).fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #1e3a8a;
          border-color: #1e3a8a;
        }
      `}</style>
    </div>
  );
};

export default Calendrier;