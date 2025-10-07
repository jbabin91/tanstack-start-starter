# DB Patterns

## 💡 DB Design Pro-tip: Soft Deletes

Soft deletes: instead of removing a row, you mark it as deleted (e.g. deleted_at TIMESTAMP).
Great for undo, audit trails & not breaking FKs.

But! If you query the base table directly, half your code will forget to exclude “deleted” rows. Which will lead to wildly inconsistent behavior all over your app.

Solution: Always put a view on top that filters out deleted rows.

CREATE VIEW users_active AS
SELECT \* FROM users WHERE deleted_at IS NULL;

Developers work with the view by default, and only query the base table when they really need the deleted data. Make the “safe path” the easy path.

Drizzle view docs <https://orm.drizzle.team/docs/views#declaring-views>

---

Scott:

Even better, IMO, is to use RLS in postgres to restrict the deleted rows from being read by the default user. No need for a view in this case and you can never forget to use the correct view/table when querying.

Gwen:

Disagree that using RLS is better.
The Postgres planner treats security conditions different than normal query conditions, which can result in suboptimal plans.
I would use RLS when security is concerned, but avoid it where there are alternatives with similar DX.

Scott:

Ah, I hadn't fully considered that. Thanks for pushing back with your reasoning. I do wonder whether actual performance difference in negligible in such a simple RLS check like soft-delete, but I haven't tested myself or used this pattern in a while.

Gwen:

Most of the time, if you have few rules, there’s really no performance difference.
Occasionally though, it will simply refuse to use a plan that you know is going to be perfect. It’s really annoying when it happens. So I prefer to just not use RLS unless it’s really needed.

---

Miki:

Been using this pattern in production and a big fan of it. One additional suggestion is to invert the naming — name the view "users" and the table "users_with_deleted" to make it very obvious that a table contains non-active data so people don't accidentally use it in code.

---

noice:

Views can help, but what really enables this design to be practical are partial indices, at least for me. Especially if one wants some constraint on live records.

Gwen:

You can (and probably should) have both:

- View for DX
- Partial index for performance
