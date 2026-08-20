@AGENTS.md

## Data model invariants

- `Payment.studentId` and `Payment.enquiryId` are both optional, but exactly
  one of them must be set on any given row (registration payments are taken
  at the enquiry stage, before a `Student` exists; later payments attach to
  the `Student`). Prisma cannot express this as a schema constraint — enforce
  it in the Zod schema wherever payment creation is implemented.
