export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`SELECT r.id, r.job_number, c.full_name AS customer_name, r.printer_brand, r.printer_model, r.serial_number, r.problem_reported, r.diagnosis, r.repair_notes, r.status, r.estimated_cost, r.final_cost, r.date_received, r.date_completed
    FROM repair_jobs r JOIN customers c ON c.id = r.customer_id ORDER BY r.id DESC`).all();
  return Response.json(results);
}
export async function onRequestPost({ request, env }) {
  const d = await request.json();
  if (!d.customer_id || !d.printer_brand?.trim() || !d.problem_reported?.trim()) return Response.json({error:"Customer, printer brand and reported problem are required."},{status:400});
  const jobNumber = "EOP-" + Date.now().toString().slice(-9);
  try {
    const result = await env.DB.prepare(`INSERT INTO repair_jobs (job_number, customer_id, printer_brand, printer_model, serial_number, problem_reported, diagnosis, repair_notes, status, estimated_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(jobNumber, Number(d.customer_id), d.printer_brand.trim(), d.printer_model||null, d.serial_number||null, d.problem_reported.trim(), d.diagnosis||null, d.repair_notes||null, d.status||"Received", Number(d.estimated_cost||0)).run();
    return Response.json({id:result.meta.last_row_id,job_number:jobNumber},{status:201});
  } catch(e) { return Response.json({error:e.message},{status:400}); }
}