///////////////////////////////////////
//LEADERBOARD COMMAND
///////////////////////////////////////
import {opendiscord, api, utilities} from "../index"
import * as discord from "discord.js"

export const registerCommandResponders = async () => {
    const generalConfig = opendiscord.configs.get("opendiscord:general")
    if (!generalConfig) return

    //LEADERBOARD COMMAND RESPONDER
    opendiscord.responders.commands.add(new api.ODCommandResponder("opendiscord:leaderboard",generalConfig.data.prefix,"leaderboard"))
    const leaderboardResponder = opendiscord.responders.commands.get("opendiscord:leaderboard")
    if (!leaderboardResponder) return

    leaderboardResponder.workers.add(new api.ODWorker("opendiscord:leaderboard",0,async (instance,params,source,cancel) => {
        const {user,member,channel,guild} = instance

        //check permissions using config-based permission
        const permsResult = await opendiscord.permissions.checkCommandPerms(generalConfig.data.system.permissions.leaderboard,"support",user,member,channel,guild)
        if (!permsResult.hasPerms){
            if (permsResult.reason == "not-in-server") await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash",{channel,user}))
            else await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source,{guild,channel,user,permissions:["support"]}))
            return cancel()
        }

        if (!guild){
            await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash",{channel,user}))
            return cancel()
        }

        await instance.defer(false)

        //read leaderboard database
        const leaderboardDb = opendiscord.databases.get("opendiscord:leaderboard")
        if (!leaderboardDb){
            await instance.reply({id:new api.ODId("opendiscord:leaderboard-error"), ephemeral:true, message:{content:":x: **Leaderboard database not found!**"}})
            return cancel()
        }

        const mainColor = (generalConfig.data.mainColor ?? "#3498db") as discord.ColorResolvable

        //VIEW LEADERBOARD

        const allEntries = await leaderboardDb.getCategory("claims") ?? []

        if (allEntries.length === 0){
            await instance.reply({
                id:new api.ODId("opendiscord:leaderboard-empty"),
                ephemeral:false,
                message:{embeds:[
                    new discord.EmbedBuilder()
                        .setColor(mainColor)
                        .setTitle("🏆 Staff Claim Leaderboard")
                        .setDescription("No claims recorded yet.")
                        .setTimestamp()
                ]}
            })
            return
        }

        //sort by claim count descending
        const sorted = allEntries
            .filter(e => typeof e.value === "number")
            .sort((a,b) => (b.value as number) - (a.value as number))
            .slice(0,15)

        //build leaderboard lines with username lookup
        const lines: string[] = []
        const medals = ["🥇","🥈","🥉"]

        for (let i = 0; i < sorted.length; i++){
            const entry = sorted[i]
            const userId = entry.key
            const count = entry.value as number
            const rank = medals[i] ?? `**#${i+1}**`

            //try to fetch display name from guild
            let displayName: string
            try {
                const guildMember = await guild.members.fetch(userId)
                displayName = `${guildMember.displayName} (\`${userId}\`)`
            } catch {
                displayName = `Unknown (\`${userId}\`)`
            }

            lines.push(`${rank} ${displayName} — **${count}** claim${count !== 1 ? "s" : ""}`)
        }

        const embed = new discord.EmbedBuilder()
            .setColor(mainColor)
            .setTitle("🏆 Staff Claim Leaderboard")
            .setDescription(lines.join("\n"))
            .setFooter({text:`Total staff tracked: ${allEntries.length}`})
            .setTimestamp()

        await instance.reply({
            id:new api.ODId("opendiscord:leaderboard-result"),
            ephemeral:false,
            message:{embeds:[embed]}
        })
    }))

    leaderboardResponder.workers.add(new api.ODWorker("opendiscord:logs",-1,(instance,params,source,cancel) => {
        opendiscord.log(instance.user.displayName+" used the 'leaderboard' command!","info",[
            {key:"user",value:instance.user.username},
            {key:"userid",value:instance.user.id,hidden:true},
            {key:"method",value:source}
        ])
    }))

}
