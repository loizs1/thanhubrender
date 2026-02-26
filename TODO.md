# Task: Add slash command for leaderboard with proper permission handling

## TODO List:
- [x] 1. Update src/data/framework/commandLoader.ts - Add allowedCommands check for leaderboard slash command
- [x] 2. Update src/data/framework/commandLoader.ts - Add allowedCommands check for leaderboard text command  
- [x] 3. Update src/commands/leaderboard.ts - Use config-based permission instead of hardcoded "admin" (already done)
- [x] 4. Add leaderboard translation to languages/english.json

## Implementation Notes:
- The leaderboard slash command is now registered with the allowedCommands check
- The permission check in leaderboard.ts already uses config-based permission
- Added translation for the leaderboard command description
