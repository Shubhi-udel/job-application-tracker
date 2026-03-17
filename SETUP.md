# Job Application Tracker – Setup

## Fix: "Record not found: app-user-magic-code"

1. **Enable Magic Code** in the InstantDB dashboard (if not already):
   - Open **[InstantDB Dashboard](https://instantdb.com/dash)** and sign in.
   - Select your app (App ID `ece4f71e-3213-4f6e-a41e-cc7ce4f9fbde`).
   - Go to **Auth** and enable **Magic Code** (email). Save.

2. **Push permissions** so the auth entity is allowed (required after cloning or if the error persists):
   ```bash
   npx instant-cli@latest push perms
   ```

3. **Use the same email format** when sending and verifying the code (the app now normalizes to lowercase).

4. **Enter the 6-digit code** from the email with no spaces or extra characters.

If the error still appears, request a **new code** (click “Use a different email” then enter your email again) and enter the new code within a few minutes.

## Push schema and permissions (first-time or after changes)

From the project root:

```bash
npx instant-cli@latest push schema
npx instant-cli@latest push perms
```

## Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
