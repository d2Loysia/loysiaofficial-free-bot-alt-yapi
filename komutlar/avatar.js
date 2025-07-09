const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Etiketlenen kullanıcının avatarını gösterir.')
    .addUserOption(option =>
      option.setName('kullanıcı')
        .setDescription('Bir kullanıcı etiketleyin.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('kullanıcı');

    if (!member) {
      return await interaction.reply({ content: '❌ Belirtilen kullanıcı bulunamadı.', ephemeral: true });
    }

    const avatarURL = member.user.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = new EmbedBuilder()
      .setTitle(`${member.user.tag} kullanıcısının avatarı`)
      .setDescription(`[Avatarı açmak için tıklayın](${avatarURL})`)
      .setImage(avatarURL)
      .setColor('Blue');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('PNG')
        .setStyle(ButtonStyle.Link)
        .setURL(member.user.displayAvatarURL({ size: 1024, format: 'png' })),
      new ButtonBuilder()
        .setLabel('JPG')
        .setStyle(ButtonStyle.Link)
        .setURL(member.user.displayAvatarURL({ size: 1024, format: 'jpg' })),
      new ButtonBuilder()
        .setLabel('WEBP')
        .setStyle(ButtonStyle.Link)
        .setURL(member.user.displayAvatarURL({ size: 1024, format: 'webp' })),
      new ButtonBuilder()
        .setLabel('GIF')
        .setStyle(ButtonStyle.Link)
        .setURL(member.user.displayAvatarURL({ size: 1024, format: 'gif' }))
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
