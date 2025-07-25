# Time Filter Implementation Plan

## Overview
The admin dashboard currently has date filtering but lacks time filtering functionality. This plan outlines the steps to add time filtering to the SalesReportFilter component.

## Components to Create

### 1. TimeInput Component
We'll need a TimeInput component that wraps the existing Input component:

```jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function TimeInput({ value, onChange, className, ...props }) {
  return (
    <Input
      type="time"
      value={value || ''}
      onChange={onChange}
      className={cn(
        "bg-black/20 border-amber-800/50 text-amber-100",
        className
      )}
      {...props}
    />
  );
}
```

## Component Updates

### 2. SalesReportFilter Component Updates

#### Add State Variables
Add state variables for start and end times:

```jsx
const [startTime, setStartTime] = useState('00:00');
const [endTime, setEndTime] = useState('23:59');
```

#### Add Time Input UI
Add time inputs to the UI, next to the date inputs:

```jsx
<div className="space-y-2">
  <Label className="text-amber-200 flex items-center">
    <Calendar className="w-4 h-4 mr-2" />
    Date & Time Range
  </Label>
  <div className="grid grid-cols-2 gap-2">
    <div>
      <DatePicker date={startDate} setDate={setStartDate} placeholder="Start Date"/>
      <TimeInput 
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        placeholder="Start Time"
        className="mt-2"
      />
    </div>
    <div>
      <DatePicker date={endDate} setDate={setEndDate} placeholder="End Date"/>
      <TimeInput 
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        placeholder="End Time"
        className="mt-2"
      />
    </div>
  </div>
</div>
```

#### Update Filter Logic
Modify the applyFilters function to incorporate time filtering:

```jsx
// Date and time filter
let startDateTime = null;
let endDateTime = null;

if (startDate) {
  startDateTime = new Date(startDate);
  if (startTime) {
    const [hours, minutes] = startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
  } else {
    startDateTime.setHours(0, 0, 0, 0);
  }
}

if (endDate) {
  endDateTime = new Date(endDate);
  if (endTime) {
    const [hours, minutes] = endTime.split(':').map(Number);
    endDateTime.setHours(hours, minutes, 59, 999);
  } else {
    endDateTime.setHours(23, 59, 59, 999);
  }
}
```

#### Update Clear Filters Function
Update the clearFilters function to reset time inputs:

```jsx
const clearFilters = () => {
  setStartDate(null);
  setEndDate(null);
  setStartTime('00:00');
  setEndTime('23:59');
  setPaymentMethod('all');
  setReceiptNumber('');
  onFilter({ sales, expenses });
  toast({
    title: 'Filters Cleared',
    description: 'Showing all records.',
  });
};
```

## Implementation Steps

1. Create the TimeInput component in `src/components/ui/timeinput.jsx`
2. Update the SalesReportFilter component in `src/components/admin/reports/SalesReportFilter.jsx`:
   - Add state variables for start and end times
   - Add time inputs to the UI
   - Update the filter logic to incorporate time filtering
   - Update the clear filters function to reset time inputs
3. Test the implementation to ensure it works correctly

## Testing

1. Test with different time ranges to ensure filtering works correctly
2. Test with date and time combinations
3. Test the clear filters functionality
4. Test edge cases (e.g., start time after end time)