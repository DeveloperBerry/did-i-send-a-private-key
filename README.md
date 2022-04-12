# Did I send a private key???

Tool to use when you're not sure if you've leaked an ethereum-based private key or mnemonic.

*Might violate discord TOS...*

I made this **very** quickly, so it may be a bit messy :'(

---
## Reasoning:

Discord's QR code scanner, while convenient, is a blatant security flaw. It gives an attacker full access to your account regardless if you have 2FA enabled or not. All they have to do is ask you to verify your discord identity by scanning the QR code, then bam! They know everything about you, like your address (If you have paid for anything via Discord), email, phone number, and even the private key(s) you store in DMs and private channels.

----

## Usage:

Install:

```
npm install

or

yarn install
```

Create `.env` file in root directory.

Populate with:

```
DISCORD_TOKEN=discord.token.here
```

### NEVER COMMIT OR SEND ANYONE YOUR TOKEN EVER.
### IT SHOULD BE DELETED AFTER USE.

Run:

```
npm run start

or

yarn start
```
