# FAST: Data Contract (frontend ↔ backend)

Ye document demo ke code (`js/core/state.js`, `seed.js`, `constants.js`) se nikala gaya hai.
Teacher frontend, admin frontend aur backend teeno isi shape ko follow karenge.
Koi field badalni ho to pehle yahan badlein, phir code mein.

## Qaide
- Har record ki apni **`id`** hogi (number ya UUID). Demo mein teacher ko naam (`"Ahmed Ali"`) se jora gaya hai, real project mein aisa nahi hoga: naam badal jaye to sab toot jata hai.
- Dates `YYYY-MM-DD` (text), time minutes mein ya `HH:MM`. Server UTC mein rakhe, dikhana frontend ka kaam.
- Password kabhi API se wapas nahi aayega. Server mein sirf hash rakha jayega (demo mein plain text hai, wo sirf demo ke liye).
- Teacher sirf **apna** data mangega. Server har request par token se pehchan kar filter karega.

## Entities

### Department
`id, name`  (demo: CS, IT, English, Math)

### Teacher
`id, name, email (login), passwordHash, phone, cnic, departmentId, designation, qualification, joiningDate, subjectsSelected (bool), restricted (bool)`
- `online` / `devices` (demo mein tha) **ab nahi**, Status column hata diya gaya hai.

### Subject
`id, departmentId, semester, name, creditHours, totalLectures, teacherId (null = unassigned), outlineRaw (text)`

### SyllabusTopic (Subject ki lecture plan ki line)
`id, subjectId, order (lecture number), topic, status: "pending" | "done" | "missed", doneOn (date|null), note, homework`
- Diary submit par tick kiye hue topics `done` hote hain, tracker wahi data dikhata hai.
- `missed` sirf purane records ke liye rakha hai, naya missed banane ka button nahi hai.

### TimetableEntry
`id, teacherId, subjectId, day (0=Mon..4=Fri), slot (lecture number), pinned (bool)`
- Time slot ka asli waqt `TimingRule` se nikalta hai.

### TimingRule
`id, scope: "always" | "day" | "week" | "month", from (date), to (date), lecturesPerDay, slots: [{start, end}]`
- Priority: day > week > month > always.

### DiaryEntry
`id, teacherId, subjectId, date, text, homework, topicIds: []`
- `topicIds` khali ho sakta hai (quiz, practice, revision wale din). Phir koi topic done nahi hota.
- Diary khali text ke saath submit nahi hogi (server par bhi check).

### AttendanceRecord
`id, teacherId, subjectId, date, present, absent, leave, absentStudentIds[], leaveStudentIds[]`
- Demo mein 12 naam hardcoded hain, real project mein attendance **Student** table se student-wise hogi (neeche Student entity).

### Student (tay ho chuka)
`id, name, rollNo, departmentId, semester`
- Admin students ko **dono tarah** daal sakta hai: (1) ek ek karke form se, (2) Excel/CSV file upload karke (columns: name, rollNo, department, semester).
- Upload mein galat ya dohri rows ki list dikhani hai (jaise same rollNo), baqi rows save hon.

### Semester (tay ho chuka)
`id, name (e.g. "Fall 2026"), startDate, endDate, active (bool)`
- Start aur end dates **admin set karega**.
- Lecture dates, syllabus ka progress aur reports isi ki dates se nikalenge. Aik waqt mein ek hi semester `active` ho.

### PasswordReset (tay ho chuka)
`id, teacherId, tokenHash, expiresAt, usedAt`
- **Email se:** teacher "Forgot password" dabaye, email par link jaye (limit wala, aik baar chalne wala), naya password rakhe.
- **Admin se:** admin teacher ka temporary password set kar sakta hai, aur teacher ko pehle login par naya password rakhna parega.

### Request
`id, teacherId, type: "Leave" | "Class resource" | "Timetable change" | "Student leave issue", text, status: "Pending" | "Approved" | "Rejected", createdAt, decidedAt`

### Announcement
`id, title, body, audience ("All" | departmentId), type ("General","Urgent","Holiday","Exam","Meeting"), translations: { English: {title, body}, Urdu: {...}, "Roman Urdu": {...} }, createdAt`

### Notification (teacher ya admin ke liye personal message)
`id, toTeacherId | "admin", message, createdAt, read (bool)`
- Teacher ko ab ye Announcements page par "For you" mein dikhte hain.

## API (frontend sirf `js/core/api.js` ke functions se bat karega)

| Function | Kaun | Kaam |
|---|---|---|
| `login(email, password)` | dono | token + role |
| `logout()` | dono | |
| `me()` | dono | current user |
| `getMySubjects()` / `selectSubjects(ids)` | teacher | |
| `getMyTimetable(date)` | teacher | |
| `getMySyllabus(subjectId)` | teacher | topics + status |
| `submitDiary({subjectId, topicIds, text, homework})` | teacher | server khud topics done kare |
| `getMyDiary(subjectId)` | teacher | history |
| `saveAttendance({subjectId, date, absentIds, leaveIds})` | teacher | |
| `getMyRequests()` / `createRequest(type, text)` | teacher | |
| `getAnnouncements()` / `getMyNotifications()` | teacher | |
| `getMyReport()` | teacher | |
| `requestPasswordReset(email)` / `resetPassword(token, newPassword)` | dono | email wala raasta |
| `adminResetPassword(teacherId, tempPassword)` | admin | |
| `listStudents(filter)` / `createStudent(data)` / `importStudents(file)` | admin | import galat rows ki list wapas kare |
| `getActiveSemester()` / `saveSemester(data)` | admin | |
| `listTeachers()` / `createTeacher(data)` / `setTeacherRestricted(id, bool)` | admin | |
| `listSubjects(filter)` / `saveSubject(data)` / `deleteSubject(id)` / `assignSubject(subjectId, teacherId)` | admin | |
| `generateLecturePlan(outline, lectures)` | admin | AI |
| `getTimetable(filter)` / `updateTimetableEntry(id, data)` | admin | conflict server check kare |
| `listTimingRules()` / `saveTimingRule(data)` / `deleteTimingRule(id)` | admin | |
| `getLiveClasses(filter)` | admin | |
| `listRequests()` / `decideRequest(id, status)` | admin | |
| `generateAnnouncement(brief, langs)` / `sendAnnouncement(data)` | admin | AI |
| `getTeacherReport(teacherId)` / `getAllReports()` | admin | |
| `getTeacherDashboard(teacherId)` | admin | wohi teacher wale data, kisi aur teacher ka |

## Logic jo demo mein frontend mein hai, real project mein **backend** mein jayegi
1. Diary submit par topic `done` karna.
2. Timetable banana aur conflict check (`js/core/scheduler.js`).
3. Timing rules ki priority (`js/core/timing.js`).
4. Permissions: kaun kya dekh/badal sakta hai, restricted teacher ka login band.
5. AI se lecture plan aur announcement (API key frontend mein kabhi nahi).
6. Report ke figures (syllabus %, attendance %).

## Tay ho chuke faisle
- Students: admin ek ek karke bhi daal sakta hai aur file upload se bhi.
- Password reset: email se bhi, aur admin se bhi.
- Semester ki start aur end dates admin rakhega.

## Abhi ke sawal
- Email bhejne ke liye kaunsa service use hogi (university ka SMTP ya koi aur)?
- Kya teacher apni email khud badal sakta hai, ya sirf admin?
- Ek teacher ke ek se zyada semester ek saath active ho sakte hain (jaise Fall aur Spring ke subjects)?
