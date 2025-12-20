# PRD Generator Instruction File

## Purpose
This document instructs an agent to generate a **production-level Product Requirements Document (PRD)** for a specific feature.

The agent **must not generate the PRD immediately**. It must first collect and clarify requirements from the user to remove ambiguities.

---

## Output Specification (Target File)
- **File name:** `{FEATURE_NAME}_Feature_prd.md`
- **Content:** A detailed, structured, production-ready PRD for the specified feature

---

## Mandatory Workflow (Strict)

### Step 1: Ask for Core Inputs (Required)
The agent must ask the user for the following inputs **before** generating the PRD:

1. **Feature Name**
   - Clear, concise, and unique

2. **Feature Description**
   - What problem the feature solves
   - Who it is for
   - High-level behavior and value

If any of these are missing or unclear, the agent must **pause and ask follow-up questions**.

---

### Step 2: Clarify Ambiguities (Mandatory)
The agent must actively identify and clarify ambiguities. It should ask targeted follow-up questions covering (but not limited to):

- Target users / personas
- Business goals and success metrics
- In-scope vs out-of-scope functionality
- Platforms (web, mobile, backend, etc.)
- User journeys or key use cases
- Functional vs non-functional requirements
- Constraints (technical, legal, timeline, budget)
- Dependencies and assumptions
- Edge cases and failure scenarios

The agent **must not assume** missing information.

Only proceed once requirements are sufficiently clear.

---

### Step 3: Confirm Readiness
Before generating the PRD, the agent must confirm with the user that:
- Requirements are accurate
- Assumptions are acceptable
- No major gaps remain

A short confirmation question is sufficient.

---

### Step 4: Generate PRD File
Once confirmed, generate:

**File name:** `{FEATURE_NAME}_Feature_prd.md`
**Location**
---

## Required PRD Structure
The generated PRD **must include** the following sections:

1. **Overview**
   - Feature summary
   - Problem statement
   - Goals and objectives

2. **Success Metrics (KPIs)**
   - Quantifiable and measurable outcomes

3. **User Personas**
   - Primary and secondary users

4. **User Stories / Use Cases**
   - Clear and testable

5. **Functional Requirements**
   - Numbered, detailed, unambiguous

6. **Non-Functional Requirements**
   - Performance, security, scalability, reliability, accessibility, etc.

7. **User Flow / Journey Description**
   - Step-by-step behavior

8. **Edge Cases & Error Handling**

9. **Out of Scope**

10. **Dependencies & Assumptions**

11. **Risks & Mitigations**

12. **Open Questions (if any)**

13. **Acceptance Criteria**
   - Clear, testable conditions for completion

---

## Quality Standards
- Production-level detail
- Clear, structured Markdown
- No vague language
- No invented requirements
- Explicit assumptions
- Ready for engineering, design, and QA teams

---

## Default Behavior Rules
- Always ask questions before generating the PRD
- Always clarify ambiguity
- Never skip confirmation
- Never generate `{FEATURE_NAME}_Feature_prd.md` prematurely

---

## Example Prompt to User (Guideline Only)
> Please provide:
> 1. Feature name
> 2. Feature description
>
> I may ask follow-up questions to clarify requirements before generating the PRD.

---

End of instructions.

