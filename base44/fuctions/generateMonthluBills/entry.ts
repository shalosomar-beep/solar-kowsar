import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden - admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));

    // Determine billing month: use provided or default to previous month
    let billingMonth = body.billing_month;
    if (!billingMonth) {
      const d = new Date();
      d.setDate(0); // last day of previous month
      billingMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    const [year, month] = billingMonth.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    // Fetch all usage records and filter by date range
    const allUsage = await base44.entities.DailyUsage.list('-created_date', 2000);
    const monthUsage = allUsage.filter(u => {
      if (!u.usage_date) return false;
      return u.usage_date >= startDate && u.usage_date < endDate;
    });

    if (monthUsage.length === 0) {
      return Response.json({
        success: true,
        billing_month: billingMonth,
        message: 'No usage data found for this month',
        created: 0,
        skipped: 0,
      });
    }

    // Aggregate kWh by customer
    const byCustomer = {};
    for (const u of monthUsage) {
      if (!u.customer) continue;
      if (!byCustomer[u.customer]) {
        byCustomer[u.customer] = { customer: u.customer, kwh: 0, readings: 0 };
      }
      byCustomer[u.customer].kwh += Number(u.kwh_used || 0);
      byCustomer[u.customer].readings += 1;
    }

    // Get rate: prefer default active Tariff, else Settings rate_per_kwh, else 0.15
    let rate = 0.15;
    try {
      const tariffs = await base44.entities.Tariff.list();
      const def = tariffs.find(t => t.is_default && t.status === 'active')
               || tariffs.find(t => t.status === 'active');
      if (def && def.rate_per_kwh) rate = Number(def.rate_per_kwh);
    } catch (e) {}
    try {
      const settings = await base44.entities.Settings.list();
      if (settings.length > 0 && settings[0].rate_per_kwh) rate = Number(settings[0].rate_per_kwh);
    } catch (e) {}

    // Check existing bills for this month to avoid duplicates
    const existingBills = await base44.entities.Billing.list('-created_date', 2000);
    const existingSet = new Set(
      existingBills.filter(b => b.billing_month === billingMonth).map(b => b.customer)
    );

    // Fetch customers for names
    const customers = await base44.entities.Customer.list();
    const custMap = {};
    for (const c of customers) custMap[c.id] = c;

    const billsToCreate = [];
    const notifsToCreate = [];
    const customerIds = Object.keys(byCustomer);
    let skipped = 0;

    for (const custId of customerIds) {
      if (existingSet.has(custId)) { skipped++; continue; }
      const agg = byCustomer[custId];
      const total = Number((agg.kwh * rate).toFixed(2));
      const custName = custMap[custId]?.full_name || 'Macmiil';
      billsToCreate.push({
        customer: custId,
        billing_month: billingMonth,
        kwh_used: Number(agg.kwh.toFixed(2)),
        rate_per_kwh: rate,
        total_amount: total,
        status: 'pending',
        notes: `Otomaatig: ${agg.readings} qirad(h)ood`,
      });
      notifsToCreate.push({
        title: `Biil Bisha ${billingMonth}`,
        message: `Biil cusub bisha ${billingMonth}: ${agg.kwh.toFixed(2)} kWh × $${rate} = $${total} — ${custName}`,
        type: 'billing',
        customer: custId,
        is_read: false,
      });
    }

    let createdBills = [];
    if (billsToCreate.length > 0) {
      createdBills = await base44.entities.Billing.bulkCreate(billsToCreate);
    }
    if (notifsToCreate.length > 0) {
      await base44.entities.Notification.bulkCreate(notifsToCreate);
    }

    return Response.json({
      success: true,
      billing_month: billingMonth,
      customers_with_usage: customerIds.length,
      bills_created: billsToCreate.length,
      bills_skipped: skipped,
      rate_per_kwh: rate,
      total_amount: billsToCreate.reduce((s, b) => s + b.total_amount, 0),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}