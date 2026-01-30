I want to slightly change the system flow.

When a user starts entering details for the Booking Order, Payment Receipt, and Proforma Invoice, the process should be step-by-step on a single flow, instead of separate pages.

Numbering rules:

Order Form → Order Number should auto-increment (starting as already defined).

Payment Receipt → Receipt Number should be the same as the Order Number.

Proforma Invoice → Serial Number should start from 13000 and auto-increment.

User Input Flow:
When the user enters Customer Information such as:

Name

Address

Contact Number

Email ID

Company Information

Vehicle Details

Vehicle & Payment Details

Please compare the input fields used in:

Create Booking Order

Create Payment Receipt

Create Proforma Invoice

You will notice that many inputs are repeated across all three (for example, Contact Number appearing on multiple pages).

Requirement:

If inputs are the same across all documents, keep them only once.

Remove duplicate fields from individual sections.

Keep only inputs that are unique to a specific document.

UI / Structure Changes:

Remove separate pages for Receipt, Booking Order, and Proforma Invoice.

Create one unified page where all required details are entered once.

From this single page, automatically generate:

Booking Order

Payment Receipt

Proforma Invoice

Documents View:

Create a new “All Documents” page.

Inside this page, show separate sections for:

Receipt

Booking Order

Proforma Invoice

Each document should be accessible by name.

Database Requirement:

Create a separate table for Proforma Invoices.

Ensure all Proforma-related data is stored properly in this table.

Before implementation, please first understand and review all three existing pages:

Create Booking Order

Create Payment Receipt

Create Proforma Invoice