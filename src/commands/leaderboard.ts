///////////////////////////////////////
//LEADERBOARD COMMAND
///////////////////////////////////////
import {opendiscord, api, utilities} from "../index"
import * as discord from "discord.js"

const ITEMS_PER_PAGE = 10

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

        //Calculate total pages
        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
        const currentPage = 0 //Start at page 0

        //Build first page
        const embed = await buildLeaderboardEmbed(sorted, currentPage, totalPages, guild, mainColor)

        //Create navigation buttons if more than 1 page
        const components = totalPages > 1 ? buildPaginationButtons(currentPage, totalPages, user.id) : []

        await instance.reply({
            id:new api.ODId("opendiscord:leaderboard-result"),
            ephemeral:false,
            message:{
                embeds:[embed],
                components: components
            }
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

//Build leaderboard embed for a specific page
async function buildLeaderboardEmbed(
    sorted: {key: string, value: unknown}[],
    page: number,
    totalPages: number,
    guild: discord.Guild,
    color: discord.ColorResolvable
): Promise<discord.EmbedBuilder> {
    
    const startIndex = page * ITEMS_PER_PAGE
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, sorted.length)
    const pageEntries = sorted.slice(startIndex, endIndex)

    //build leaderboard lines with username lookup
    const lines: string[] = []
    const medals = ["🥇","🥈","🥉"]

    for (let i = 0; i < pageEntries.length; i++){
        const entry = pageEntries[i]
        const userId = entry.key
        const count = entry.value as number
        const globalRank = startIndex + i
        const rank = medals[globalRank] ?? `**#${globalRank + 1}**`

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
        .setColor(color)
        .setTitle("🏆 Staff Claim Leaderboard")
        .setDescription(lines.join("\n") || "No entries on this page.")
        .setFooter({text:`Page ${page + 1}/${totalPages} • Total staff: ${sorted.length}`})
        .setTimestamp()

    return embed
}

//Build pagination buttons
function buildPaginationButtons(currentPage: number, totalPages: number, userId: string): discord.ActionRowBuilder<discord.ButtonBuilder>[] {
    const row = new discord.ActionRowBuilder<discord.ButtonBuilder>()

    //Previous button
    const prevButton = new discord.ButtonBuilder()
        .setCustomId(`leaderboard_prev_${currentPage}_${userId}_${Date.now()}`)
        .setLabel("◀️ Previous")
        .setStyle(discord.ButtonStyle.Primary)
        .setDisabled(currentPage === 0)

    //Page indicator
    const pageButton = new discord.ButtonBuilder()
        .setCustomId(`leaderboard_page_${currentPage}_${userId}_${Date.now()}`)
        .setLabel(`Page ${currentPage + 1}/${totalPages}`)
        .setStyle(discord.ButtonStyle.Secondary)
        .setDisabled(true)

    //Next button
    const nextButton = new discord.ButtonBuilder()
        .setCustomId(`leaderboard_next_${currentPage}_${userId}_${Date.now()}`)
        .setLabel("Next ▶️")
        .setStyle(discord.ButtonStyle.Primary)
        .setDisabled(currentPage >= totalPages - 1)

    row.addComponents(prevButton, pageButton, nextButton)
    return [row]
}

//Register button responders for pagination
export const registerButtonResponders = async () => {
    const generalConfig = opendiscord.configs.get("opendiscord:general")
    if (!generalConfig) return

    const mainColor = (generalConfig.data.mainColor ?? "#3498db") as discord.ColorResolvable

    //Get leaderboard database
    const leaderboardDb = opendiscord.databases.get("opendiscord:leaderboard")
    if (!leaderboardDb) return

    //PREVIOUS PAGE BUTTON
    opendiscord.responders.buttons.add(new api.ODButtonResponder("opendiscord:leaderboard-prev",/^leaderboard_prev_/))
    const prevResponder = opendiscord.responders.buttons.get("opendiscord:leaderboard-prev")
    if (!prevResponder) return

    prevResponder.workers.add(new api.ODWorker("opendiscord:leaderboard-prev",0,async (instance,params,source,cancel) => {
        const {user,guild} = instance

        //Extract page and user ID from customId
        const parts = instance.interaction.customId.split("_")
        const currentPage = parseInt(parts[2])
        const allowedUserId = parts[3]

        //Verify user
        if (user.id !== allowedUserId) {
            await instance.reply({
                id: new api.ODId("opendiscord:leaderboard-wrong-user"),
                ephemeral: true,
                message: {content: "❌ You didn't initiate this command!"}
            })
            return cancel()
        }

        if (!guild) return

        //Get data
        const allEntries = await leaderboardDb.getCategory("claims") ?? []
        const sorted = allEntries
            .filter(e => typeof e.value === "number")
            .sort((a,b) => (b.value as number) - (a.value as number))

        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
        const newPage = Math.max(0, currentPage - 1)

        //Build new embed and buttons
        const embed = await buildLeaderboardEmbed(sorted, newPage, totalPages, guild, mainColor)
        const components = buildPaginationButtons(newPage, totalPages, user.id)

        await instance.defer("update", true)
        await instance.update({
            id: new api.ODId("opendiscord:leaderboard-page"),
            ephemeral: false,
            message: {embeds: [embed], components: components}
        })
    }))

    //NEXT PAGE BUTTON
    opendiscord.responders.buttons.add(new api.ODButtonResponder("opendiscord:leaderboard-next",/^leaderboard_next_/))
    const nextResponder = opendiscord.responders.buttons.get("opendiscord:leaderboard-next")
    if (!nextResponder) return

    nextResponder.workers.add(new api.ODWorker("opendiscord:leaderboard-next",0,async (instance,params,source,cancel) => {
        const {user,guild} = instance

        //Extract page and user ID from customId
        const parts = instance.interaction.customId.split("_")
        const currentPage = parseInt(parts[2])
        const allowedUserId = parts[3]

        //Verify user
        if (user.id !== allowedUserId) {
            await instance.reply({
                id: new api.ODId("opendiscord:leaderboard-wrong-user"),
                ephemeral: true,
                message: {content: "❌ You didn't initiate this command!"}
            })
            return cancel()
        }

        if (!guild) return

        //Get data
        const allEntries = await leaderboardDb.getCategory("claims") ?? []
        const sorted = allEntries
            .filter(e => typeof e.value === "number")
            .sort((a,b) => (b.value as number) - (a.value as number))

        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
        const newPage = Math.min(totalPages - 1, currentPage + 1)

        //Build new embed and buttons
        const embed = await buildLeaderboardEmbed(sorted, newPage, totalPages, guild, mainColor)
        const components = buildPaginationButtons(newPage, totalPages, user.id)

        await instance.defer("update", true)
        await instance.update({
            id: new api.ODId("opendiscord:leaderboard-page"),
            ephemeral: false,
            message: {embeds: [embed], components: components}
        })
    }))
}
