

# Assign Admin Role to Your Account

Your account `kushalsinghwork.iitd@gmail.com` currently has the `submitter` role. The User Management page requires the `admin` role.

## Change
Run a single database migration to update your role from `submitter` to `admin`:

```sql
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'kushalsinghwork.iitd@gmail.com')
```

After this, log out and log back in (or refresh) to pick up the new role. The sidebar will then show the **Admin** group with User Management and Settings.

## Files
No code changes needed — database-only update.

