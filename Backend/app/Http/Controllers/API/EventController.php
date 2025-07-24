<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::orderBy('start_date', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $events->map(fn($event) => $event->toFullCalendarArray()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'all_day' => 'boolean',
        ]);

        $event = Event::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $event->toFullCalendarArray(),
        ], 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $event->toFullCalendarArray(),
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'all_day' => 'boolean',
        ]);

        $event->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $event->toFullCalendarArray(),
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
}