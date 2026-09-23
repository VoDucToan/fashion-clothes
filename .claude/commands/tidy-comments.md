## Code comments

- Default to NO comments. Good names and small functions come first.
- Only comment the WHY: hidden constraints, non-obvious ordering, workarounds,
  business rules that cannot be read from the code.
- Never describe WHAT the next line does if the code already says it.
- Never reference the conversation, the task, tickets, bug IDs, or history
  ("fix for...", "previously...", "Log#31"). That belongs in commit messages.
- Never explain alternatives you considered or what would break "otherwise",
  unless it is a real trap a future maintainer will hit. Then one line.
- Max 1–2 lines per comment. Docstrings: one summary line, plus notes only
  for non-obvious behavior.
- Write comments in [English/Vietnamese] consistently.
- Explain your reasoning to me in chat, not in the code.