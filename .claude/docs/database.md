# Database

Not applicable here: the brief forbids a database, so there is no persistent store, schema, migration or backup.

---

All live state (new posts, chat history) is held in process memory in plain TypeScript collections. Consequences that matter when changing code:

- A restart or crash empties everything; this is by requirement, not a defect to fix.
- The collections are shared by every connection to the one running process, so any growth is unbounded unless a limit is added. No limit has been decided; adding one is a decision for the user.
- Only a single instance is supported: a second instance would hold its own separate history and miss the first one's broadcasts.
