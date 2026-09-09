/*
  English is the source dictionary: every other locale is typed against it, so
  a key added here fails the build in the other ten until it is translated,
  rather than silently rendering blank in half the product.

  Copy rules for anyone editing this file:
  - Say what the reader should do, not what the system stores. "Call them back"
    beats "Pending outbound contact".
  - No CRM jargon. A receptionist should not have to learn what "converted",
    "lead" or "pipeline" mean in order to use the enquiry list.
  - `{placeholders}` are filled by `fill()` in ../format and must survive
    translation with the same names.
*/
export const en = {
  common: {
    optional: "optional",
    save: "Save",
    saving: "Saving…",
    previous: "Previous",
    next: "Next",
    notSet: "Not set",
    none: "—",
  },

  app: {
    name: "Academy OS",
  },

  nav: {
    dashboard: "Dashboard",
    enquiries: "Enquiries",
    students: "Students",
    parents: "Parents",
    courses: "Courses",
    batches: "Batches",
    teachers: "Teachers",
    attendance: "Attendance",
    fees: "Fees",
    events: "Events",
    exams: "Exams",
    documents: "Documents",
    settings: "Settings",
    soon: "Soon",
    comingSoon: "{label} — coming soon",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    search: "Search",
    notifications: "Notifications",
  },

  languageSwitcher: {
    label: "Language",
    change: "Change language",
  },

  enquiries: {
    title: "Enquiries",
    subtitle: "Everyone who has asked about joining — and who to call next.",
    tabs: {
      all: "All enquiries",
      followUps: "To call",
    },
    newEnquiry: "New enquiry",
    backToList: "Back to enquiries",
    search: {
      placeholder: "Search by name or phone…",
      label: "Search enquiries",
    },

    /*
      The strip at the top of the list. It answers "what do I do this morning?"
      before the reader has to interpret a single row.
    */
    attention: {
      heading: "Needs attention",
      overdue: "Overdue",
      overdueHint: "The call-back date has already passed",
      dueToday: "Due today",
      dueTodayHint: "Promised a call back today",
      uncontacted: "Not called yet",
      uncontactedHint: "Came in, nobody has spoken to them",
      allClear: "Nothing overdue, and nobody is waiting on a call.",
    },

    filters: {
      label: "Filter by status",
      all: "All",
    },

    status: {
      NEW: "New",
      CONTACTED: "Contacted",
      INTERESTED: "Interested",
      FOLLOW_UP: "Call back",
      ADMITTED: "Joined",
      LOST: "Not joining",
    },
    /* Shown as the filter chip's tooltip — the status names alone are not enough. */
    statusHint: {
      NEW: "Just came in. Nobody has called yet.",
      CONTACTED: "We have spoken to them once.",
      INTERESTED: "They want to join. Details still to settle.",
      FOLLOW_UP: "We agreed to call back on a set date.",
      ADMITTED: "Joined the academy — now a student.",
      LOST: "Decided not to join.",
    },

    columns: {
      name: "Name",
      phone: "Phone",
      interestedIn: "Wants to learn",
      status: "Status",
      followUp: "Call back",
      added: "Enquired",
      actions: "Actions",
    },

    followUp: {
      none: "No date set",
      overdue: "Overdue",
      overdueOn: "Was due {date}",
      today: "Today",
      tomorrow: "Tomorrow",
      on: "{date}",
    },

    row: {
      call: "Call",
      whatsapp: "WhatsApp",
      callAria: "Call {name} on {phone}",
      whatsappAria: "Message {name} on WhatsApp",
      openAria: "Open the enquiry from {name}",
    },

    empty: {
      none: "No enquiries yet.",
      noneHint:
        "The moment someone asks about classes, add them here — it takes about ten seconds.",
      addFirst: "Add your first enquiry",
      noMatch: "Nothing matches that search.",
      noMatchHint: "Try part of a name, or the last few digits of a phone number.",
      clearFilters: "Clear filters",
    },

    pagination: {
      page: "Page {page} of {pages}",
      countOne: "{count} enquiry",
      countOther: "{count} enquiries",
    },

    capture: {
      title: "New enquiry",
      description: "Phone and name are enough. Everything else is asked at admission.",
      phone: "Phone",
      phonePlaceholder: "98765 43210",
      studentName: "Student name",
      studentNamePlaceholder: "Kavya Sharma",
      interestedIn: "Wants to learn",
      interestedInPlaceholder: "Keyboard, weekend batch",
      course: "Course",
      coursePlaceholder: "Not sure yet",
      note: "Note",
      notePlaceholder: "Walk-in, asked about fees",
      save: "Save",
      saveAndAnother: "Save and add another",
      saved: "Saved {name}. Add the next one.",
      duplicateEnquiry: "{name} enquired {when}",
      duplicateEnquiryWithStatus: "{name} enquired {when} — {status}",
      duplicateParent: "{name} is already on file as a parent",
      openExisting: "Open the existing enquiry",
      today: "today",
      yesterday: "yesterday",
      daysAgo: "{count} days ago",
    },

    detail: {
      receivedOn: "Enquired on {date}",
      joinedAs: "Joined as {name}.",
      openStudent: "Open student record",
      convert: "Admit as student",
      details: "Their details",
      phone: "Phone",
      email: "Email",
      parent: "Parent / guardian",
      interestedIn: "Wants to learn",
      course: "Course",
      experience: "Experience",
      lastUpdated: "Last updated",
      update: "Update this enquiry",
      status: "Where it stands",
      statusFixed: "Locked — this enquiry has already become a student.",
      followUpDate: "Call back on",
      followUpHint: "Leave this empty if no call back is needed.",
      note: "What happened?",
      notePlaceholder: "What was discussed, and what happens next.",
      noteHint: "Added to the history below. Nothing already written is replaced.",
      saveChanges: "Save changes",
      updated: "Enquiry updated.",
      history: "History",
      noHistory: "Nothing recorded yet. Add a note above after your first call.",
      notRecorded: "Not recorded yet: {fields}",
    },

    experience: {
      NONE: "Never learnt before",
      BEGINNER: "Beginner",
      INTERMEDIATE: "Intermediate",
      ADVANCED: "Advanced",
    },

    convert: {
      back: "Back to the enquiry",
      title: "Admit {name}",
      subtitle: "This creates the student and parent records, and marks the enquiry as joined.",
      studentSection: "Student",
      firstName: "First name",
      lastName: "Last name",
      dateOfBirth: "Date of birth",
      experience: "Experience",
      studentPhone: "Student phone",
      studentEmail: "Student email",
      address: "Address",
      parentSection: "Parent / guardian",
      parentHint:
        "Matched on phone — an existing parent with this number is reused, not duplicated.",
      parentName: "Name",
      parentPhone: "Phone",
      parentEmail: "Email",
      enrolmentSection: "Enrolment",
      batch: "Batch",
      batchPlaceholder: "No batch yet",
      noBatches:
        "No batches exist yet, so the student is admitted without one. They can be enrolled once Batches is built.",
      registrationFee: "Registration fee (₹)",
      submit: "Admit as student",
      submitting: "Admitting…",
    },
  },

  followUps: {
    title: "To call",
    subtitle: "Everyone you promised to call back today or earlier.",
    overdue: "Overdue",
    today: "Today",
    empty: "Nobody to call right now.",
    emptyHint: "Enquiries appear here on the day their call back is due.",
  },

  errors: {
    checkForm: "Please check the form and try again.",
    tooLong: "That is too long",
    phoneInvalid: "Enter a 10-digit mobile number",
    studentNameRequired: "Student name is required",
    firstNameRequired: "First name is required",
    parentNameRequired: "Parent name is required",
    dateInvalid: "Enter a valid date",
    emailInvalid: "Enter a valid email address",
    feeInvalid: "Enter a fee amount of zero or more",
    courseGone: "That course no longer exists.",
    batchGone: "That batch no longer exists.",
    enquiryNotFound: "Enquiry not found.",
    alreadyConverted: "This enquiry has already become a student.",
    saveFailed: "Could not save the enquiry. Check your connection and try again.",
    convertFailed: "Could not complete the admission. Nothing was saved — try again.",
  },
};

/*
  Widens literal types to `string` so a translation is not forced to repeat the
  English wording character for character in order to typecheck.
*/
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

export type Dictionary = Widen<typeof en>;
