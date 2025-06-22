const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Bir kullanıcının yasağını kaldırır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option.setName('kullanici_id')
        .setDescription('Yasağı kaldırılacak kullanıcının ID\'si')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('kullanici_id');

    try {
      const bans = await interaction.guild.bans.fetch();
      if (!bans.has(userId)) {
        return interaction.reply({ content: '❌ Bu kullanıcı yasaklı değil.', ephemeral: true });
      }
    } catch (error) {
      return interaction.reply({ content: '❌ Sunucudan banlar alınamadı.', ephemeral: true });
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('unban-yes')
          .setLabel('✅ Onayla')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('unban-no')
          .setLabel('❌ İptal')
          .setStyle(ButtonStyle.Danger),
      );

    await interaction.reply({
      content: `${userId} ID'li kullanıcının yasağını kaldırmak istediğinize emin misiniz?`,
      components: [row],
      ephemeral: true
    });

    const filter = i => ['unban-yes', 'unban-no'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      if (i.customId === 'unban-yes') {
        try {
          await interaction.guild.bans.remove(userId);
          await i.update({ content: `✅ ${userId} ID'li kullanıcının yasağı kaldırıldı.`, components: [] });
        } catch (error) {
          await i.update({ content: '❌ Ban kaldırılırken hata oluştu.', components: [] });
        }
      } else if (i.customId === 'unban-no') {
        await i.update({ content: '❌ İşlem iptal edildi.', components: [] });
      }
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: '⌛ İşlem zaman aşımına uğradı.', components: [] });
      }
    });
  }
};
