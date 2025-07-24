<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::orderBy('start_date', 'asc')->get();
        
        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'start' => $event->start_date->toISOString(),
                'end' => $event->end_date->toISOString(),
                'allDay' => $event->all_day,
                'extendedProps' => [
                    'description' => $event->description,
                    'location' => $event->location,
                ],
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedEvents,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start' => 'required|date',
            'end' => 'required|date|after:start',
            'allDay' => 'boolean',
        ]);

        // Map frontend field names to backend field names
        $eventData = [
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'start_date' => $request->start,
            'end_date' => $request->end,
            'all_day' => $request->allDay ?? false,
        ];

        $event = Event::create($eventData);

        $formattedEvent = [
            'id' => $event->id,
            'title' => $event->title,
            'start' => $event->start_date->toISOString(),
            'end' => $event->end_date->toISOString(),
            'allDay' => $event->all_day,
            'extendedProps' => [
                'description' => $event->description,
                'location' => $event->location,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedEvent,
        ], 201);
    }

    public function show(Event $event): JsonResponse
    {
        $formattedEvent = [
            'id' => $event->id,
            'title' => $event->title,
            'start' => $event->start_date->toISOString(),
            'end' => $event->end_date->toISOString(),
            'allDay' => $event->all_day,
            'extendedProps' => [
                'description' => $event->description,
                'location' => $event->location,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedEvent,
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start' => 'required|date',
            'end' => 'required|date|after:start',
            'allDay' => 'boolean',
        ]);

        // Map frontend field names to backend field names
        $eventData = [
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'start_date' => $request->start,
            'end_date' => $request->end,
            'all_day' => $request->allDay ?? false,
        ];

        $event->update($eventData);

        $formattedEvent = [
            'id' => $event->id,
            'title' => $event->title,
            'start' => $event->start_date->toISOString(),
            'end' => $event->end_date->toISOString(),
            'allDay' => $event->all_day,
            'extendedProps' => [
                'description' => $event->description,
                'location' => $event->location,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedEvent,
        ]);
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
        ]);
    }

    /**
     * Get events for current month
     */
    public function currentMonth(): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $events = Event::whereBetween('start_date', [$startOfMonth, $endOfMonth])
                      ->orderBy('start_date', 'asc')
                      ->get();

        $formattedEvents = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'start' => $event->start_date->toISOString(),
                'end' => $event->end_date->toISOString(),
                'allDay' => $event->all_day,
                'extendedProps' => [
                    'description' => $event->description,
                    'location' => $event->location,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedEvents,
        ]);
    }

    /**
     * Update event dates (for drag & drop)
     */
    public function updateDates(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after:start',
            'allDay' => 'boolean',
        ]);

        $event->update([
            'start_date' => $request->start,
            'end_date' => $request->end,
            'all_day' => $request->allDay ?? $event->all_day,
        ]);

        $formattedEvent = [
            'id' => $event->id,
            'title' => $event->title,
            'start' => $event->start_date->toISOString(),
            'end' => $event->end_date->toISOString(),
            'allDay' => $event->all_day,
            'extendedProps' => [
                'description' => $event->description,
                'location' => $event->location,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedEvent,
        ]);
    }

    /**
     * Bulk delete events
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'event_ids' => 'required|array',
            'event_ids.*' => 'exists:events,id'
        ]);

        $deletedCount = Event::whereIn('id', $request->event_ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deletedCount} events deleted successfully",
        ]);
    }
}