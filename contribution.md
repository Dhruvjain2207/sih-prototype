# 🤝 Contributing

## How to Contribute

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a New Branch

**Do not make changes directly to `main`.**

Create a branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b feature/login
git checkout -b feature/dashboard
git checkout -b fix/navbar
```

### 4. Make Your Changes

Develop your feature, fix the issue, or improve the project.

After making changes, test everything locally:

```bash
npm run dev
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature"
```

Keep commit messages short and meaningful.

Examples:

```text
feat: add authentication
fix: resolve dashboard issue
ui: improve login page
```

### 6. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Go to the GitHub repository and:

1. Open the **Pull Requests** tab.
2. Click **New Pull Request**.
3. Select your branch as the **compare branch**.
4. Set `main` as the **base branch**.
5. Add a short description of your changes.
6. Create the Pull Request.

### 8. Review & Merge

The team will review the Pull Request.

After approval, the changes can be merged into `main`.

---

## 🔄 Quick Workflow

```text
Clone Repository
       ↓
Create New Branch
       ↓
Make Changes
       ↓
Test Locally
       ↓
Commit Changes
       ↓
Push Branch
       ↓
Create Pull Request
       ↓
Review
       ↓
Merge into main
```

> **Important:** Never push directly to `main`. Always work through a separate branch and Pull Request.
