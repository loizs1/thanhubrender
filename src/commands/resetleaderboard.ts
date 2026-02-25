///////////////////////////////////////
//RESET LEADERBOARD COMMAND
///////////////////////////////////////
import {opendiscord, api, utilities} from "../index"
import * as discord from "discord.js"

export const registerCommandResponders = async () => {
    const generalConfig = opendiscord.configs.get("opendiscord:general")
    if (!generalConfig) return

    //RESET LEADERBOARD COMMAND RESPONDER
    opendiscord.responders.commands.add(new api.ODCommandResponder("opendiscord:resetleaderboard",generalConfig.data.prefix,"resetleaderboard"))
    const resetResponder = opendiscord.responders.commands.get("opendiscord:resetleaderboard")
    if (!resetResponder) return

    resetResponder.workers.add(new api.ODWorker("opendiscord:resetleaderboard",0,async (instance,params,source,cancel) => {
        const {user,member,channel,guild} = instance

        //check admin permissions for reset
        const adminResult = await opendiscord.permissions.checkCommandPerms("admin","admin",user,member,channel,guild)
        if (!adminResult.hasPerms){
            if (adminResult.reason == "not-in-server") {
                await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash",{channel,user}))
            } else {
                await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source,{guild,channel,user,permissions:["admin"]}))
            }
            return cancel()
        }

        if (!guild){
            await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash",{channel,user}))
            return cancel()
        }

        //read leaderboard database
        const leaderboardDb = opendiscord.databases.get("opendiscord:leaderboard")
        if (!leaderboardDb){
            await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error").build(source,{guild,channel,user,error:"Leaderboard database not found!",layout:"simple"}))
            return cancel()
        }

        //Default reason - no need to type
        const reason = "Manual reset by admin"

        //For slash commands, defer the reply. For text commands, just send to channel
        if (source === "slash") {
            await instance.defer(true)
        }

        //Show confirmation embed with buttons - send to channel
        const confirmEmbed = new discord.EmbedBuilder()
            .setColor("#ffaa00")
            .setTitle("⚠️ Confirm Leaderboard Reset")
            .setDescription("Are you sure you want to reset the leaderboard? This will **delete all claim points** for all staff members.")
            .addFields(
                {name:"Reset by", value: user.globalName ?? user.username},
                {name:"Warning", value:"This action cannot be undone!"}
            )
            .setTimestamp()

        const yesButton = new discord.ButtonBuilder()
            .setCustomId(`leaderboard_reset_yes_${user.id}_${Date.now()}`)
            .setLabel("✅ Yes, Reset")
            .setStyle(discord.ButtonStyle.Danger)

        const noButton = new discord.ButtonBuilder()
            .setCustomId(`leaderboard_reset_no_${user.id}_${Date.now()}`)
            .setLabel("❌ No, Cancel")
            .setStyle(discord.ButtonStyle.Secondary)

        const row = new discord.ActionRowBuilder<discord.ButtonBuilder>()
            .addComponents(yesButton, noButton)

        //Send confirmation message to channel
        const textChannel = channel as discord.TextChannel
        await textChannel.send({
            embeds: [confirmEmbed],
            components: [row]
        })

    }))

    resetResponder.workers.add(new api.ODWorker("opendiscord:logs",-1,(instance,params,source,cancel) => {
        opendiscord.log(instance.user.displayName+" used the 'resetleaderboard' command!","info",[
            {key:"user",value:instance.user.username},
            {key:"userid",value:instance.user.id,hidden:true},
            {key:"method",value:source}
        ])
    }))
}

export const registerButtonResponders = async () => {
    const generalConfig = opendiscord.configs.get("opendiscord:general")
    if (!generalConfig) return

    const mainColor = (generalConfig.data.mainColor ?? "#3498db") as discord.ColorResolvable
    
    //Get leaderboard database for button handlers
    const leaderboardDb = opendiscord.databases.get("opendiscord:leaderboard")
    if (!leaderboardDb) return

    //YES BUTTON - Confirm reset
    opendiscord.responders.buttons.add(new api.ODButtonResponder("opendiscord:leaderboard-reset-yes",/^leaderboard_reset_yes_/))
    const yesResponder = opendiscord.responders.buttons.get("opendiscord:leaderboard-reset-yes")
    if (!yesResponder) return
    
    yesResponder.workers.add(
        new api.ODWorker("opendiscord:leaderboard-reset-yes",0,async (instance,params,source,cancel) => {
            const {user,channel,guild} = instance
            
            //Extract user ID from customId to verify
            const parts = instance.interaction.customId.split("_")
            const allowedUserId = parts[3]
            
            if (user.id !== allowedUserId) {
                await instance.reply({
                    id: new api.ODId("opendiscord:leaderboard-reset-wrong-user"),
                    ephemeral: true,
                    message: {content: "❌ You didn't initiate this reset command!"}
                })
                return cancel()
            }

            if (!guild) return

            //Show resetting message
            const resettingEmbed = new discord.EmbedBuilder()
                .setColor("#3498db")
                .setTitle("🔄 Resetting...")
                .setDescription("Resetting leaderboard, please wait...")
                .setTimestamp()

            await instance.defer("update", true)
            await instance.update({
                id: new api.ODId("opendiscord:leaderboard-resetting"),
                ephemeral: true,
                message: {embeds: [resettingEmbed], components: []}
            })

            //Clear all leaderboard entries
            let deleteCount = 0
            const allEntries = await leaderboardDb.getCategory("claims") ?? []
            for (const entry of allEntries){
                await leaderboardDb.delete("claims", entry.key)
                deleteCount++
            }



            const successEmbed = new discord.EmbedBuilder()
                .setColor(mainColor)
                .setTitle("🔄 Leaderboard Reset")
                .setDescription("The leaderboard has been successfully reset!")
                .addFields(
                    {name:"Reset by", value: user.globalName ?? user.username},
                    {name:"Reason", value: "Manual reset by admin"},
                    {name:"Records deleted", value: deleteCount.toString()}
                )
                .setTimestamp()

            await instance.update({
                id: new api.ODId("opendiscord:leaderboard-reset-success"),
                ephemeral: true,
                message: {embeds: [successEmbed], components: []}
            })
        })
    )

    //NO BUTTON - Cancel reset
    opendiscord.responders.buttons.add(new api.ODButtonResponder("opendiscord:leaderboard-reset-no",/^leaderboard_reset_no_/))
    const noResponder = opendiscord.responders.buttons.get("opendiscord:leaderboard-reset-no")
    if (!noResponder) return
    
    noResponder.workers.add(
        new api.ODWorker("opendiscord:leaderboard-reset-no",0,async (instance,params,source,cancel) => {
            const {user} = instance
            
            //Extract user ID from customId to verify
            const parts = instance.interaction.customId.split("_")
            const allowedUserId = parts[3]
            
            if (user.id !== allowedUserId) {
                await instance.reply({
                    id: new api.ODId("opendiscord:leaderboard-reset-wrong-user"),
                    ephemeral: true,
                    message: {content: "❌ You didn't initiate this reset command!"}
                })
                return cancel()
            }

            const cancelEmbed = new discord.EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("❌ Cancelled")
                .setDescription("Leaderboard reset cancelled.")
                .setTimestamp()

            await instance.defer("update", true)
            await instance.update({
                id: new api.ODId("opendiscord:leaderboard-reset-cancelled"),
                ephemeral: true,
                message: {embeds: [cancelEmbed], components: []}
            })
        })
    )
}
