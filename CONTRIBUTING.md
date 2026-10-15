# Contributing

## Development

Use the documented package-manager commands from `README.md`. Keep changes
small and focused, preserve unrelated user work, and update directly related
documentation.

## Change requirements

- Validate all external input.
- Enforce authorization in services, not only in the UI.
- Add regression tests for changed business rules.
- Do not commit secrets, `.env` files, production data, or generated
  credentials.
- Review the diff before committing.

Use Conventional Commits, for example:

```text
feat(leave): prevent overlapping requests
fix(auth): enforce organization membership
test(employee): cover unauthorized access
docs(project): update architecture
```
