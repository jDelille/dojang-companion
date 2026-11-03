"""Authorized staging test setup: move session 118 to now, preserve duration.
No attendance, enrollment, trial outcome, or policy change is permitted.
"""
import json
import os
import sys
sys.path.insert(0, '/opt/odoo')
import odoo
from odoo import api, fields, SUPERUSER_ID
from odoo.modules.registry import Registry

odoo.tools.config.parse_config(['-c', '/etc/odoo/odoo.conf'])
odoo.tools.config['db_host'] = 'postgres'
odoo.tools.config['db_user'] = 'odoo'
odoo.tools.config['db_password'] = os.environ['DB_PASSWORD']

with Registry('dojang_demo_staging').cursor() as cr:
    try:
        env = api.Environment(cr, SUPERUSER_ID, dict(tracking_disable=True, mail_create_nosubscribe=True, mail_notrack=True))
        site = env['dojo.hub.site'].browse(1).exists()
        session = env['dojo.class.session'].browse(118).exists()
        trial = env['dojo.hub.trial'].browse(1).exists()
        if (not site or not session or not trial or session.template_id.id != 1
                or session.template_id.name != 'Demo session' or session.state != 'open'
                or session.company_id != site.company_id or session.template_id.company_id != site.company_id
                or trial.site_id != site or trial.member_id.id != 5 or trial.member_id.name != 'John Smith'
                or trial.lead_id.id != 1 or trial.session_id != session or trial.enrollment_id.id != 74
                or trial.state != 'reserved'):
            raise RuntimeError('Expected staging demo identity/state changed; no change')
        cr.execute('SELECT id FROM dojo_class_session WHERE id=118 FOR UPDATE NOWAIT')
        session.invalidate_recordset()
        old_start, old_end = session.start_datetime, session.end_datetime
        duration = old_end - old_start
        if duration.total_seconds() <= 0 or duration.total_seconds() > 14400:
            raise RuntimeError('Unexpected session duration; no change')
        Log = env['dojo.attendance.log']
        Enrollment = env['dojo.class.enrollment']
        before_logs = Log.search_count([('session_id', '=', session.id)])
        before_enrollments = Enrollment.search([('session_id', '=', session.id)]).read(['member_id', 'status', 'attendance_state'])
        new_start = fields.Datetime.now()
        if old_start <= new_start:
            raise RuntimeError('Session already started; no rescheduling needed')
        session.write({'start_datetime': new_start, 'end_datetime': new_start + duration})
        if (Log.search_count([('session_id', '=', session.id)]) != before_logs
                or Enrollment.search([('session_id', '=', session.id)]).read(['member_id', 'status', 'attendance_state']) != before_enrollments
                or trial.state != 'reserved' or session.state != 'open'):
            raise RuntimeError('Unexpected attendance/registration/state change; rolled back')
        window = env['dojo.hub.service']._trial_row(trial)['session']['canRecordOutcome']
        if window is not True:
            raise RuntimeError('Attendance window did not open; rolled back')
        cr.commit()
        print(json.dumps({'state': 'demo_session_rescheduled', 'sessionId': '118',
            'previousStartUtc': str(old_start), 'previousEndUtc': str(old_end),
            'newStartUtc': str(new_start), 'newEndUtc': str(session.end_datetime),
            'durationMinutes': duration.total_seconds() / 60, 'canRecordOutcome': window,
            'attendanceRecorded': False, 'enrollmentsChanged': False}))
    except Exception:
        cr.rollback()
        raise
