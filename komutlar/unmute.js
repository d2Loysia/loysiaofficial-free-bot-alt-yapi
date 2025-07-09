const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Bir kullanıcının zaman aşımı (mute) cezasını kaldırır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('kullanici')
        .setDescription('Susturması kaldırılacak kullanıcı')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', ephemeral: true });
    }

    if (!member.communicationDisabledUntil) {
      return interaction.reply({ content: '❌ Bu kullanıcı zaman aşımında değil.', ephemeral: true });
    }

    try {
      await member.timeout(null, 'Zaman aşımı kaldırıldı');
      await interaction.reply({ content: `✅ ${user.tag} kullanıcısının susturması kaldırıldı.` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Susturma kaldırılırken bir hata oluştu.', ephemeral: true });
    }
  }
};
