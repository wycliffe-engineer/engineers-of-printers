export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT id, full_name, phone, email, location, created_at FROM customers ORDER BY id DESC").all();
  return Response.json(results);
}
export async function onRequestPost({ request, env }) {
  const d = await request.json();
  if (!d.full_name?.trim() || !d.phone?.trim()) return Response.json({error:"Customer name and phone are required."},{status:400});
  try {
    const result = await env.DB.prepare("INSERT INTO customers (full_name, phone, email, location) VALUES (?, ?, ?, ?)")
      .bind(d.full_name.trim(), d.phone.trim(), d.email || null, d.location || null).run();
    return Response.json({id:result.meta.last_row_id, message:"Customer saved"}, {status:201});
  } catch (e) { return Response.json({error:e.message.includes("UNIQUE")?"This customer phone may already be registered.":e.message},{status:400}); }
}