const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { token, clientId, guildId } = require('./config.json');
const db2 = require('croxydb');
const moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
});

client.commands = new Collection();
const commands = [];

const databaseFolder = path.join(__dirname, 'database');

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder, { recursive: true });
}

const dbPath = path.join(databaseFolder, 'level.db');
const db = new sqlite3.Database(dbPath);

db.run(`CREATE TABLE IF NOT EXISTS levels (
  guildId TEXT,
  userId TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  PRIMARY KEY (guildId, userId)
)`);

db.run(`CREATE TABLE IF NOT EXISTS hg_bb (
  guildId TEXT PRIMARY KEY,
  channelId TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS captcha_settings (
  guildId TEXT PRIMARY KEY,
  channelId TEXT NOT NULL,
  roleId TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS custom_commands (
  guildId TEXT,
  trigger TEXT,
  response TEXT,
  PRIMARY KEY (guildId, trigger)
)`);

client.db = db;

const commandsPath = path.join(__dirname, 'komutlar');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[UYARI] ${filePath} geçerli bir komut değil.`);
  }
}

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} olarak giriş yapıldı.`);

  client.user.setPresence({
    activities: [{ name: 'loysiaofficial | Free Bot Alt Yapı', type: 0 }],
    status: 'online'
  });

  const rest = new REST({ version: '10' }).setToken(token);
  try {
    console.log('🔄 Komutlar yükleniyor...');

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('✅ Sunucuya özel komutlar yüklendi.');
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('✅ Global komutlar yüklendi.');
    }
  } catch (error) {
    console.error('🚨 Komutlar yüklenirken hata oluştu:', error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  db.get(`SELECT * FROM levels WHERE guildId = ? AND userId = ?`, [guildId, userId], (err, row) => {
    if (err) return console.error(err);

    if (!row) {
      db.run(`INSERT INTO levels (guildId, userId, xp, level) VALUES (?, ?, ?, ?)`, [guildId, userId, 10, 1]);
    } else {
      let newXP = row.xp + 10;
      let newLevel = row.level;
      const nextLevelXP = row.level * 100;

      if (newXP >= nextLevelXP) {
        newLevel++;
        newXP -= nextLevelXP;

        message.channel.send(`🎉 Tebrikler ${message.author}, **${newLevel}. seviye** oldun!`);
      }

      db.run(`UPDATE levels SET xp = ?, level = ? WHERE guildId = ? AND userId = ?`, [newXP, newLevel, guildId, userId]);
    }
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error('🚨 Komut çalıştırma hatası:', error);
    await interaction.reply({ content: 'Komutu çalıştırırken bir hata oluştu.', ephemeral: true });
  }
});

client.on('guildMemberAdd', async member => {
  const db = client.db;
  db.get(`SELECT channelId FROM hg_bb WHERE guildId = ?`, [member.guild.id], async (err, row) => {
    if (err) return console.error(err);
    if (!row) return;

    let kanal = member.guild.channels.cache.get(row.channelId);
    if (!kanal) kanal = await member.guild.channels.fetch(row.channelId).catch(() => null);
    if (!kanal) return console.warn(`Kanal bulunamadı: ${row.channelId}`);

    const timestamp = Math.floor(member.user.createdTimestamp / 1000); // UNIX timestamp (saniye)
    
    const mesaj = `👋 **${member.guild.name}** sunucusuna hoş geldin ${member} 🎉
Seninle birlikte tam **${member.guild.memberCount}** kişiyiz!
Sunucumuzda güzel vakit geçirmen dileğiyle. İyi günler 🤝

📅 Hesap oluşturulma tarihi: <t:${timestamp}:R> (<t:${timestamp}:f>)`;

    try {
      await kanal.send({ content: mesaj });
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  });
});

client.on('guildMemberRemove', async member => {
  const db = client.db;
  db.get(`SELECT channelId FROM hg_bb WHERE guildId = ?`, [member.guild.id], async (err, row) => {
    if (err) return console.error(err);
    if (!row) return;

    let kanal = member.guild.channels.cache.get(row.channelId);
    if (!kanal) kanal = await member.guild.channels.fetch(row.channelId).catch(() => null);
    if (!kanal) return console.warn(`Kanal bulunamadı: ${row.channelId}`);

    const mesaj = `😢 ${member.user.tag} sunucudan ayrıldı...
Şu anda **${member.guild.memberCount}** kişiyiz.
Umarız tekrar görüşürüz. 👋`;

    try {
      await kanal.send({ content: mesaj });
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  });
});


client.on('interactionCreate', async interaction => {
  if (interaction.isButton() && interaction.customId === 'verify') {
    const db = client.db;
    db.get(`SELECT roleId FROM captcha_settings WHERE guildId = ?`, [interaction.guild.id], async (err, row) => {
      if (err || !row) {
        return interaction.reply({ content: '⚠️ Doğrulama sistemi ayarlanmamış.', ephemeral: true });
      }

      const rol = interaction.guild.roles.cache.get(row.roleId);
      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (!rol || !member) return;

      if (member.roles.cache.has(rol.id)) {
        return interaction.reply({ content: '✅ Zaten doğrulandınız.', ephemeral: true });
      }

      await member.roles.add(rol).catch(console.error);
      await interaction.reply({ content: '🎉 Başarıyla doğrulandınız, artık sunucuya erişebilirsiniz!', ephemeral: true });
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== 'komut_olustur') return;

  const tetikleyici = interaction.fields.getTextInputValue('tetikleyici');
  const yanit = interaction.fields.getTextInputValue('yanit');
  const guildId = interaction.guild.id;

  client.db.run(
    `INSERT INTO custom_commands (guildId, trigger, response) VALUES (?, ?, ?)
     ON CONFLICT(guildId, trigger) DO UPDATE SET response = excluded.response`,
    [guildId, tetikleyici, yanit],
    (err) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Veritabanı hatası.', ephemeral: true });
      }
      interaction.reply({ content: `✅ \`${tetikleyici}\` komutu başarıyla oluşturuldu!`, ephemeral: true });
    }
  );
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const guildId = message.guild.id;
  const content = message.content.trim();

  client.db.get(
    `SELECT response FROM custom_commands WHERE guildId = ? AND trigger = ?`,
    [guildId, content],
    (err, row) => {
      if (err) return console.error(err);
      if (row) message.channel.send(row.response);
    }
  );
});

client.login(token);
