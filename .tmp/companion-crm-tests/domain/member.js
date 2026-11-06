"use strict";
// A Dojang member as the CRM shows it (Member 360). Ported from Companion 1cab554b
// src/domain/member.ts. Not the same as types/members.ts, which is the gym template's
// own sample member.
//
// Two sources fill it (src/integrations/member.ts): the development fixture, and
// the real Hub (Odoo "context" and "member_details"). Fields the Hub doesn't send
// are optional and stay empty for real members; screens show "Not recorded".
Object.defineProperty(exports, "__esModule", { value: true });
