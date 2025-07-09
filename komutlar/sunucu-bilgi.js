const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucu-bilgi')
    .setDescription('Sunucunun bilgilerini gösterir.'),

  async execute(interaction) {
    const server = interaction.guild;

    const serverSize = server.memberCount;
    const botCount = server.members.cache.filter(m => m.user.bot).size;
    const aktif = server.members.cache.filter(member => member.presence && member.presence.status !== 'offline').size;
    const owner = await server.fetchOwner();

    function checkDays(date) {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / 86400000);
      return `${days} gün önce`;
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Sunucu Bilgisi')
      .setColor('White')
      .setThumbnail(server.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Sunucu İsmi', value: server.name, inline: true },
        { name: 'Sunucu ID', value: server.id, inline: true },
        { name: 'Sunucu Sahibi', value: owner.user.tag, inline: true },
        { name: 'Kuruluş Tarihi', value: checkDays(server.createdAt), inline: true },
        { name: 'Boost Sayısı', value: `${server.premiumSubscriptionCount}`, inline: true },
        { name: 'Aktif Üye Sayısı', value: `${aktif}`, inline: true },
        { name: 'Toplam Üye', value: `${serverSize - botCount}`, inline: true },
        { name: 'Toplam Bot', value: `${botCount}`, inline: true },
        { name: 'Rol Sayısı', value: `${server.roles.cache.size}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
