"""Run in the staging Odoo shell only. Creates two immediately testable sessions.

Fixed external IDs make retries safe. Uses existing synthetic members/templates;
never changes subscriptions, records attendance, or sends invitations.
"""
from datetime import timedelta
import json
from odoo import fields

assert env.cr.dbname == "dojang_demo_staging", "Staging database required"
base = env(context=dict(env.context, tracking_disable=True,
    mail_create_nosubscribe=True, mail_create_nolog=True,
    no_mail_to_attendees=True, no_mail_for_attendees=True,
    mail_notify_force_send=False))
kiosk = base["dojo.kiosk.config"].browse(1).exists()
assert kiosk and kiosk.integration_enabled and kiosk.integration_tenant_ref == "dojang-demo-school"
company = kiosk.company_id
assert company.id == 1

# One fixed identity for this user-requested seed run, including on retries.
base.cr.execute("SELECT pg_advisory_xact_lock(hashtext(%s))", ["kiosk-ui-test-20261105"])
now = fields.Datetime.now()
made = []
for suffix, template_id, member_ids in [("group", 2, [1, 2, 3]), ("family", 3, [4])]:
    template = base["dojo.class.template"].browse(template_id).exists()
    members = base["dojo.member"].browse(member_ids).exists()
    assert template and template.active and template.company_id == company and template.program_id.id == 1
    assert len(members) == len(member_ids) and all(m.active and m.company_id == company and m in kiosk.integration_member_ids for m in members)
    before_states = {m.id: m.membership_state for m in members}
    marker = "ui_test_20261105_" + suffix
    session = base.ref("dojo_kiosk." + marker, raise_if_not_found=False)
    created = not bool(session)
    if session:
        assert session._name == "dojo.class.session" and session.company_id == company and session.template_id == template
    else:
        session = base["dojo.class.session"].create({
            "template_id": template.id, "company_id": company.id,
            "start_datetime": now - timedelta(minutes=5),
            "end_datetime": now + timedelta(hours=4),
            "state": "open", "capacity": 10,
        })
        base["ir.model.data"].create({"module": "dojo_kiosk", "name": marker,
            "model": "dojo.class.session", "res_id": session.id, "noupdate": True})
    for member in members:
        existing = base["dojo.class.enrollment"].search([
            ("session_id", "=", session.id), ("member_id", "=", member.id)], limit=1)
        if not existing:
            base["dojo.class.enrollment"].create({"session_id": session.id,
                "member_id": member.id, "status": "registered", "attendance_state": "pending"})
        else:
            assert existing.status == "registered", "Existing booking needs review"
    members.invalidate_recordset(["membership_state"])
    assert {m.id: m.membership_state for m in members} == before_states, "Membership state changed"
    kiosk.write({"integration_session_ids": [(4, session.id)]})
    made.append({"id": session.id, "title": template.name, "created": created,
        "startsAtUTC": str(session.start_datetime), "endsAtUTC": str(session.end_datetime),
        "students": members.mapped("name"), "capacity": session.capacity})
env.cr.commit()
print("SEEDED " + json.dumps(made))
