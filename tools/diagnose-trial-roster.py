"""Read-only staging diagnostic for John Smith's demo-class trial rejection."""
import json
import os
import psycopg2

connection = psycopg2.connect(host="postgres", dbname="dojang_demo_staging", user="odoo", password=os.environ["DB_PASSWORD"])
connection.set_session(readonly=True, autocommit=False)
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT company_id FROM dojo_hub_site WHERE id=1 AND active")
        site = cursor.fetchone()
        if not site:
            raise RuntimeError("Configured site unavailable")
        cursor.execute("""
            SELECT m.id, p.name, m.membership_state, m.active
              FROM dojo_member m JOIN res_partner p ON p.id=m.partner_id
             WHERE m.company_id=%s AND lower(btrim(p.name))=%s ORDER BY m.id LIMIT 10
        """, (site[0], "john smith"))
        students = cursor.fetchall()
        print(json.dumps({"matching_students": students}, default=str))
        for member_id, _, _, _ in students:
            cursor.execute("""
                SELECT s.id, t.id, t.name, s.start_datetime, s.state, s.capacity,
                    (SELECT count(*) FROM dojo_class_enrollment e WHERE e.session_id=s.id AND e.status='registered'),
                    (SELECT count(*) FROM dojo_class_template_member_rel r WHERE r.template_id=t.id),
                    EXISTS(SELECT 1 FROM dojo_class_template_member_rel r WHERE r.template_id=t.id AND r.member_id=%s),
                    (SELECT count(*) FROM dojo_class_enrollment e WHERE e.session_id=s.id AND e.member_id=%s AND e.status='registered')
                  FROM dojo_class_session s JOIN dojo_class_template t ON t.id=s.template_id
                 WHERE t.company_id=%s AND t.active AND s.start_datetime >= %s
                 ORDER BY s.start_datetime, s.id LIMIT 10
            """, (member_id, member_id, site[0], "2026-11-03"))
            print(json.dumps({"member_id": member_id, "session_columns": ["session_id", "course_id", "course_name", "starts_at_utc", "state", "capacity", "registered", "course_roster_count", "student_on_course_roster", "student_registered"], "sessions": cursor.fetchall()}, default=str))
            cursor.execute("""
                SELECT id, lead_id, session_id, state FROM dojo_hub_trial
                 WHERE site_id=1 AND member_id=%s ORDER BY id DESC LIMIT 10
            """, (member_id,))
            print(json.dumps({"member_id": member_id, "trial_columns": ["trial_id", "lead_id", "session_id", "state"], "trials": cursor.fetchall()}, default=str))
finally:
    connection.rollback()
    connection.close()
