const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hg-bb')
    .setDescription('Hoş geldin mesajı kanalı ayarla.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Karşılama mesajları için kanal seçin')
        .setRequired(true)),

  async execute(interaction) {
    const kanal = interaction.options.getChannel('kanal');
    const db = interaction.client.db;

    db.run(
      `INSERT INTO hg_bb (guildId, channelId) VALUES (?, ?)
       ON CONFLICT(guildId) DO UPDATE SET channelId = excluded.channelId`,
      [interaction.guild.id, kanal.id],
      function(err) {
        if (err) {
          console.error(err);
          return interaction.reply({ content: 'Veritabanı hatası oluştu.', ephemeral: true });
        }
        interaction.reply({ content: `✅ Karşılama kanalı ${kanal} olarak ayarlandı.`, ephemeral: true });
      }
    );
  }
};
