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
            if (adminResult.reason == "not-in-server") await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-not-in-guild").build("slash",{channel,user}))
            else await instance.reply(await opendiscord.builders.messages.getSafe("opendiscord:error-no-permissions").build(source,{guild,channel,user,permissions:["admin"]}))
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


        const mainColor = (generalConfig.data.mainColor ?? "#3498db") as discord.ColorResolvable

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
            .setTimestamp()

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

        //Send confirmation message using framework method
        await instance.defer(false)
        const textChannel = channel as discord.TextChannel
        const confirmMsg = await textChannel.send({
            embeds: [confirmEmbed],
            components: [row]
        })



        //Wait for button interaction
        const filter = (interaction: discord.Interaction) => 
            interaction.user.id === user.id && 
            interaction.isButton() &&
            (interaction.customId === "leaderboard_reset_yes" || interaction.customId === "leaderboard_reset_no")

        try {
            const collected = await channel.awaitMessageComponent({ filter, time: 30000 })

            if (collected.customId === "leaderboard_reset_no"){
                const cancelEmbed = new discord.EmbedBuilder()
                    .setColor("#ff0000")
                    .setTitle("❌ Cancelled")
                    .setDescription("Leaderboard reset cancelled.")
                    .setTimestamp()
                
                await collected.update({
                    embeds: [cancelEmbed], 
                    components: []
                })
                return
            }

            //User clicked Yes - proceed with reset
            const resettingEmbed = new discord.EmbedBuilder()
                .setColor("#3498db")
                .setTitle("🔄 Resetting...")
                .setDescription("Resetting leaderboard, please wait...")
                .setTimestamp()
            
            await collected.update({
                embeds: [resettingEmbed], 
                components: []
            })


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
            //Timeout - show timeout message
            const timeoutEmbed = new discord.EmbedBuilder()
                .setColor("#ff0000")
                .setTitle("⏰ Timeout")
                .setDescription("Reset cancelled - no response received within 30 seconds.")
                .setTimestamp()

            await confirmMsg.edit({
                embeds: [timeoutEmbed],
                components: []
            })
            return
        }

    }))

    resetResponder.workers.add(new api.ODWorker("opendiscord:logs",-1,(instance,params,source,cancel) => {
        opendiscord.log(instance.user.displayName+" used the 'resetleaderboard' command!","info",[
            {key:"user",value:instance.user.username},
            {key:"userid",value:instance.user.id,hidden:true},
            {key:"method",value:source}
        ])
    }))
}
