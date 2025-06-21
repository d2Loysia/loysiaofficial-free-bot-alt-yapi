const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kilit')
    .setDescription('Belirtilen kanalın yazma kilidini açar veya kapatır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Kilitlemek veya açmak istediğin kanal')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('durum')
        .setDescription('Kanal kilidi durumu')
        .addChoices(
          { name: 'Kilitle', value: 'kilitle' },
          { name: 'Kilit Aç', value: 'ac' },
        )
        .setRequired(true)),

  async execute(interaction) {
    const kanal = interaction.options.getChannel('kanal');
    const durum = interaction.options.getString('durum');

    try {
      if (durum === 'kilitle') {
        await kanal.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          [PermissionFlagsBits.SendMessages]: false
        });

        await interaction.reply({ content: `🔒 ${kanal} kanalı başarıyla **kilitlendi**.`, ephemeral: true });
      } else if (durum === 'ac') {
        await kanal.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          [PermissionFlagsBits.SendMessages]: null
        });

        await interaction.reply({ content: `🔓 ${kanal} kanalının **kilidi açıldı**.`, ephemeral: true });
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Kanal izinleri güncellenirken bir hata oluştu.', ephemeral: true });
    }
  },
};
