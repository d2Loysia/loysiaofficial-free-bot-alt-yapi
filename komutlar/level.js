const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Kendi seviyeni ve XP\'ni göster.'),

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    client.db.get(`SELECT * FROM levels WHERE guildId = ? AND userId = ?`, [guildId, userId], (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: 'Veritabanı hatası oluştu.', ephemeral: true });
      }

      if (!row) {
        return interaction.reply({ content: 'Henüz hiç mesaj atmadığın için seviyen yok.', ephemeral: true });
      }

      const nextLevelXP = row.level * 100;
      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username} - Seviye Bilgisi`)
        .setDescription(`📊 Seviye: **${row.level}**\n🧪 XP: **${row.xp} / ${nextLevelXP}**`)
        .setColor('Blue');

      interaction.reply({ embeds: [embed] });
    });
  }
};
