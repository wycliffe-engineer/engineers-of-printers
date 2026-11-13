export async function onRequestGet({ env }) {
  try {
    const result = await env.DB.prepare(`
      SELECT
        invoices.id,
        invoices.invoice_number,
        invoices.job_id,
        invoices.amount,
        invoices.amount_paid,
        invoices.status,
        invoices.invoice_date,
        repair_jobs.job_number,
        repair_jobs.printer_brand,
        repair_jobs.printer_model,
        customers.full_name,
        customers.phone
      FROM invoices
      JOIN repair_jobs ON invoices.job_id = repair_jobs.id
      JOIN customers ON repair_jobs.customer_id = customers.id
      ORDER BY invoices.id DESC
    `).all();

    return Response.json(result.results);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    if (!data.job_id || data.amount < 0) {
      return Response.json(
        { error: "Valid job ID and amount are required." },
        { status: 400 }
      );
    }

    const invoiceNumber =
      "INV-" + Date.now();

    await env.DB.prepare(`
      INSERT INTO invoices (
        invoice_number,
        job_id,
        amount,
        amount_paid,
        status
      )
      VALUES (?, ?, ?, 0, 'Unpaid')
    `).bind(
      invoiceNumber,
      data.job_id,
      data.amount
    ).run();

    return Response.json({
      success: true,
      invoice_number: invoiceNumber,
      message: "Invoice created successfully."
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
