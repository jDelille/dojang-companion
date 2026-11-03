"""User-authorized staging change: add member 5 to course 1; no bookings."""
import json
import os
import sys
sys.path.insert(0, '/opt/odoo')
import odoo
from odoo import api
from odoo.modules.registry import Registry

odoo.tools.config.parse_config(['-c', '/etc/odoo/odoo.conf'])
odoo.tools.config['db_host'] = 'postgres'
odoo.tools.config['db_user'] = 'odoo'
odoo.tools.config['db_password'] = os.environ['DB_PASSWORD']
database = 'dojang_demo_staging'
with Registry(database).cursor() as cr:
    try:
        env = api.Environment(cr, 5, {})
        site = env['dojo.hub.site'].sudo().browse(1).exists()
        member = env['dojo.member'].sudo().browse(5).exists()
        course = env['dojo.class.template'].sudo().browse(1).exists()
        if not site or not member or not course:
            raise RuntimeError('Expected records unavailable; no change')
        if (member.name != 'John Smith' or course.name != 'Demo session'
                or not member.active or not course.active
                or member.company_id != site.company_id or course.company_id != site.company_id
                or course.auto_enroll_members):
            raise RuntimeError('Identity, scope or auto-enrollment precondition changed; no change')
        service = env['dojo.hub.service']
        if member in course.course_member_ids:
            print(json.dumps({'state': 'already_on_roster', 'memberId': '5', 'templateId': '1'}))
            cr.rollback()
        else:
            before = env['dojo.class.enrollment'].sudo().search_count([('member_id', '=', member.id)])
            plan = service._dispatch('1', 'course_assignment_preview', {'templateId': '1', 'addMemberIds': ['5'], 'removeMemberIds': []})
            if (plan.get('valid') is not True or plan.get('autoEnroll') is not False
                    or not plan.get('reviewToken') or plan.get('capacityConflicts')
                    or any(row.get('futureBookings') != 0 for row in plan.get('add', []))):
                raise RuntimeError('Roster-only review was not approved; no change. Code: ' + str(plan.get('error', {}).get('code', 'REVIEW_REQUIRED')))
            result = service._dispatch('1', 'assign_course_members', {
                'templateId': '1', 'expectedVersion': plan['version'], 'addMemberIds': ['5'], 'removeMemberIds': [],
                'reason': 'User approved adding John Smith to Demo course roster only for trial-booking testing.',
                'reviewToken': plan['reviewToken']}, 'codex-roster-john5-demo1-20261103')
            if result.get('state') != 'course_roster_updated':
                raise RuntimeError('Assignment rejected; no change. Code: ' + str(result.get('error', {}).get('code', 'UNKNOWN')))
            after = env['dojo.class.enrollment'].sudo().search_count([('member_id', '=', member.id)])
            course.invalidate_recordset()
            if (result.get('added') != ['5'] or result.get('removed') != []
                    or result.get('bookingsCreated') != 0 or result.get('bookingsCancelled') != 0
                    or before != after or member not in course.course_member_ids):
                raise RuntimeError('Roster-only verification failed; rolled back')
            cr.commit()
            print(json.dumps({'state': result['state'], 'memberId': '5', 'templateId': '1',
                'bookingsCreated': 0, 'bookingsCancelled': 0, 'replayed': result.get('replayed', False)}))
    except Exception:
        cr.rollback()
        raise
