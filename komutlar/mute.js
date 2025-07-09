const { SlashCommandBuilder, PermissionFlagsBits, time } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Bir kullanıcıyı zaman aşımına alır (mute).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Susturulacak kullanıcı')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('dakika')
        .setDescription('Kaç dakika susturulsun?')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Susturma sebebi')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const dakika = interaction.options.getInteger('dakika');
    const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
    }

    if (!member.moderatable || !member.manageable) {
      return interaction.reply({ content: '❌ Bu kullanıcıya işlem uygulayamıyorum.', ephemeral: true });
    }

    const timeoutMs = dakika * 60 * 1000;

    try {
      await member.timeout(timeoutMs, sebep);
      await interaction.reply({ content: `✅ ${user.tag} ${dakika} dakika boyunca susturuldu. Sebep: ${sebep}` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Zaman aşımı uygulanırken bir hata oluştu.', ephemeral: true });
    }
  }
};
