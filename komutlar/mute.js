const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Bir kullanıcıyı susturur (mute).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Susturulacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Susturma sebebi')
        .setRequired(false)),
  
  async execute(interaction) {
    const user = interaction.options.getUser('kullanici');
    const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });


    const muteRoleId = 'MUTE_ROL_ID';

    const muteRole = guild.roles.cache.get(muteRoleId);
    if (!muteRole) return interaction.reply({ content: 'Mute rolü bulunamadı. Lütfen ayarlayın.', ephemeral: true });

    if (member.roles.cache.has(muteRoleId)) {
      return interaction.reply({ content: 'Bu kullanıcı zaten susturulmuş.', ephemeral: true });
    }

    try {
      await member.roles.add(muteRole, sebep);
      interaction.reply({ content: `${user.tag} başarıyla susturuldu. Sebep: ${sebep}`, ephemeral: false });
    } catch (error) {
      interaction.reply({ content: 'Mute işlemi sırasında hata oluştu.', ephemeral: true });
      console.error(error);
    }
  }
};
