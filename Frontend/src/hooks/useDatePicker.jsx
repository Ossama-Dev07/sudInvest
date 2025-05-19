import React, { useState } from 'react'
import { Calendar } from 'lucide-react'

// Shadcn UI components
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Custom hook for date-time picking logic
const useDateTimePicker = (initialDate = new Date()) => {
  const [date, setDate] = useState(initialDate)
  const [isOpen, setIsOpen] = useState(false)
  
  // Extract hours and minutes from the date
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  // Format date for display
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }
    
    return date.toLocaleDateString('en-US', options)
  }
  
  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }
  
  // Handle time change
  const handleTimeChange = (e) => {
    const [newHours, newMinutes] = e.target.value.split(':')
    const newDate = new Date(date)
    newDate.setHours(parseInt(newHours, 10))
    newDate.setMinutes(parseInt(newMinutes, 10))
    setDate(newDate)
  }
  
  // Handle date selection
  const handleDateSelect = (newDate) => {
    if (newDate) {
      // Preserve the current time when selecting a new date
      newDate.setHours(date.getHours())
      newDate.setMinutes(date.getMinutes())
      setDate(newDate)
    }
  }
  
  return {
    date,
    setDate,
    isOpen,
    setIsOpen,
    hours,
    minutes,
    formatDate,
    formatTime,
    handleTimeChange,
    handleDateSelect
  }
}

// DateTimePicker component that uses the hook
const DateTimePicker = ({ 
  label = "Select Date & Time",
  value,
  onChange,
  className = ""
}) => {
  const {
    date,
    isOpen,
    setIsOpen,
    hours,
    minutes,
    formatDate,
    formatTime,
    handleTimeChange,
    handleDateSelect
  } = useDateTimePicker(value)
  
  // Call onChange prop when date changes
  React.useEffect(() => {
    if (onChange) {
      onChange(date)
    }
  }, [date, onChange])
  
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline" 
            className="w-full justify-start text-left font-normal border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date ? (
              <span>{formatDate(date)} {formatTime(date)}</span>
            ) : (
              <span>Pick a date and time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <div className="p-4 space-y-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="border-t pt-4">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={`${hours}:${minutes}`}
                onChange={handleTimeChange}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Example of how to use multiple instances
const DateRangePicker = () => {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7) // Default to 7 days later
    return date
  })
  
  return (
    <div className="space-y-6">
      <DateTimePicker 
      className='dark:bg-transparent'
        label="Start Date & Time" 
        value={startDate} 
        onChange={setStartDate} 
      />
      
      <DateTimePicker 
        label="End Date & Time" 
        value={endDate} 
        onChange={setEndDate} 
      />
      
      <div className="text-sm text-muted-foreground mt-4">
        <p><strong>Selected Range:</strong></p>
        <p>From: {startDate.toLocaleString()}</p>
        <p>To: {endDate.toLocaleString()}</p>
        
        {startDate > endDate && (
          <p className="text-red-500 mt-2">
            Warning: Start date is after end date
          </p>
        )}
      </div>
    </div>
  )
}

export { DateTimePicker, useDateTimePicker, DateRangePicker }