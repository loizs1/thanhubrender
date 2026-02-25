# Task: Add slash command for leaderboard with proper permission handling

## TODO List:
- [x] 1. Update src/data/framework/commandLoader.ts - Add allowedCommands check for leaderboard slash command
- [x] 2. Update src/data/framework/commandLoader.ts - Add allowedCommands check for leaderboard text command  
- [x] 3. Update src/commands/leaderboard.ts - Use config-based permission instead of hardcoded "admin"
- [x] 4. Update src/core/api/defaults/config.ts - Add leaderboard property to ODJsonConfig_DefaultSystemPermissions

## Implementation Notes:
- The leaderboard slash command is now registered using the allowedCommands check (like other commands)
- The leaderboard text command now also uses the allowedCommands check
- The permission check in leaderboard.ts now uses config-based permission from general.json
- Added leaderboard to the config type definitions in config.ts
