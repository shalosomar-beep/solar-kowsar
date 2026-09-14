import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Role-based backend check: only the authorized Admin may manage employees.
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const admin = base44.asServiceRole;

    const log = async (actionType, targetEmail, details) => {
      await admin.entities.AuditLog.create({
        action: actionType,
        performed_by_email: user.email,
        performed_by_name: user.full_name || user.email,
        target_email: targetEmail || '',
        details: details || '',
        timestamp: new Date().toISOString()
      });
    };

    let result;
    switch (action) {
      case 'create': {
        const emp = body.employee;
        if (!emp || !emp.email || !emp.role) {
          return Response.json({ error: 'Missing employee fields' }, { status: 400 });
        }
        const existing = await admin.entities.Employee.filter({ email: emp.email });
        if (existing && existing.length > 0) {
          return Response.json({ error: 'Employee already exists' }, { status: 409 });
        }
        const profile = {
          email: emp.email,
          full_name: emp.full_name || '',
          role: emp.role,
          status: emp.status || 'active',
          phone: emp.phone || '',
          department: emp.department || '',
          hired_date: emp.hired_date || '',
          notes: emp.notes || ''
        };
        result = await admin.entities.Employee.create(profile);
        await log('employee_created', emp.email, 'Role: ' + emp.role);
        break;
      }
      case 'update': {
        if (!body.employeeId) {
          return Response.json({ error: 'Missing employeeId' }, { status: 400 });
        }
        result = await admin.entities.Employee.update(body.employeeId, body.changes || {});
        await log('employee_updated', body.email || '', JSON.stringify(body.changes || {}));
        break;
      }
      case 'suspend': {
        result = await admin.entities.Employee.update(body.employeeId, { status: 'suspended' });
        await log('employee_suspended', body.email || '', 'Account suspended — force logout');
        break;
      }
      case 'reactivate': {
        result = await admin.entities.Employee.update(body.employeeId, { status: 'active' });
        await log('employee_reactivated', body.email || '', 'Account reactivated');
        break;
      }
      case 'deactivate': {
        result = await admin.entities.Employee.update(body.employeeId, { status: 'deactivated' });
        await log('employee_deactivated', body.email || '', 'Access disabled');
        break;
      }
      case 'audit': {
        await log(body.auditAction || 'admin_action', body.email || '', body.details || '');
        result = { logged: true };
        break;
      }
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}