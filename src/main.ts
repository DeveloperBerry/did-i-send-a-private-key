import {Axios} from "axios";
import {APIUser, RESTGetAPICurrentUserGuildsResult, RESTGetAPIGuildChannelsResult,} from "discord-api-types";


type SearchResponse = {
    total_results: number,
    messages: SearchResponseMessages,
    global: boolean,
    message: string,
    retry_after: number,
    analytics_id: string
}

type SearchResponseMessages = {
    id: string,
    type: number,
    content: string,
    channel_id: string,
    timestamp: string
}[][]

require('dotenv').config()

const TOKEN = process.env.DISCORD_TOKEN!;

const client = new Axios({
    baseURL: 'https://discord.com/api/v9/',
    headers: {
        'authorization': TOKEN
    },
    responseType: 'json',
    transitional: {
        forcedJSONParsing: true,
    }
})

async function main() {

    const user = await getUser();

    console.log(`${user.username}#${user.discriminator}`);

    let channels = await getChannels();

    console.log(channels.length, 'dm channels')

    const guilds = await getGuilds();

    console.log(guilds.length, 'guilds')
    console.log('-----------------------------')

    for (let g = 0; g < guilds.length; g++) {

        const guild = guilds[g];

        console.log(`Guild (${g + 1}/${guilds.length}):`, guild.name)

        const searchResult = await searchGuild(guild.id, user.id)

        let messageCount = 0;

        try {
            for (const messages of searchResult.messages) {
                for (const message of messages) {
                    messageCount++
                    if (message.content !== undefined) {
                        const match = message.content.match(/((0x)?[a-fA-F0-9]{64})|(^([a-zA-Z]{3,8} ){11}[a-zA-Z]{3,8}$)/);
                        if (match) {
                            console.log('-----------------------------')
                            console.log('Guild:  ', guild.name)
                            console.log('Channel:', message.channel_id)
                            console.log('Content:', message.content)
                            console.log('Matched:', match[0])
                            console.log('Url:    ',`https://discord.com/channels/${guild.id}/${message.channel_id}/${message.id}`)
                            console.log('-----------------------------')
                        }
                    } else {
                        console.log(message)
                    }
                }
            }
        } catch (e) {
            console.log(searchResult);
            console.log(e)
        }

        console.log(messageCount, 'message(s)')
        console.log('-----------------------------')

    }

    for (let c = 0; c < channels.length; c++) {

        const channel = channels[c]

        console.log(`Channel (${c+1}/${channels.length}):`, channel.id)

        const searchResult = await searchChannels(channel.id, user.id)

        let messageCount = 0;

        for (const messages of searchResult.messages) {
            for (const message of messages) {
                messageCount++;
                if (message.content !== undefined) {
                    const match = message.content.match(/((0x)?[a-fA-F0-9]{64})|(^([a-zA-Z]{3,8} ){11}[a-zA-Z]{3,8}$)/);
                    if (match) {
                        console.log('-----------------------------')
                        console.log('Channel:', message.channel_id)
                        console.log('Content:', message.content)
                        console.log('Matched:', match[0])
                        console.log('Url:    ',`https://discord.com/channels/@me/${message.channel_id}/${message.id}`)
                        console.log('-----------------------------')
                    }
                } else {
                    console.log(message)
                }
            }
        }

        console.log(messageCount, 'message(s)')
        console.log('-----------------------------')

    }

}

main();

async function getUser(): Promise<APIUser> {
    return (JSON.parse((await client.get(`users/@me`)).data))
}

async function getChannels(): Promise<RESTGetAPIGuildChannelsResult> {
    return (JSON.parse((await client.get(`users/@me/channels`)).data))
}

async function getGuilds(): Promise<RESTGetAPICurrentUserGuildsResult> {
    return (JSON.parse((await client.get(`users/@me/guilds`)).data))
}

async function searchChannels(channelId: string, authorId: string): Promise<SearchResponse> {
    return searchEntity("channels", channelId, authorId)
}

async function searchGuild(guildId: string, authorId: string): Promise<SearchResponse> {
    return searchEntity("guilds", guildId, authorId)
}

async function searchEntity(type: 'guilds'|'channels', entityId: string, authorId: string, offset?: number, messages?: SearchResponseMessages): Promise<SearchResponse> {

    await new Promise(resolve=>setTimeout(resolve,3000))

    const response: SearchResponse = JSON.parse((await client.get(`${type}/${entityId}/messages/search?author_id=${authorId}${offset?`&offset=${offset}`:''}`)).data);

    if(response.message&&response.retry_after>0){
        console.log(response.message,`(${response.retry_after}s delay)`)
        return await new Promise<SearchResponse>(resolve=>{
            setTimeout(()=>{
                resolve(searchEntity(type,entityId,authorId,offset,messages))
            },(0.5+response.retry_after)*1000)
        })
    }else if(response.analytics_id){
        const more = response.messages.length === 25;
        if(messages){
            response.messages = response.messages.concat(messages)
        }
        if(more){
            return searchEntity(type,entityId,authorId,offset?offset+25:25,response.messages)
        }else
            return response;
    }else{
        console.log(response)
        return await new Promise<SearchResponse>(resolve=>{
            setTimeout(()=>{
                resolve(searchEntity(type,entityId,authorId,offset,messages))
            },1000)
        })
    }

}
