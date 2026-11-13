# Engineers of Printers — Cloudflare Pages + D1 starter
Files are arranged for Cloudflare Pages Functions:
- `index.html` dashboard frontend
- `functions/api/customers.js` customer API
- `functions/api/jobs.js` repair jobs API

Cloudflare Pages project settings must include a D1 binding:
- Binding name: `DB`
- Database: `engineers-of-printers-db`

IMPORTANT: These API handlers assume the D1 tables have the columns from the setup we created. Customer table: full_name, phone, email, location. repair_jobs: job_number, customer_id, printer_brand, printer_model, serial_number, problem_reported, diagnosis, repair_notes, status, estimated_cost, final_cost, date_received, date_completed.
This starter only implements customer and repair job records. Invoice/payment, stock, expense and authentication features are later steps. Add authentication before using with real customer information; this current demo is not access-protected.
