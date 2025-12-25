# Schedule Implementation - Required Fixes

## Overview

The implementation has some mismatches between expected and actual API structure. Here are the required fixes:

## 1. Type Aliases (DONE ✅)

Added type aliases in `schedule.types.ts`:

```typescript
export type DoctorScheduleDto = DoctorDailySchedule;
export type ServiceMedicalScheduleDto = ServiceMedicalDailySchedule;
export type DoctorScheduleExceptionDto = DoctorScheduleException;
export type ServiceMedicalScheduleExceptionDto = ServiceMedicalScheduleException;
export type CreateDoctorScheduleRequest = CreateDoctorDailyScheduleRequest;
export type CreateServiceMedicalScheduleRequest = CreateServiceMedicalDailyScheduleRequest;
```

## 2. Backend API Structure Differences

### Current Implementation Uses:

- `pattern` (single) → Should be `schedulePatterns` (array)
- `timeSlots` → Should be `appointmentTimes`
- `maxPatients` → Not in the model (needs to be added or removed from forms)
- `isActive` → Not in the model (needs to be added or removed from forms)

### AppointmentTime Values:

Backend uses 30-minute intervals:

```
T08_00, T08_30, T09_00, T09_30, T10_00, T10_30, T11_00, T11_30,
T13_00, T13_30, T14_00, T14_30, T15_00, T15_30, T16_00, T16_30,
T17_00, T17_30, T18_00, T18_30, T19_00, T19_30, T20_00, T20_30
```

### ExceptionType Values:

```
BLOCK_SLOT - Block specific time slot
UNBLOCK_SLOT - Unblock previously blocked slot
DAY_OFF - Full day off
CAPACITY_CHANGE - Change max capacity
```

No `PARTIAL_CHANGE` - use `BLOCK_SLOT` or `DAY_OFF` instead

## 3. Required Changes by File

### A. `schedule.service.ts` - Add Missing Methods

**Need to add:**

```typescript
// List schedules with filters
static listDoctorSchedules(request: ListDoctorSchedulesRequest) {
    return apiClient.get<ListSchedulesResponse<DoctorDailySchedule>>(
        '/api/schedule/doctor-schedules/list',
        { params: request }
    );
}

static listServiceMedicalSchedules(request: ListServiceMedicalSchedulesRequest) {
    return apiClient.get<ListSchedulesResponse<ServiceMedicalDailySchedule>>(
        '/api/schedule/service-medical-schedules/list',
        { params: request }
    );
}
```

**Fix signatures:**

- `deleteDoctorSchedule` and `deleteServiceMedicalSchedule` need second parameter removed or made optional
- `getDoctorExceptions` and `getServiceMedicalExceptions` need filter parameters

### B. Component Updates

#### `SchedulePatternSelector.tsx` (DONE ✅)

- Added `singleSelect` prop to support both single and multiple selection
- Already using array: `selectedPatterns: SchedulePattern[]`

#### `TimeSlotSelector.tsx` (DONE ✅)

- Updated AppointmentTime values to T08_00 format

#### `ExceptionRequestCard.tsx` (DONE ✅)

- Already has `type` prop

### C. Page Component Changes

#### `DoctorScheduleManagement.tsx`

```typescript
// Change from:
pattern: SchedulePattern.MORNING,
timeSlots: [],
maxPatients: 10,
isActive: true,

// To:
schedulePatterns: [SchedulePattern.MORNING],
// Remove maxPatients and isActive (not in model)
```

**SchedulePatternSelector usage:**

```tsx
// Change from selectedPattern to selectedPatterns
<SchedulePatternSelector
    selectedPatterns={formData.schedulePatterns}
    onChange={(patterns) => setFormData({ ...formData, schedulePatterns: patterns })}
    singleSelect={false}
/>
```

**TimeSlotSelector:**

- Not needed for daily schedules (they only have patterns, not specific times)
- Remove TimeSlotSelector from create schedule forms
- Time slots are handled by appointments, not schedules

#### `ServiceScheduleManagement.tsx`

Same changes as DoctorScheduleManagement

