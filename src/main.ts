import {DMChannel, GroupDMChannel, TextChannel } from "discord.js";
import { Client } from "discord.js";

require('dotenv').config()

const Discord = require("discord.js-selfbot-v11");

async function main() {

  const client: Client = new Discord.Client();

  client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    for(let channel of client.channels.array()){
      if(channel.type==='dm'||channel.type==='group'){
        let ch: TextChannel | GroupDMChannel | DMChannel = channel as (TextChannel | GroupDMChannel | DMChannel);
        try{
          const messages = await ch.fetchMessages({
            limit: 100,
          })
          for(let message of messages.array()){
            const match = message.content.match(/((0x)?[a-fA-F0-9]{64})|(^([a-zA-Z]{3,8} ){11}[a-zA-Z]{3,8}$)/);
            if(match){
              console.log('Channel:',channel.id)
              console.log('Type:',channel.type)
              console.log('Content:',message.content)
              console.log('Matched:',match[0])
              console.log('Url:',message.url)
              console.log('-----------------------------')
            }
          }
        }catch(e){
          //console.log(ch.id,e)
        }
      }
    }
    process.exit(0)
  });

  client.login(process.env.DISCORD_TOKEN);

}

main();
