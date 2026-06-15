# START HERE (plain English)

This is for the **non-technical** person who owns this product. No code knowledge needed.

## What this is

One folder (`family-vault`) that turns a computer into a **private AI for a family**.
- The family's stuff stays **on their own computer**. Nothing goes to the internet.
- They open it on their phone or computer, log in, and ask questions about their own notes.

## What you do NOT need to do

- You do **not** edit any code.
- You do **not** need to understand "files changed", GitHub, or pull requests. That's the
  developer side. Ignore it.
- You do **not** need to set anything up by hand inside the app — encryption, logins, and
  the phone app all happen automatically.

## The 3 real steps to set up ONE rig (one computer for one family)

> A "rig" is just the computer that runs it (for example, the CyberPower PC with the RTX 5090).

**1. Put the folder on the rig.**
Copy the `family-vault` folder onto the rig. (A tech person can do this once, or use the
command your developer gives you.)

**2. Run the one setup command.**
Open a terminal in that folder and run:

```
./setup.sh
```

This installs everything and gets the AI ready. You only do this once per rig.

**3. Turn it on.**

```
npm run start
```

Then open a web browser on the rig and go to: `http://localhost:3001`

You'll see a **"Create owner account"** screen. Fill it in — that's the admin (you, or the
customer). Done. The rig is now ready.

## To prepare it for a customer (hand-off)

1. Do steps 1–3 above on the rig you'll give them.
2. Optional: change the name/look — open the file called `.env` and edit `BRAND_NAME`
   (and the vault names). Save, then run `npm run start` again.
3. Hand them the rig (and a phone if you're bundling one).
4. On their phone, open the same address, then tap **"Add"** on the banner to put the app
   on their home screen. They create their owner account and they're set.

## To make the answers smarter (on a powerful rig)

Once it's running, log in as the owner → **Manage people** → **AI model** → pick a bigger
model (like `qwen2.5:7b`). Bigger = smarter, needs a stronger computer.

## If you get stuck

- This is genuinely a few technical steps the first time. It's normal to want a tech person
  to do the **one-time install** on each rig. After that, using it is easy for anyone.
- The detailed technical version of all this is in `SETUP.md` (for a developer/tech helper).

## The one-sentence version

Put the folder on a computer → run `./setup.sh` → run `npm run start` → open the browser →
create the owner. That's the whole job.
