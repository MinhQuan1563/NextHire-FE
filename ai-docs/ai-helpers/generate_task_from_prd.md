# Task Generator from PRD Instruction File

## Purpose
This document instructs an agent to generate a **task and subtask breakdown** from an existing PRD file:

- **Input file:** `{FEATURE_NAME}_Feature_prd.md`
- **Output file:** `{FEATURE_NAME}_Feature_tasks.md`
- **Location:** `/ai-docs/tasks`
The generated tasks must be suitable for **engineering execution**, **tracking**, and **progress monitoring**.

---

## Mandatory Workflow (Strict)

### Step 1: Verify PRD Availability
The agent must first confirm that the following file exists and is provided:

- `{FEATURE_NAME}_Feature_prd.md`

If the PRD is missing, incomplete, or unclear, the agent must:
- Ask the user to provide it, OR
- Ask clarification questions before proceeding

The agent must **not infer missing requirements**.

---

### Step 2: Understand Scope from PRD
The agent must analyze the PRD and extract:

- Feature goals and objectives
- Functional requirements
- Non-functional requirements
- User flows
- Edge cases
- Acceptance criteria
- Dependencies and risks

Tasks must map directly to PRD content.

---

### Step 3: Clarify Tasking Assumptions (If Needed)
If task granularity, team structure, or delivery expectations are unclear, the agent must ask clarifying questions such as:

- Target team (frontend, backend, mobile, infra, QA, etc.)
- Desired task granularity (high-level vs implementation-level)
- Delivery phases or milestones
- Tooling or workflow constraints

Proceed only once sufficiently clear.

---

### Step 4: Generate Task File
Once ready, generate the task breakdown file.

---

## Output Specification

### File Name
`{FEATURE_NAME}_Feature_tasks.md`

### Formatting Rules (Strict)

- Every task and subtask **must start with a checkbox**:
  - `[ ]` for not completed
  - `[x]` for completed (default is unchecked)
- Use **numeric ordered lists** for hierarchy:
  - Main tasks: `1.`, `2.`, `3.`
  - Subtasks: `1.1`, `1.2`, `1.3`
- Maintain consistent indentation
- Do not skip numbering

---

## Required Task Structure

Tasks should be grouped logically. A recommended structure is:

1. **Planning & Alignment**
2. **Design & Architecture**
3. **Implementation**
   - Frontend
   - Backend
   - API / Integration
4. **Testing & QA**
5. **Deployment & Release**
6. **Monitoring & Post-Release**

The agent may adapt this based on the PRD.

---

## Task Quality Standards

- Each task must be:
  - Actionable
  - Clearly scoped
  - Traceable to PRD requirements

- Subtasks should:
  - Represent concrete execution steps
  - Be small enough to track progress

- Avoid vague tasks such as "Do development" or "Handle backend"

---

## Example Output Format (Illustrative Only)

```
1. [ ] Requirement Validation
   1.1 [ ] Review PRD goals and scope
   1.2 [ ] Confirm acceptance criteria

2. [ ] Backend Implementation
   2.1 [ ] Design database schema
   2.2 [ ] Implement core business logic
   2.3 [ ] Expose API endpoints
```

---

## Default Behavior Rules

- Always derive tasks from the PRD
- Never invent work outside scope
- Ask questions if task breakdown is ambiguous
- Default all checkboxes to unchecked
- Ensure numbering consistency (1 → 1.1 → 1.2)

---

## Completion Criteria

The task file is considered complete when:
- All PRD requirements are represented
- Tasks are logically ordered
- Subtasks are clearly defined
- Formatting rules are fully respected

---

End of instructions.