const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Bir kullanıcının susturmasını kaldırır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Susturması kaldırılacak kullanıcı')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });

    const muteRoleId = 'MUTE_ROL_ID';

    if (!member.roles.cache.has(muteRoleId)) {
      return interaction.reply({ content: 'Bu kullanıcı susturulmamış.', ephemeral: true });
    }

    try {
      await member.roles.remove(muteRoleId);
      interaction.reply({ content: `${user.tag} susturması kaldırıldı.`, ephemeral: false });
    } catch (error) {
      interaction.reply({ content: 'Unmute işlemi sırasında hata oluştu.', ephemeral: true });
      console.error(error);
    }
  }
};
