# Git Workflow

## Main Rule

Do not push directly to `main`.

## Starting a Task

```bash
git checkout main
git pull
git checkout -b feature/task-name
```

## Saving Your Work

```bash
git add .
git commit -m "Describe your changes"
```

## Uploading Your Work

```bash
git push -u origin feature/task-name
```

## Finishing a Task

After pushing go to GitHub and create a Pull Request from your feature branch into `main`.

## Example

```bash
git checkout main
git pull
git checkout -b feature/login-page
git add .
git commit -m "added login page"
git push -u origin feature/login-page
```
