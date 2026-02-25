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

        //check subcommand
        const subCommand = instance.options.getSubCommand()

        //read leaderboard database
        const leaderboardDb = opendiscord.databases.get("opendiscord:leaderboard")
        if (!leaderboardDb){
            await instance.reply({id:new api.ODId("opendiscord:leaderboard-error"), ephemeral:true, message:{content:":x: **Leaderboard database not found!**"}})
            return cancel()
        }

        const mainColor = (generalConfig.data.mainColor ?? "#3498db") as discord.ColorResolvable

        //HANDLE RESET SUBCOMMAND
        if (subCommand === "reset"){
            //check admin permissions for reset
            const adminResult = await opendiscord.permissions.checkCommandPerms("admin","admin",user,member,channel,guild)
            if (!adminResult.hasPerms){
                await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source,{guild,channel,user,permissions:["admin"]}))
                return cancel()
            }

            //Get reason from command option
            const reason = instance.options.getString("reason",false) ?? "No reason provided"

            //Show confirmation embed with buttons
            const confirmEmbed = new discord.EmbedBuilder()
                .setColor("#ffaa00")
                .setTitle("⚠️ Confirm Leaderboard Reset")
                .setDescription("Are you sure you want to reset the leaderboard? This will **delete all claim points** for all staff members.")
                .addFields(
                    {name:"Reason", value: reason},
                    {name:"Warning", value:"This action cannot be undone!"}
                )

            const yesButton = new discord.ButtonBuilder()
                .setCustomId("leaderboard_reset_yes")
                .setLabel("✅ Yes, Reset")
                .setStyle(discord.ButtonStyle.Danger)

            const noButton = new discord.ButtonBuilder()
                .setCustomId("leaderboard_reset_no")
                .setLabel("❌ No, Cancel")
                .setStyle(discord.ButtonStyle.Secondary)

            const row = new discord.ActionRowBuilder<discord.ButtonBuilder>()
                .addComponents(yesButton, noButton)

            const confirmMsg = await instance.reply({
                id:new api.ODId("opendiscord:leaderboard-reset-confirm"),
                ephemeral:false,
                message:{
                    embeds: [confirmEmbed],
                    components: [row]
                }
            })

            //Wait for button interaction
            const filter = (interaction: discord.Interaction) => 
                interaction.user.id === user.id && 
                (interaction.isButton()) &&
                (interaction.customId === "leaderboard_reset_yes" || interaction.customId === "leaderboard_reset_no")

            try {
                const textChannel = instance.channel as discord.TextChannel
                const collected = await textChannel.awaitMessageComponent({ filter, time: 30000 })

                if (collected.customId === "leaderboard_reset_no"){
                    await collected.update({content: "❌ Leaderboard reset cancelled.", embeds: [], components: []})
                    return
                }

                //User clicked Yes - proceed with reset
                await collected.update({content: "🔄 Resetting leaderboard...", embeds: [], components: []})

                //Clear all leaderboard entries
                const allEntries = await leaderboardDb.getCategory("claims") ?? []
                let deleteCount = 0
                for (const entry of allEntries){
                    await leaderboardDb.delete(entry.key, "claims")
                    deleteCount++
                }

                const successEmbed = new discord.EmbedBuilder()
                    .setColor(mainColor)
                    .setTitle("🔄 Leaderboard Reset")
                    .setDescription("The leaderboard has been successfully reset!")
                    .addFields(
                        {name:"Reset by", value: user.globalName ?? user.username},
                        {name:"Reason", value: reason},
                        {name:"Records deleted", value: deleteCount.toString()}
                    )
                    .setTimestamp()

                await textChannel.send({embeds: [successEmbed]})
            } catch (e) {
                //Timeout - just send timeout message
                await instance.reply({id:new api.ODId("opendiscord:leaderboard-reset-timeout"), ephemeral:true, message:{content:"❌ Reset cancelled - timed out."}})
                return
            }

            return
        }



        //HANDLE VIEW SUBCOMMAND (default)
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
        const subCommand = instance.options.getSubCommand()
        opendiscord.log(instance.user.displayName+" used the 'leaderboard "+subCommand+"' command!","info",[
            {key:"user",value:instance.user.username},
            {key:"userid",value:instance.user.id,hidden:true},
            {key:"method",value:source}
        ])
    }))
}
