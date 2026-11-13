export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT
      payments.id,
      payments.invoice_id,
      payments.amount,
      payments.payment_method,
      payments.payment_date,
      invoices.invoice_number,
      customers.full_name AS customer_name
    FROM payments
    JOIN invoices ON payments.invoice_id = invoices.id
    JOIN repair_jobs ON invoices.job_id = repair_jobs.id
    JOIN customers ON repair_jobs.customer_id = customers.id
    ORDER BY payments.payment_date DESC
  `).all();

  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    if (!data.invoice_id || !data.amount || !data.payment_method) {
      return Response.json(
        { error: "Invoice, amount and payment method are required." },
        { status: 400 }
      );
    }

    const invoice = await env.DB.prepare(`
      SELECT id, amount, amount_paid
      FROM invoices
      WHERE id = ?
    `).bind(data.invoice_id).first();

    if (!invoice) {
      return Response.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const paymentAmount = Number(data.amount);
    const balance = Number(invoice.amount) - Number(invoice.amount_paid);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return Response.json(
        { error: "Enter a valid payment amount." },
        { status: 400 }
      );
    }

    if (paymentAmount > balance) {
      return Response.json(
        { error: "Payment cannot exceed the outstanding balance." },
        { status: 400 }
      );
    }

    const paymentDate = new Date().toISOString().split("T")[0];

    await env.DB.prepare(`
      INSERT INTO payments
      (invoice_id, amount, payment_method, payment_date)
      VALUES (?, ?, ?, ?)
    `).bind(
      data.invoice_id,
      paymentAmount,
      data.payment_method,
      paymentDate
    ).run();

    const newAmountPaid = Number(invoice.amount_paid) + paymentAmount;
    const newStatus =
      newAmountPaid >= Number(invoice.amount) ? "Paid" : "Partial";

    await env.DB.prepare(`
      UPDATE invoices
      SET amount_paid = ?, status = ?
      WHERE id = ?
    `).bind(
      newAmountPaid,
      newStatus,
      data.invoice_id
    ).run();

    return Response.json({
      success: true,
      message: "Payment recorded successfully."
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
