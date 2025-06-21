const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bir kullanıcıyı sunucudan yasaklar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('kişi')
        .setDescription('Yasaklanacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Yasaklama sebebi')
        .setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('kişi');
    const reason = interaction.options.getString('sebep');
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
      return await interaction.reply({ content: '❌ Bu kullanıcı sunucuda bulunamadı.', ephemeral: true });
    }

    if (!member.bannable) {
      return await interaction.reply({ content: '❌ Bu kullanıcı yasaklanamıyor.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Yasaklama Onayı')
      .setDescription(`${target} kişisi "${reason}" sebebi ile sunucudan yasaklanacak.\n\n**Onaylıyor musunuz?**`)
      .setColor('Red');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('onayla')
        .setLabel('✅ Onayla')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('reddet')
        .setLabel('❌ Reddet')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 15000,
      max: 1
    });

    collector.on('collect', async i => {
      if (i.customId === 'onayla') {
        try {
          await member.ban({ reason });
          await i.update({ content: `✅ ${target.tag} başarıyla yasaklandı.`, embeds: [], components: [], ephemeral: true });
        } catch (err) {
          console.error(err);
          await i.update({ content: '❌ Yasaklama işlemi sırasında bir hata oluştu.', embeds: [], components: [], ephemeral: true });
        }
      } else if (i.customId === 'reddet') {
        await i.update({ content: '❌ Yasaklama işlemi iptal edildi.', embeds: [], components: [], ephemeral: true });
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({ content: '⏰ Zaman aşımı! İşlem iptal edildi.', embeds: [], components: [], ephemeral: true });
      }
    });
  }
};