#### `ExceptionRequestsManagement.tsx`

```tsx
// Add type prop to ExceptionRequestCard
<ExceptionRequestCard
    exception={exception}
    type="doctor"  // or "service"
    requesterName={`Bác sĩ ${exception.doctorId}`}
    onApprove={() => handleReviewClick(...)}
    onReject={() => handleReviewClick(...)}
/>
```

#### `RequestOff.tsx`

```typescript
// Change form data structure:
const [formData, setFormData] = useState<CreateDoctorScheduleExceptionRequest>({
    doctorId,
    exceptionDate: '',
    exceptionType: ExceptionType.DAY_OFF,
    appointmentTimes: [],  // Changed from timeSlots
    isAvailable: false,    // For DAY_OFF this should be false
    reason: '',
});

// Remove pattern field (not in exception model)
// Remove pattern-related UI

// For full day off:
exceptionType: ExceptionType.DAY_OFF
appointmentTimes: [] or undefined
isAvailable: false

// For blocking specific times:
exceptionType: ExceptionType.BLOCK_SLOT
appointmentTimes: [T08_00, T09_00, ...]
isAvailable: false
```

#### `MySchedules.tsx`

```tsx
// Fix API call
const response = await ScheduleService.listDoctorSchedules({
    doctorId,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
});

// Display schedulePatterns array
{
    schedule.schedulePatterns.map((pattern) => (
        <span key={pattern} className="badge bg-info me-1">
            {pattern}
        </span>
    ));
}
```

### D. `ScheduleCalendar.tsx`

```tsx
// Fix property access
schedule.schedulePatterns.includes(pattern); // instead of schedule.pattern
```

## 4. Simplified Workflow

### Hospital Staff - Create Schedule:

1. Select doctor/service ID
2. Select date
3. Select schedule patterns (multiple: MORNING, AFTERNOON, etc.)
4. Submit
5. No need for time slots in daily schedules

### Doctor - Request Exception:

1. Select date
2. Choose exception type:
    - **DAY_OFF**: Full day unavailable (appointmentTimes = [])
    - **BLOCK_SLOT**: Block specific times (select appointmentTimes)
3. Enter reason
4. Submit

## 5. Styling Fixes

### Empty SCSS Rulesets

Remove or add content to:

- `DoctorScheduleManagement.module.scss`
- `ServiceScheduleManagement.module.scss`
- `MySchedules.module.scss`
- `ReviewExceptionModal.module.scss`

```scss
// Either remove the file or add:
.componentName {
    // Add styles or leave comment
    /* Page-specific styles */
}
```

## 6. Implementation Priority

1. **High Priority (Blockers):**
    - Fix schedule.service.ts API methods
    - Update form data structures in all pages
    - Remove timeSlots, use appointmentTimes
    - Remove maxPatients and isActive from forms

2. **Medium Priority:**
    - Update SchedulePatternSelector usage (selectedPattern → selectedPatterns)
    - Fix ExceptionType usage (remove PARTIAL_CHANGE)
    - Add type prop to ExceptionRequestCard calls

3. **Low Priority (Quality):**
    - Fix empty SCSS rulesets
    - Remove unused imports
    - Add proper error messages

## 7. Testing Checklist

After fixes:

- [ ] No TypeScript errors
- [ ] Create doctor schedule works
- [ ] Create service schedule works
- [ ] List schedules works
- [ ] Request day off works
- [ ] Request block slot works
- [ ] Review exception requests works
- [ ] Calendar view displays correctly

## 8. Summary

The main issues are:

1. **Data Structure Mismatch**: Backend uses `schedulePatterns` array and `appointmentTimes`, frontend was using singular `pattern` and `timeSlots`
2. **Extra Fields**: `maxPatients` and `isActive` not in backend model
3. **Missing API Methods**: `listDoctorSchedules` and `listServiceMedicalSchedules` not implemented in service
4. **Wrong Enum Values**: Using `PARTIAL_CHANGE` which doesn't exist

**Recommendation:**
Since there are many files to fix, consider creating a new branch and implementing these fixes systematically, testing each component after changes.
