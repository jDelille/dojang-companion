"""Read-only staging diagnostic; pipe to Python inside the Odoo container.

No credentials, login identifiers, or member contact details are printed.
No business action or record update is executed.
"""
import json
import os
import psycopg2

connection = psycopg2.connect(host="postgres", dbname="dojang_demo_staging", user="odoo", password=os.environ["DB_PASSWORD"])
connection.set_session(readonly=True, autocommit=False)
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, company_id FROM dojo_hub_site WHERE id = 1 AND active")
        site = cursor.fetchone()
        print(json.dumps({"site": site}))
        if site:
            cursor.execute("""
                SELECT g.user_id, g.role, u.active, p.name, u.company_id, u.share
                FROM dojo_hub_grant g JOIN res_users u ON u.id=g.user_id
                JOIN res_partner p ON p.id=u.partner_id
                WHERE g.site_id=%s AND g.active AND g.role IN ('owner', 'manager') ORDER BY g.user_id
            """, (site[0],))
            print(json.dumps({"site_grants": cursor.fetchall()}))
            cursor.execute("""
                SELECT id, company_id, user_id FROM crm_lead
                WHERE name = %s AND company_id = %s ORDER BY id DESC LIMIT 5
            """, ("New lead", site[1]))
            print(json.dumps({"matching_lead_ownership": cursor.fetchall()}))
finally:
    connection.rollback()
    connection.close()
