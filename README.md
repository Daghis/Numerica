# Numerica

This repository contains the source for the Numerica puzzle application.

## Continuous Integration

Pull requests trigger the **Test** workflow defined in `.github/workflows/test.yml`.
The workflow installs dependencies and runs `npm test` in the `numerica-puzzle`
directory. Configure branch protection on `main` to require this workflow to pass
before merging.
