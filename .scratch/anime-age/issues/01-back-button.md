# 01: Back button to fix a mis-tapped answer

**What to build:** During a play, the player can step back one question to change a mis-tapped answer, with a back button or the Backspace key. Stepping back replays the play's seed and answer log without the last answer, so the game is exactly as it was before that answer. There is no going back after the guess. It works for every game that implements the shared engine contract (`rewind`), including Province.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A back button and Backspace undo the last answer and show that question again
- [ ] After stepping back, the confidence, question number and next question match the state before that answer
- [ ] Back is not offered on the first question or after the guess
- [ ] Back works in Province without Province-specific code in the play screen
- [ ] Back works together with refresh restore
